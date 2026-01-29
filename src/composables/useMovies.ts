/**
 * useMovies Composable - Local-First Data Access
 *
 * THE ARCHITECTURE:
 * This composable is the main way views access TV show data.
 * It implements a "local-first" pattern:
 *
 *   1. Always try to read from IndexedDB first (instant!)
 *   2. Fall back to API if local data is missing
 *   3. Cache any API responses for future use
 *
 * WHY LOCAL-FIRST?
 * - Instant load times (no network wait)
 * - Works offline
 * - Reduces API calls (respects rate limits)
 * - Better UX (data appears immediately)
 *
 * HOW GENRE GROUPING WORKS:
 * Since TVMaze has no genre endpoint, we:
 * 1. Fetch all shows (which include genres array)
 * 2. Store in IndexedDB with multi-entry index on genres
 * 3. Group shows by genre in the moviesByGenre computed property
 * 4. Sort each genre group by rating
 */

import { ref, computed } from 'vue'
import { db, type Show } from '@/db'
import { throttledFetch } from '@/services/rateLimiter'
import { syncShows, useSyncStatus } from '@/services/syncService'

export type { Show }
export type Movie = Show // Alias for backward compatibility

type SearchResult = {
  score: number
  show: Show
}

const API_URL = 'https://api.tvmaze.com/shows'
const SEARCH_API_URL = 'https://api.tvmaze.com/search/shows'

export function useMovies() {
  // Reactive state
  const movies = ref<Show[]>([])
  const searchResults = ref<Show[]>([])
  const currentMovie = ref<Show | null>(null)
  const loading = ref(false)
  const searchLoading = ref(false)

  // Sync status (for showing progress bar)
  const { isSyncing, syncProgress, syncMessage, syncError } = useSyncStatus()

  /**
   * Fetch all shows for the dashboard
   *
   * LOCAL-FIRST APPROACH:
   * 1. Check IndexedDB for cached shows
   * 2. If found → use them immediately, sync in background
   * 3. If empty → sync first, then load from cache
   */
  const fetchMovies = async () => {
    loading.value = true
    try {
      // Step 1: Try to load from local cache (instant!)
      const cachedShows = await db.shows.toArray()

      if (cachedShows.length > 0) {
        // We have cached data - use it immediately
        movies.value = cachedShows
        // Trigger background sync to check if data needs refresh
        syncShows().catch(console.error)
      } else {
        // No cached data - need to fetch from API first
        await syncShows()
        movies.value = await db.shows.toArray()
      }
    } catch (err) {
      console.error('Failed to fetch movies from cache:', err)
      // Fallback: direct API call if IndexedDB fails
      await fetchMoviesFromApi()
    } finally {
      loading.value = false
    }
  }

  /**
   * Direct API fetch (fallback when IndexedDB fails)
   */
  const fetchMoviesFromApi = async () => {
    try {
      const response = await fetch(API_URL)
      if (!response.ok) throw new Error('Failed to fetch TV shows')
      const data: Show[] = await response.json()
      movies.value = data
      // Try to cache for next time
      db.shows.bulkPut(data).catch(console.error)
    } catch (err) {
      if (err instanceof Error) {
        alert(err.message)
      }
    }
  }

  /**
   * Search shows using TVMaze's fuzzy search API
   *
   * WHY USE API FOR SEARCH?
   * TVMaze's search is fuzzy (handles typos) and searches ALL shows,
   * not just the ~500 we have cached. Results are cached for offline use.
   */
  const searchMoviesApi = async (query: string) => {
    if (!query.trim()) {
      searchResults.value = []
      return []
    }

    searchLoading.value = true
    try {
      // Use throttled fetch to respect rate limits
      const response = await throttledFetch(
        `${SEARCH_API_URL}?q=${encodeURIComponent(query)}`,
      )
      if (!response.ok) {
        throw new Error('Failed to search TV shows')
      }
      const data: SearchResult[] = await response.json()
      const shows = data.map((result) => result.show)
      searchResults.value = shows

      // Cache search results so they're available offline
      db.shows.bulkPut(shows).catch(console.error)

      return shows
    } catch (err) {
      console.error('Search API error:', err)
      // Network failed - fall back to searching cached data
      return searchMoviesLocal(query)
    } finally {
      searchLoading.value = false
    }
  }

  /**
   * Search locally in cached shows (works offline!)
   */
  const searchMoviesLocal = async (query: string): Promise<Show[]> => {
    if (!query.trim()) return []

    const q = query.toLowerCase()
    const results = await db.shows
      .filter((show) => show.name.toLowerCase().includes(q))
      .limit(50)
      .toArray()

    searchResults.value = results
    return results
  }

  /**
   * Fetch a single show by ID
   *
   * LOCAL-FIRST:
   * 1. Check IndexedDB first (might already have it from dashboard)
   * 2. If not found → fetch from API and cache it
   */
  const fetchMovieById = async (id: number) => {
    loading.value = true
    currentMovie.value = null
    try {
      // Step 1: Check local cache first
      const cached = await db.shows.get(id)
      if (cached) {
        currentMovie.value = cached
        loading.value = false
        return cached
      }

      // Step 2: Not in cache - fetch from API
      const response = await throttledFetch(`${API_URL}/${id}`)
      if (!response.ok) {
        throw new Error('Failed to fetch TV show details')
      }
      const data: Show = await response.json()
      currentMovie.value = data

      // Step 3: Cache for future visits
      db.shows.put(data).catch(console.error)

      return data
    } catch (err) {
      if (err instanceof Error) {
        alert(err.message)
      }
      return null
    } finally {
      loading.value = false
    }
  }

  /**
   * THE MAGIC: Group shows by genre and sort by rating
   *
   * THIS IS HOW WE SOLVE "NO GENRE ENDPOINT":
   *
   * Input: Array of shows, each with genres like ["Drama", "Crime"]
   * Output: Object like {
   *   "Drama": [show1, show2, ...],   // sorted by rating
   *   "Crime": [show3, show4, ...],   // sorted by rating
   *   "Comedy": [show5, show6, ...],  // sorted by rating
   * }
   *
   * A show with genres ["Drama", "Crime"] appears in BOTH lists!
   */
  const moviesByGenre = computed<Record<string, Show[]>>(() => {
    const moviesMap: Record<string, Show[]> = {}

    // Step 1: Group shows by each genre they belong to
    for (const movie of movies.value) {
      for (const genre of movie.genres) {
        if (!moviesMap[genre]) {
          moviesMap[genre] = []
        }
        // A show can appear in multiple genre lists
        moviesMap[genre].push(movie)
      }
    }

    // Step 2: Sort each genre's shows by rating (best first)
    for (const genre of Object.keys(moviesMap)) {
      moviesMap[genre]?.sort(
        (a, b) => (b.rating.average ?? 0) - (a.rating.average ?? 0),
      )
      // Limit to top 20 per genre for performance
      moviesMap[genre] = moviesMap[genre]?.slice(0, 20) || []
    }

    return moviesMap
  })

  /**
   * Quick synchronous search (for autocomplete, etc.)
   * Searches only currently loaded movies
   */
  const searchMovies = (query: string) => {
    if (!query) return []
    const q = query.toLowerCase()
    return movies.value.filter((movie) => movie.name.toLowerCase().includes(q))
  }

  return {
    // Data
    movies,
    moviesByGenre,
    searchResults,
    currentMovie,

    // Actions
    fetchMovies,
    fetchMovieById,
    searchMovies,
    searchMoviesApi,
    searchMoviesLocal,

    // Loading states
    loading,
    searchLoading,

    // Sync status (for progress UI)
    isSyncing,
    syncProgress,
    syncMessage,
    syncError,
  }
}
