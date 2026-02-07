import { ref, computed } from 'vue'
import { db, type Show } from '@/db'
import { throttledFetch } from '@/services/rateLimiter'
import { syncShows, useSyncStatus } from '@/services/syncService'
import { checkOnline } from '@/composables/useNetwork'

export type { Show }
export type Movie = Show // Alias for backward compatibility

type SearchResult = {
  score: number
  show: Show
}

const API_URL = 'https://api.tvmaze.com/shows'
const SEARCH_API_URL = 'https://api.tvmaze.com/search/shows'

// Singleton state - persists across navigation
const movies = ref<Show[]>([])
const searchResults = ref<Show[]>([])
const currentMovie = ref<Show | null>(null)
const loading = ref(false)
const searchLoading = ref(false)

export function useMovies() {
  const { isSyncing, syncProgress, syncMessage, syncError } = useSyncStatus()

  const fetchMovies = async () => {
    loading.value = true
    try {
      const cachedShows = await db.shows.toArray()

      if (cachedShows.length > 0) {
        movies.value = cachedShows
        syncShows().catch(console.error)
      } else {
        await syncShows()
        movies.value = await db.shows.toArray()
      }
    } catch (err) {
      console.error('Failed to fetch movies from cache:', err)
      await fetchMoviesFromApi()
    } finally {
      loading.value = false
    }
  }

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

  const searchMoviesApi = async (query: string) => {
    if (!query.trim()) {
      searchResults.value = []
      return []
    }

    if (!checkOnline()) {
      console.log('Offline - using local search')
      return searchMoviesLocal(query)
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

      db.shows.bulkPut(shows).catch(console.error)

      return shows
    } catch (err) {
      console.error('Search API error:', err)
      return searchMoviesLocal(query)
    } finally {
      searchLoading.value = false
    }
  }

  const searchMoviesLocal = async (query: string): Promise<Show[]> => {
    if (!query.trim()) return []

    const q = query.toLowerCase()
    const allCachedShows = await db.shows.toArray()
    const results = allCachedShows.filter((show) =>
      show.name.toLowerCase().includes(q)
    )

    searchResults.value = results
    return results
  }

  const fetchMovieById = async (id: number) => {
    loading.value = true
    currentMovie.value = null
    try {
      const cached = await db.shows.get(id)
      if (cached) {
        currentMovie.value = cached
        loading.value = false
        return cached
      }

      if (!checkOnline()) {
        console.log('Offline - show not in cache')
        loading.value = false
        return null
      }

      const response = await throttledFetch(`${API_URL}/${id}`)
      if (!response.ok) {
        throw new Error('Failed to fetch TV show details')
      }
      const data: Show = await response.json()
      currentMovie.value = data

      db.shows.put(data).catch(console.error)

      return data
    } catch (err) {
      if (checkOnline() && err instanceof Error) {
        alert(err.message)
      }
      return null
    } finally {
      loading.value = false
    }
  }

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

    for (const genre of Object.keys(moviesMap)) {
      moviesMap[genre]?.sort(
        (a, b) => (b.rating.average ?? 0) - (a.rating.average ?? 0),
      )
      moviesMap[genre] = moviesMap[genre]?.slice(0, 20) || []
    }

    return moviesMap
  })

  const searchMovies = (query: string) => {
    if (!query) return []
    const q = query.toLowerCase()
    return movies.value.filter((movie) => movie.name.toLowerCase().includes(q))
  }

  const fetchMoviesByGenre = async (genre: string): Promise<Show[]> => {
    if (!genre.trim()) {
      searchResults.value = []
      return []
    }

    searchLoading.value = true
    try {
      const shows = await db.shows
        .where('genres')
        .equals(genre)
        .toArray()

      shows.sort((a, b) => (b.rating.average ?? 0) - (a.rating.average ?? 0))

      searchResults.value = shows
      return shows
    } catch (err) {
      console.error('Failed to fetch movies by genre:', err)
      searchResults.value = []
      return []
    } finally {
      searchLoading.value = false
    }
  }

  return {
    movies,
    moviesByGenre,
    searchResults,
    currentMovie,

    fetchMovies,
    fetchMovieById,
    searchMovies,
    searchMoviesApi,
    searchMoviesLocal,
    fetchMoviesByGenre,

    loading,
    searchLoading,

    isSyncing,
    syncProgress,
    syncMessage,
    syncError,
  }
}
