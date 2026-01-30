import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { db, getSyncMeta, setSyncMeta, SYNC_KEYS } from '@/db'
import { createMockShow } from '../setup'

describe('Database (IndexedDB with Dexie)', () => {
  beforeEach(async () => {
    // Clear all tables before each test
    await db.shows.clear()
    await db.syncMeta.clear()
  })

  afterEach(async () => {
    await db.shows.clear()
    await db.syncMeta.clear()
  })

  describe('shows table', () => {
    it('should store and retrieve a show', async () => {
      const show = createMockShow({ id: 1, name: 'Test Show' })

      await db.shows.put(show)
      const retrieved = await db.shows.get(1)

      expect(retrieved).toBeDefined()
      expect(retrieved?.name).toBe('Test Show')
    })

    it('should store multiple shows with bulkPut', async () => {
      const shows = [
        createMockShow({ id: 1, name: 'Show 1' }),
        createMockShow({ id: 2, name: 'Show 2' }),
        createMockShow({ id: 3, name: 'Show 3' }),
      ]

      await db.shows.bulkPut(shows)
      const count = await db.shows.count()

      expect(count).toBe(3)
    })

    it('should update existing show with same id', async () => {
      const show = createMockShow({ id: 1, name: 'Original Name' })
      await db.shows.put(show)

      const updatedShow = { ...show, name: 'Updated Name' }
      await db.shows.put(updatedShow)

      const retrieved = await db.shows.get(1)
      expect(retrieved?.name).toBe('Updated Name')

      // Should still be only one record
      const count = await db.shows.count()
      expect(count).toBe(1)
    })

    it('should delete a show', async () => {
      const show = createMockShow({ id: 1 })
      await db.shows.put(show)

      await db.shows.delete(1)
      const retrieved = await db.shows.get(1)

      expect(retrieved).toBeUndefined()
    })

    it('should clear all shows', async () => {
      const shows = [
        createMockShow({ id: 1 }),
        createMockShow({ id: 2 }),
      ]
      await db.shows.bulkPut(shows)

      await db.shows.clear()
      const count = await db.shows.count()

      expect(count).toBe(0)
    })
  })

  describe('multi-entry genres index', () => {
    it('should query shows by single genre', async () => {
      const shows = [
        createMockShow({ id: 1, name: 'Drama Show', genres: ['Drama'] }),
        createMockShow({ id: 2, name: 'Comedy Show', genres: ['Comedy'] }),
        createMockShow({ id: 3, name: 'Mixed Show', genres: ['Drama', 'Comedy'] }),
      ]
      await db.shows.bulkPut(shows)

      const dramaShows = await db.shows.where('genres').equals('Drama').toArray()

      expect(dramaShows).toHaveLength(2)
      expect(dramaShows.map((s) => s.name)).toContain('Drama Show')
      expect(dramaShows.map((s) => s.name)).toContain('Mixed Show')
    })

    it('should find show in all its genres', async () => {
      const show = createMockShow({
        id: 1,
        name: 'Multi-Genre Show',
        genres: ['Drama', 'Comedy', 'Thriller'],
      })
      await db.shows.put(show)

      const inDrama = await db.shows.where('genres').equals('Drama').toArray()
      const inComedy = await db.shows.where('genres').equals('Comedy').toArray()
      const inThriller = await db.shows.where('genres').equals('Thriller').toArray()

      expect(inDrama).toHaveLength(1)
      expect(inComedy).toHaveLength(1)
      expect(inThriller).toHaveLength(1)
    })

    it('should return empty array for non-existent genre', async () => {
      const show = createMockShow({ id: 1, genres: ['Drama'] })
      await db.shows.put(show)

      const sciFiShows = await db.shows.where('genres').equals('Sci-Fi').toArray()

      expect(sciFiShows).toHaveLength(0)
    })

    it('should handle shows with empty genres array', async () => {
      const show = createMockShow({ id: 1, name: 'No Genre Show', genres: [] })
      await db.shows.put(show)

      const allShows = await db.shows.toArray()
      expect(allShows).toHaveLength(1)

      const dramaShows = await db.shows.where('genres').equals('Drama').toArray()
      expect(dramaShows).toHaveLength(0)
    })
  })

  describe('name index', () => {
    it('should query shows by name', async () => {
      const shows = [
        createMockShow({ id: 1, name: 'Breaking Bad' }),
        createMockShow({ id: 2, name: 'Better Call Saul' }),
      ]
      await db.shows.bulkPut(shows)

      const result = await db.shows.where('name').equals('Breaking Bad').first()

      expect(result?.id).toBe(1)
    })
  })

  describe('getSyncMeta and setSyncMeta helpers', () => {
    it('should return null for non-existent key', async () => {
      const value = await getSyncMeta('nonexistent')
      expect(value).toBeNull()
    })

    it('should set and get a string value', async () => {
      await setSyncMeta('testKey', 'testValue')
      const value = await getSyncMeta('testKey')

      expect(value).toBe('testValue')
    })

    it('should set and get a number value', async () => {
      const timestamp = Date.now()
      await setSyncMeta('lastSync', timestamp)
      const value = await getSyncMeta('lastSync')

      expect(value).toBe(timestamp)
    })

    it('should overwrite existing value', async () => {
      await setSyncMeta('key', 'first')
      await setSyncMeta('key', 'second')

      const value = await getSyncMeta('key')
      expect(value).toBe('second')
    })

    it('should work with SYNC_KEYS constants', async () => {
      const timestamp = Date.now()
      await setSyncMeta(SYNC_KEYS.LAST_FULL_SYNC, timestamp)

      const value = await getSyncMeta(SYNC_KEYS.LAST_FULL_SYNC)
      expect(value).toBe(timestamp)
    })
  })

  describe('syncMeta table', () => {
    it('should store multiple metadata entries', async () => {
      await db.syncMeta.bulkPut([
        { key: 'key1', value: 'value1' },
        { key: 'key2', value: 123 },
        { key: 'key3', value: 'value3' },
      ])

      const count = await db.syncMeta.count()
      expect(count).toBe(3)
    })

    it('should retrieve by key (primary key)', async () => {
      await db.syncMeta.put({ key: 'testKey', value: 'testValue' })

      const entry = await db.syncMeta.get('testKey')
      expect(entry?.value).toBe('testValue')
    })
  })

  describe('SYNC_KEYS constants', () => {
    it('should have expected keys', () => {
      expect(SYNC_KEYS.LAST_FULL_SYNC).toBe('lastFullSync')
      expect(SYNC_KEYS.LAST_UPDATE_CHECK).toBe('lastUpdateCheck')
      expect(SYNC_KEYS.SYNC_IN_PROGRESS).toBe('syncInProgress')
      expect(SYNC_KEYS.TOTAL_SHOWS).toBe('totalShows')
    })
  })

  describe('database transactions', () => {
    it('should handle concurrent writes', async () => {
      const shows = Array.from({ length: 100 }, (_, i) =>
        createMockShow({ id: i + 1, name: `Show ${i + 1}` }),
      )

      // Simulate concurrent writes
      await Promise.all([
        db.shows.bulkPut(shows.slice(0, 50)),
        db.shows.bulkPut(shows.slice(50, 100)),
      ])

      const count = await db.shows.count()
      expect(count).toBe(100)
    })
  })

  describe('filter operations', () => {
    it('should filter shows using custom function', async () => {
      const shows = [
        createMockShow({ id: 1, name: 'Show A', rating: { average: 9 } }),
        createMockShow({ id: 2, name: 'Show B', rating: { average: 6 } }),
        createMockShow({ id: 3, name: 'Show C', rating: { average: 8 } }),
      ]
      await db.shows.bulkPut(shows)

      const highRated = await db.shows
        .filter((show) => (show.rating.average ?? 0) >= 8)
        .toArray()

      expect(highRated).toHaveLength(2)
      expect(highRated.map((s) => s.name)).toContain('Show A')
      expect(highRated.map((s) => s.name)).toContain('Show C')
    })

    it('should limit results', async () => {
      const shows = Array.from({ length: 20 }, (_, i) =>
        createMockShow({ id: i + 1, name: `Show ${i + 1}` }),
      )
      await db.shows.bulkPut(shows)

      const limited = await db.shows.limit(5).toArray()

      expect(limited).toHaveLength(5)
    })
  })
})
