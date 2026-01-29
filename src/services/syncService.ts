import { ref, readonly } from 'vue'
import { db, getSyncMeta, setSyncMeta, SYNC_KEYS, type Show } from '@/db'
import { throttledFetch } from './rateLimiter'

const API_BASE = 'https://api.tvmaze.com'

// Sync state - reactive for UI binding
const isSyncing = ref(false)
const syncProgress = ref(0) // 0-100
const syncMessage = ref('')
const syncError = ref<string | null>(null)

// Time thresholds for update sync strategy
const ONE_DAY_MS = 24 * 60 * 60 * 1000
const ONE_WEEK_MS = 7 * ONE_DAY_MS

export type SyncStatus = {
  isSyncing: boolean
  progress: number
  message: string
  error: string | null
}

export function useSyncStatus() {
  return {
    isSyncing: readonly(isSyncing),
    syncProgress: readonly(syncProgress),
    syncMessage: readonly(syncMessage),
    syncError: readonly(syncError),
  }
}

/**
 * Main sync function - call on app startup
 * Determines whether to do initial sync or update sync
 */
export async function syncShows(): Promise<void> {
  if (isSyncing.value) {
    console.log('Sync already in progress')
    return
  }

  try {
    isSyncing.value = true
    syncError.value = null

    const lastFullSync = (await getSyncMeta(SYNC_KEYS.LAST_FULL_SYNC)) as number | null
    const showCount = await db.shows.count()

    if (!lastFullSync || showCount === 0) {
      // First time - do full sync
      await performInitialSync()
    } else {
      // Check for updates
      await performUpdateSync(lastFullSync)
    }

    syncProgress.value = 100
    syncMessage.value = 'Sync complete'
  } catch (error) {
    console.error('Sync failed:', error)
    syncError.value = error instanceof Error ? error.message : 'Unknown sync error'
  } finally {
    isSyncing.value = false
  }
}

/**
 * Initial sync - fetches all shows page by page
 * TVmaze returns ~250 shows per page, 404 when no more pages
 */
async function performInitialSync(): Promise<void> {
  syncMessage.value = 'Starting initial sync...'
  syncProgress.value = 0

  let page = 0
  let totalFetched = 0
  let hasMorePages = true

  while (hasMorePages) {
    syncMessage.value = `Fetching page ${page + 1}...`

    try {
      const response = await throttledFetch(`${API_BASE}/shows?page=${page}`)

      if (response.status === 404) {
        // No more pages
        hasMorePages = false
        break
      }

      if (!response.ok) {
        throw new Error(`Failed to fetch page ${page}: ${response.status}`)
      }

      const shows: Show[] = await response.json()

      if (shows.length === 0) {
        hasMorePages = false
        break
      }

      // Bulk insert shows
      await db.shows.bulkPut(shows)
      totalFetched += shows.length

      // Estimate progress (assume ~150 pages total based on typical TVmaze data)
      syncProgress.value = Math.min(95, Math.round((page / 150) * 100))
      syncMessage.value = `Synced ${totalFetched} shows...`

      page++
    } catch (error) {
      // If it's a 404, we've reached the end
      if (error instanceof Error && error.message.includes('404')) {
        hasMorePages = false
      } else {
        throw error
      }
    }
  }

  // Record sync completion
  await setSyncMeta(SYNC_KEYS.LAST_FULL_SYNC, Date.now())
  await setSyncMeta(SYNC_KEYS.TOTAL_SHOWS, totalFetched)

  syncMessage.value = `Initial sync complete: ${totalFetched} shows`
  console.log(`Initial sync complete: ${totalFetched} shows`)
}

/**
 * Update sync - checks /updates/shows and re-fetches changed shows
 */
async function performUpdateSync(lastSync: number): Promise<void> {
  const now = Date.now()
  const timeSinceSync = now - lastSync

  // Determine update window based on time since last sync
  let since: 'day' | 'week' | 'month'
  if (timeSinceSync < ONE_DAY_MS) {
    since = 'day'
  } else if (timeSinceSync < ONE_WEEK_MS) {
    since = 'week'
  } else {
    since = 'month'
  }

  syncMessage.value = `Checking for updates (${since})...`
  syncProgress.value = 10

  try {
    const response = await throttledFetch(`${API_BASE}/updates/shows?since=${since}`)

    if (!response.ok) {
      throw new Error(`Failed to fetch updates: ${response.status}`)
    }

    // Response is { showId: timestamp, ... }
    const updates: Record<string, number> = await response.json()
    const updatedIds = Object.entries(updates)
      .filter(([, timestamp]) => timestamp * 1000 > lastSync) // API returns seconds, we store ms
      .map(([id]) => parseInt(id, 10))

    if (updatedIds.length === 0) {
      syncMessage.value = 'No updates found'
      await setSyncMeta(SYNC_KEYS.LAST_FULL_SYNC, Date.now())
      return
    }

    syncMessage.value = `Updating ${updatedIds.length} shows...`
    syncProgress.value = 30

    // Fetch updated shows in batches to avoid overwhelming the API
    const batchSize = 10
    let processed = 0

    for (let i = 0; i < updatedIds.length; i += batchSize) {
      const batch = updatedIds.slice(i, i + batchSize)

      // Fetch each show in the batch
      const fetchPromises = batch.map(async (id) => {
        try {
          const showResponse = await throttledFetch(`${API_BASE}/shows/${id}`)
          if (showResponse.ok) {
            const show: Show = await showResponse.json()
            await db.shows.put(show)
          }
        } catch (error) {
          console.warn(`Failed to update show ${id}:`, error)
        }
      })

      await Promise.all(fetchPromises)
      processed += batch.length
      syncProgress.value = 30 + Math.round((processed / updatedIds.length) * 65)
      syncMessage.value = `Updated ${processed}/${updatedIds.length} shows...`
    }

    await setSyncMeta(SYNC_KEYS.LAST_FULL_SYNC, Date.now())
    syncMessage.value = `Update complete: ${updatedIds.length} shows updated`
    console.log(`Update sync complete: ${updatedIds.length} shows updated`)
  } catch (error) {
    console.error('Update sync failed:', error)
    throw error
  }
}

/**
 * Force a full re-sync (clear and re-fetch all data)
 */
export async function forceFullSync(): Promise<void> {
  await db.shows.clear()
  await db.syncMeta.clear()
  await syncShows()
}

/**
 * Get last sync timestamp
 */
export async function getLastSyncTime(): Promise<Date | null> {
  const timestamp = (await getSyncMeta(SYNC_KEYS.LAST_FULL_SYNC)) as number | null
  return timestamp ? new Date(timestamp) : null
}
