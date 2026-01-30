import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { setOnlineStatus, createMockShows, createMockResponse } from '../setup'
import { db } from '@/db'

describe('syncService', () => {
  let syncShows: typeof import('@/services/syncService').syncShows
  let useSyncStatus: typeof import('@/services/syncService').useSyncStatus
  let isCacheStale: typeof import('@/services/syncService').isCacheStale
  let refreshDashboard: typeof import('@/services/syncService').refreshDashboard
  let getLastSyncTime: typeof import('@/services/syncService').getLastSyncTime

  beforeEach(async () => {
    setOnlineStatus(true)

    // Clear database
    await db.shows.clear()
    await db.syncMeta.clear()

    // Reset modules to get fresh state
    vi.resetModules()
    const module = await import('@/services/syncService')
    syncShows = module.syncShows
    useSyncStatus = module.useSyncStatus
    isCacheStale = module.isCacheStale
    refreshDashboard = module.refreshDashboard
    getLastSyncTime = module.getLastSyncTime
  })

  afterEach(async () => {
    await db.shows.clear()
    await db.syncMeta.clear()
  })

  describe('syncShows', () => {
    it('should skip sync when offline', async () => {
      setOnlineStatus(false)

      const mockFetch = vi.fn()
      vi.stubGlobal('fetch', mockFetch)

      await syncShows()

      const { syncMessage } = useSyncStatus()

      expect(syncMessage.value).toBe('Offline mode')
      expect(mockFetch).not.toHaveBeenCalled()
    })

    it('should use cached data when cache is fresh', async () => {
      // Pre-populate cache with shows and a recent sync timestamp
      const mockShows = createMockShows(5)
      await db.shows.bulkPut(mockShows)
      await db.syncMeta.put({ key: 'lastFullSync', value: Date.now() })

      const mockFetch = vi.fn()
      vi.stubGlobal('fetch', mockFetch)

      await syncShows()

      const { syncMessage } = useSyncStatus()

      expect(syncMessage.value).toBe('Using cached data')
      expect(mockFetch).not.toHaveBeenCalled()
    })

    it('should not run multiple syncs simultaneously', async () => {
      // Pre-populate with fresh cache to avoid actual fetch
      const mockShows = createMockShows(5)
      await db.shows.bulkPut(mockShows)
      await db.syncMeta.put({ key: 'lastFullSync', value: Date.now() })

      // Start first sync
      const sync1 = syncShows()

      // Try to start second sync
      const sync2 = syncShows()

      await Promise.all([sync1, sync2])

      // Both should complete without error
    })
  })

  describe('useSyncStatus', () => {
    it('should return readonly refs', () => {
      const { isSyncing, syncProgress, syncMessage, syncError } = useSyncStatus()

      expect(isSyncing.value).toBe(false)
      expect(syncProgress.value).toBe(0)
      expect(typeof syncMessage.value).toBe('string')
      expect(syncError.value).toBeNull()
    })
  })

  describe('isCacheStale', () => {
    it('should return true when no sync has occurred', async () => {
      const stale = await isCacheStale()
      expect(stale).toBe(true)
    })

    it('should return false when sync is recent', async () => {
      await db.syncMeta.put({ key: 'lastFullSync', value: Date.now() })

      const stale = await isCacheStale()
      expect(stale).toBe(false)
    })

    it('should return true when sync is older than 1 hour', async () => {
      const twoHoursAgo = Date.now() - 2 * 60 * 60 * 1000
      await db.syncMeta.put({ key: 'lastFullSync', value: twoHoursAgo })

      const stale = await isCacheStale()
      expect(stale).toBe(true)
    })
  })

  describe('refreshDashboard', () => {
    it('should return error when offline', async () => {
      setOnlineStatus(false)

      await refreshDashboard()

      const { syncError } = useSyncStatus()
      expect(syncError.value).toBe('Cannot refresh while offline')
    })
  })

  describe('getLastSyncTime', () => {
    it('should return null when no sync has occurred', async () => {
      const lastSync = await getLastSyncTime()
      expect(lastSync).toBeNull()
    })

    it('should return Date when sync has occurred', async () => {
      const now = Date.now()
      await db.syncMeta.put({ key: 'lastFullSync', value: now })

      const lastSync = await getLastSyncTime()
      expect(lastSync).toBeInstanceOf(Date)
      expect(lastSync?.getTime()).toBe(now)
    })
  })
})
