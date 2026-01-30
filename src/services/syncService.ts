/**
 * Sync Service - Fetches TV shows from TVMaze API and stores them locally
 *
 * WHY DO WE NEED THIS?
 * The TVMaze API has rate limits (max 20 requests per 10 seconds).
 * Instead of hitting the API every time the user visits the app,
 * we fetch the data ONCE and store it in IndexedDB.
 *
 * HOW IT WORKS:
 * 1. On first visit: Fetch ~500 shows from API, store in IndexedDB
 * 2. On return visits: Use cached data (instant load!)
 * 3. If cache is older than 1 hour: Refresh in background
 *
 * OFFLINE SUPPORT:
 * - If offline, skip sync and use cached data
 * - No error shown when offline (it's expected behavior)
 *
 * This gives us:
 * - Fast load times (data is already in browser)
 * - Offline support (works without internet)
 * - No rate limit issues (we barely hit the API)
 */

import { ref, readonly } from 'vue'
import { db, getSyncMeta, setSyncMeta, SYNC_KEYS, type Show } from '@/db'
import { throttledFetch } from './rateLimiter'
import { checkOnline } from '@/composables/useNetwork'

const API_BASE = 'https://api.tvmaze.com'

/**
 * How many pages to fetch from /shows endpoint
 * Each page has ~250 shows, so 2 pages = ~500 shows
 * This is plenty for a nice dashboard with all genres represented
 */
const MAX_PAGES = 2

// Reactive state for showing sync progress in the UI
const isSyncing = ref(false)
const syncProgress = ref(0)
const syncMessage = ref('')
const syncError = ref<string | null>(null)

// Don't re-fetch if data is less than 1 hour old
const CACHE_DURATION_MS = 60 * 60 * 1000

export type SyncStatus = {
  isSyncing: boolean
  progress: number
  message: string
  error: string | null
}

/**
 * Vue composable to access sync status from any component
 * Used by SyncStatus.vue to show the progress bar
 */
export function useSyncStatus() {
  return {
    isSyncing: readonly(isSyncing),
    syncProgress: readonly(syncProgress),
    syncMessage: readonly(syncMessage),
    syncError: readonly(syncError),
  }
}

/**
 * Main sync function - call this when the app starts
 *
 * Logic:
 * - If offline → skip sync, use cached data
 * - If we have fresh cached data → use it, don't fetch
 * - If cache is stale or empty → fetch from API
 */
export async function syncShows(): Promise<void> {
  // Don't run multiple syncs at once
  if (isSyncing.value) {
    console.log('Sync already in progress')
    return
  }

  // OFFLINE CHECK: Skip sync if offline, use cached data
  if (!checkOnline()) {
    console.log('Offline - using cached data')
    syncMessage.value = 'Offline mode'
    // Don't set error - being offline is normal
    return
  }

  try {
    isSyncing.value = true
    syncError.value = null

    // Check: when did we last sync?
    const lastSync = (await getSyncMeta(SYNC_KEYS.LAST_FULL_SYNC)) as number | null
    const showCount = await db.shows.count()

    // If we have data and it's fresh (< 1 hour old), skip the fetch
    if (lastSync && showCount > 0 && Date.now() - lastSync < CACHE_DURATION_MS) {
      // console.log('Cache is fresh, skipping sync')
      syncProgress.value = 100
      syncMessage.value = 'Using cached data'
      isSyncing.value = false
      return
    }

    // Cache is stale or empty - fetch fresh data
    await fetchDashboardShows()

    syncProgress.value = 100
    syncMessage.value = 'Sync complete'
  } catch (error) {
    console.error('Sync failed:', error)
    // Only show error if we're online (network errors when online = real problem)
    if (checkOnline()) {
      syncError.value = error instanceof Error ? error.message : 'Unknown sync error'
    }
  } finally {
    isSyncing.value = false
  }
}

/**
 * Fetch shows from TVMaze API
 *
 * THE KEY INSIGHT:
 * TVMaze's /shows endpoint returns paginated data with ALL show info,
 * including the genres array. We fetch a couple pages and store everything
 * in IndexedDB. Then our multi-entry index on 'genres' lets us query
 * by genre locally - solving the "no genre endpoint" problem!
 */
async function fetchDashboardShows(): Promise<void> {
  syncMessage.value = 'Loading shows...'
  syncProgress.value = 0

  let totalFetched = 0

  // Fetch page 0, then page 1 (each has ~250 shows)
  for (let page = 0; page < MAX_PAGES; page++) {
    // Check if we went offline during sync
    if (!checkOnline()) {
      // console.log('Went offline during sync, stopping')
      syncMessage.value = 'Sync paused (offline)'
      break
    }

    syncMessage.value = `Loading page ${page + 1}/${MAX_PAGES}...`

    try {
      // Use throttled fetch to respect rate limits
      const response = await throttledFetch(`${API_BASE}/shows?page=${page}`)

      // 404 means no more pages exist
      if (response.status === 404) {
        break
      }

      if (!response.ok) {
        throw new Error(`Failed to fetch page ${page}: ${response.status}`)
      }

      // Parse the JSON - array of shows with their genres
      const shows: Show[] = await response.json()

      if (shows.length === 0) {
        break
      }

      /**
       * Store shows in IndexedDB
       *
       * bulkPut = insert or update multiple records at once
       * This is where the magic happens - each show's genres array
       * gets indexed by our multi-entry index, enabling genre queries!
       */
      await db.shows.bulkPut(shows)
      totalFetched += shows.length

      // Update progress bar
      syncProgress.value = Math.round(((page + 1) / MAX_PAGES) * 90)
    } catch (error) {
      // If we're offline now, don't treat it as an error
      if (!checkOnline()) {
        console.log('Network error (offline)')
        syncMessage.value = 'Offline - using cached data'
        break
      }
      if (error instanceof Error && error.message.includes('404')) {
        break
      }
      throw error
    }
  }

  // Only record sync completion if we actually fetched something
  if (totalFetched > 0) {
    await setSyncMeta(SYNC_KEYS.LAST_FULL_SYNC, Date.now())
    await setSyncMeta(SYNC_KEYS.TOTAL_SHOWS, totalFetched)
    syncMessage.value = `Loaded ${totalFetched} shows`
    console.log(`Dashboard sync complete: ${totalFetched} shows`)
  }
}

/**
 * Force a refresh of the dashboard data
 * (invalidates cache and re-fetches)
 */
export async function refreshDashboard(): Promise<void> {
  if (!checkOnline()) {
    syncError.value = 'Cannot refresh while offline'
    return
  }
  await setSyncMeta(SYNC_KEYS.LAST_FULL_SYNC, 0)
  await syncShows()
}

/**
 * Clear all data and start fresh
 */
export async function clearAndSync(): Promise<void> {
  await db.shows.clear()
  await db.syncMeta.clear()
  await syncShows()
}

/**
 * Get the last sync timestamp (for debugging/UI)
 */
export async function getLastSyncTime(): Promise<Date | null> {
  const timestamp = (await getSyncMeta(SYNC_KEYS.LAST_FULL_SYNC)) as number | null
  return timestamp ? new Date(timestamp) : null
}

/**
 * Check if our cache is stale (older than 1 hour)
 */
export async function isCacheStale(): Promise<boolean> {
  const lastSync = (await getSyncMeta(SYNC_KEYS.LAST_FULL_SYNC)) as number | null
  if (!lastSync) return true
  return Date.now() - lastSync > CACHE_DURATION_MS
}
