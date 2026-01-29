/**
 * IndexedDB Database Setup using Dexie.js
 *
 * THE PROBLEM:
 * TVMaze API has NO endpoint like `/shows?genre=Drama` to get shows by genre.
 * The only way to get genre data is from the `/shows` endpoint which returns
 * ALL shows with their genres array, like:
 *   { id: 1, name: "Breaking Bad", genres: ["Drama", "Crime", "Thriller"], ... }
 *
 * THE SOLUTION:
 * 1. Fetch shows from `/shows` endpoint (which includes genres)
 * 2. Store them locally in IndexedDB (browser database)
 * 3. Create a special "multi-entry index" on the genres array
 * 4. Now we can query "all Drama shows" instantly from local storage!
 *
 * This is much faster than filtering 500 shows in JavaScript every time,
 * and works offline too!
 */

import Dexie, { type Table } from 'dexie'

// Shape of a TV show from the TVMaze API
export interface Show {
  id: number
  name: string
  genres: string[] // e.g. ["Drama", "Crime", "Thriller"]
  rating: { average: number | null }
  image?: { medium: string; original: string }
  summary?: string
  premiered?: string
  updated?: number
}

// For tracking when we last synced data
export interface SyncMeta {
  key: string
  value: number | string
}

/**
 * Our IndexedDB database definition
 *
 * Think of it like a mini SQL database in the browser:
 * - "shows" table stores all TV shows
 * - "syncMeta" table stores sync timestamps
 */
export class TVShowsDB extends Dexie {
  shows!: Table<Show, number>
  syncMeta!: Table<SyncMeta, string>

  constructor() {
    super('tvshows')

    // Define tables and their indexes
    this.version(1).stores({
      /**
       * shows table indexes:
       *
       * 'id'            - Primary key (unique identifier for each show)
       * 'name'          - Index for searching by show name
       * '*genres'       - MULTI-ENTRY INDEX (the magic sauce!)
       * 'rating.average' - Index for sorting by rating
       *
       * THE MAGIC OF *genres:
       * The asterisk (*) creates a "multi-entry index". This means:
       *
       * If a show has genres: ["Drama", "Crime", "Thriller"]
       * IndexedDB creates THREE index entries:
       *   "Drama"    → points to this show
       *   "Crime"    → points to this show
       *   "Thriller" → points to this show
       *
       * Now we can query: db.shows.where('genres').equals('Drama')
       * And instantly get all shows that have "Drama" in their genres array!
       *
       * This is how we "build our own" genre filtering since TVMaze
       * doesn't provide a genre endpoint.
       */
      shows: 'id, name, *genres, rating.average',
      syncMeta: 'key',
    })
  }
}

// Create a single database instance for the whole app
export const db = new TVShowsDB()

// Helper: Get a sync metadata value
export async function getSyncMeta(key: string): Promise<string | number | null> {
  const meta = await db.syncMeta.get(key)
  return meta?.value ?? null
}

// Helper: Set a sync metadata value
export async function setSyncMeta(key: string, value: string | number): Promise<void> {
  await db.syncMeta.put({ key, value })
}

// Keys for tracking sync state
export const SYNC_KEYS = {
  LAST_FULL_SYNC: 'lastFullSync', // When did we last fetch from API?
  LAST_UPDATE_CHECK: 'lastUpdateCheck',
  SYNC_IN_PROGRESS: 'syncInProgress',
  TOTAL_SHOWS: 'totalShows',
} as const
