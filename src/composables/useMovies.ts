import { ref, computed } from 'vue'
import { db, type Show } from '@/db'
import { throttledFetch } from '@/services/rateLimiter'
import { syncShows, useSyncStatus } from '@/services/syncService'

// Re-export Show type for convenience
export type { Show }

// Alias for backward compatibility
export type Movie = Show

type SearchResult = {
  score: number
  show: Show
}

const API_URL = 'https://api.tvmaze.com/shows'
const SEARCH_API_URL = 'https://api.tvmaze.com/search/shows'

export function useMovies() {
  const movies = ref<Show[]>([])
  const searchResults = ref<Show[]>([])
  const currentMovie = ref<Show | null>(null)
  const loading = ref(false)
  const searchLoading = ref(false)

  // Expose sync status
  const { isSyncing, syncProgress, syncMessage, syncError } = useSyncStatus()

  /**
   * Fetch movies from IndexedDB (local-first)
   * Triggers sync if database is empty
   */
  const fetchMovies = async () => {
    loading.value = true
    try {
      // First, try to load from IndexedDB
      const localShows = await db.shows.toArray()

      if (localShows.length > 0) {
        movies.value = localShows
        // Trigger background sync to check for updates
        syncShows().catch(console.error)
      } else {
        // No local data - need to sync first
        await syncShows()
        movies.value = await db.shows.toArray()
      }
    } catch (err) {
      console.error('Failed to fetch movies:', err)
      // Fallback to API if IndexedDB fails
      try {
        const response = await fetch(API_URL)
        if (response.ok) {
          const data: Show[] = await response.json()
          movies.value = data
          // Try to save to IndexedDB
          await db.shows.bulkPut(data).catch(console.error)
        }
      } catch (apiErr) {
        if (apiErr instanceof Error) {
          alert(apiErr.message)
        }
      }
    } finally {
      loading.value = false
    }
  }

  /**
   * Search shows via API (fuzzy search)
   * Results are cached to IndexedDB
   */
  const searchMoviesApi = async (query: string) => {
    if (!query.trim()) {
      searchResults.value = []
      return []
    }

    searchLoading.value = true
    try {
      const response = await throttledFetch(
        `${SEARCH_API_URL}?q=${encodeURIComponent(query)}`,
      )
      if (!response.ok) {
        throw new Error('Failed to search TV shows')
      }
      const data: SearchResult[] = await response.json()
      const shows = data.map((result) => result.show)
      searchResults.value = shows

      // Cache search results to IndexedDB
      await db.shows.bulkPut(shows).catch(console.error)

      return shows
    } catch (err) {
      if (err instanceof Error) {
        console.error('Search API error:', err.message)
        // Fall back to local search on API failure
        return searchMoviesLocal(query)
      }
      return []
    } finally {
      searchLoading.value = false
    }
  }

  /**
   * Local search in IndexedDB
   * Uses case-insensitive partial matching
   */
  const searchMoviesLocal = async (query: string): Promise<Show[]> => {
    if (!query.trim()) return []

    const q = query.toLowerCase()

    // Use Dexie's filter for flexible matching
    const results = await db.shows
      .filter((show) => show.name.toLowerCase().includes(q))
      .limit(50)
      .toArray()

    searchResults.value = results
    return results
  }

  /**
   * Fetch a single movie by ID
   * Checks IndexedDB first, falls back to API
   */
  const fetchMovieById = async (id: number) => {
    loading.value = true
    currentMovie.value = null
    try {
      // Try IndexedDB first
      const localShow = await db.shows.get(id)

      if (localShow) {
        currentMovie.value = localShow
        return localShow
      }

      // Not in cache - fetch from API
      const response = await throttledFetch(`${API_URL}/${id}`)
      if (!response.ok) {
        throw new Error('Failed to fetch TV show details')
      }
      const data: Show = await response.json()
      currentMovie.value = data

      // Cache to IndexedDB
      await db.shows.put(data).catch(console.error)

      return data
    } catch (err) {
      if (err instanceof Error) {
        alert(err.message)
      } else {
        alert('Unknown error')
      }
      return null
    } finally {
      loading.value = false
    }
  }

  /**
   * Get movies grouped by genre from IndexedDB
   * Uses the multi-entry genre index for efficient queries
   */
  const moviesByGenre = computed<Record<string, Show[]>>(() => {
    const moviesMap: Record<string, Show[]> = {}

    for (const movie of movies.value) {
      for (const genre of movie.genres) {
        if (!moviesMap[genre]) {
          moviesMap[genre] = []
        }
        moviesMap[genre].push(movie)
      }
    }

    // Sort by rating and limit per genre
    for (const genre of Object.keys(moviesMap)) {
      moviesMap[genre]?.sort(
        (a, b) => (b.rating.average ?? 0) - (a.rating.average ?? 0),
      )
      moviesMap[genre] = moviesMap[genre]?.slice(0, 20) || []
    }

    return moviesMap
  })

  /**
   * Quick local search (synchronous, searches loaded movies)
   */
  const searchMovies = (query: string) => {
    if (!query) return []

    const q = query.toLowerCase()

    return movies.value.filter((movie) => movie.name.toLowerCase().includes(q))
  }

  /**
   * Get shows by genre from IndexedDB using the index
   */
  const getShowsByGenre = async (genre: string, limit = 20): Promise<Show[]> => {
    return await db.shows
      .where('genres')
      .equals(genre)
      .limit(limit)
      .sortBy('rating.average')
      .then((shows) => shows.reverse()) // Sort descending
  }

  /**
   * Get total show count from IndexedDB
   */
  const getTotalShowCount = async (): Promise<number> => {
    return await db.shows.count()
  }

  return {
    movies,
    moviesByGenre,
    fetchMovies,
    searchMovies,
    searchMoviesApi,
    searchMoviesLocal,
    fetchMovieById,
    searchResults,
    currentMovie,
    loading,
    searchLoading,
    // New local-first utilities
    getShowsByGenre,
    getTotalShowCount,
    // Sync status
    isSyncing,
    syncProgress,
    syncMessage,
    syncError,
  }
}
