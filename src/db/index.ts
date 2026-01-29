import Dexie, { type Table } from 'dexie'

export interface Show {
  id: number
  name: string
  genres: string[]
  rating: { average: number | null }
  image?: { medium: string; original: string }
  summary?: string
  premiered?: string
  updated?: number // timestamp from API
}

export interface SyncMeta {
  key: string
  value: number | string
}

export class TVShowsDB extends Dexie {
  shows!: Table<Show, number>
  syncMeta!: Table<SyncMeta, string>

  constructor() {
    super('tvshows')
    this.version(1).stores({
      // id = primary key
      // name = index for local search
      // *genres = multi-entry index for genre queries
      // rating.average = index for sorting by rating
      shows: 'id, name, *genres, rating.average',
      syncMeta: 'key',
    })
  }
}

export const db = new TVShowsDB()

// Helper functions for sync metadata
export async function getSyncMeta(key: string): Promise<string | number | null> {
  const meta = await db.syncMeta.get(key)
  return meta?.value ?? null
}

export async function setSyncMeta(key: string, value: string | number): Promise<void> {
  await db.syncMeta.put({ key, value })
}

// Sync metadata keys
export const SYNC_KEYS = {
  LAST_FULL_SYNC: 'lastFullSync',
  LAST_UPDATE_CHECK: 'lastUpdateCheck',
  SYNC_IN_PROGRESS: 'syncInProgress',
  TOTAL_SHOWS: 'totalShows',
} as const
