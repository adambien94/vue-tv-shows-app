import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { setOnlineStatus, createMockShow, createMockShows } from '../setup'
import { db } from '@/db'

describe('useMovies', () => {
  let useMovies: typeof import('@/composables/useMovies').useMovies

  beforeEach(async () => {
    setOnlineStatus(true)

    // Clear database
    await db.shows.clear()
    await db.syncMeta.clear()

    // Reset modules to get fresh state
    vi.resetModules()
    const module = await import('@/composables/useMovies')
    useMovies = module.useMovies
  })

  afterEach(async () => {
    await db.shows.clear()
    await db.syncMeta.clear()
  })

  describe('fetchMovies', () => {
    it('should load movies from IndexedDB cache first', async () => {
      // Pre-populate cache
      const cachedShows = createMockShows(5)
      await db.shows.bulkPut(cachedShows)

      const mockFetch = vi.fn()
      vi.stubGlobal('fetch', mockFetch)

      const { movies, fetchMovies } = useMovies()

      await fetchMovies()

      // Movies should be loaded from cache
      expect(movies.value.length).toBe(5)
    })

    it('should set loading state correctly', async () => {
      const cachedShows = createMockShows(5)
      await db.shows.bulkPut(cachedShows)

      const { loading, fetchMovies } = useMovies()

      expect(loading.value).toBe(false)

      const fetchPromise = fetchMovies()
      // Loading should be true during fetch
      expect(loading.value).toBe(true)

      await fetchPromise
      expect(loading.value).toBe(false)
    })
  })

  describe('fetchMovieById', () => {
    it('should return movie from cache if available', async () => {
      const show = createMockShow({ id: 123, name: 'Cached Show' })
      await db.shows.put(show)

      const mockFetch = vi.fn()
      vi.stubGlobal('fetch', mockFetch)

      const { fetchMovieById, currentMovie } = useMovies()

      const result = await fetchMovieById(123)

      expect(result?.name).toBe('Cached Show')
      expect(currentMovie.value?.name).toBe('Cached Show')
      // Should not have called API since it was in cache
      expect(mockFetch).not.toHaveBeenCalled()
    })

    it('should return null when offline and not in cache', async () => {
      setOnlineStatus(false)

      const { fetchMovieById, currentMovie } = useMovies()

      const result = await fetchMovieById(999)

      expect(result).toBeNull()
      expect(currentMovie.value).toBeNull()
    })
  })

  describe('moviesByGenre', () => {
    it('should group movies by genre', async () => {
      const shows = [
        createMockShow({ id: 1, name: 'Drama 1', genres: ['Drama'], rating: { average: 9 } }),
        createMockShow({ id: 2, name: 'Drama 2', genres: ['Drama'], rating: { average: 8 } }),
        createMockShow({ id: 3, name: 'Comedy 1', genres: ['Comedy'], rating: { average: 7 } }),
      ]

      const { movies, moviesByGenre } = useMovies()
      movies.value = shows

      expect(moviesByGenre.value['Drama']).toHaveLength(2)
      expect(moviesByGenre.value['Comedy']).toHaveLength(1)
    })

    it('should include show in multiple genre lists', async () => {
      const show = createMockShow({
        id: 1,
        name: 'Multi-genre Show',
        genres: ['Drama', 'Comedy', 'Thriller'],
        rating: { average: 8 },
      })

      const { movies, moviesByGenre } = useMovies()
      movies.value = [show]

      expect(moviesByGenre.value['Drama']).toHaveLength(1)
      expect(moviesByGenre.value['Comedy']).toHaveLength(1)
      expect(moviesByGenre.value['Thriller']).toHaveLength(1)
    })

    it('should sort each genre by rating (best first)', async () => {
      const shows = [
        createMockShow({ id: 1, name: 'Low Rated', genres: ['Drama'], rating: { average: 5 } }),
        createMockShow({ id: 2, name: 'High Rated', genres: ['Drama'], rating: { average: 9 } }),
        createMockShow({ id: 3, name: 'Mid Rated', genres: ['Drama'], rating: { average: 7 } }),
      ]

      const { movies, moviesByGenre } = useMovies()
      movies.value = shows

      const dramaShows = moviesByGenre.value['Drama']
      expect(dramaShows?.[0]?.name).toBe('High Rated')
      expect(dramaShows?.[1]?.name).toBe('Mid Rated')
      expect(dramaShows?.[2]?.name).toBe('Low Rated')
    })

    it('should handle null ratings', async () => {
      const shows = [
        createMockShow({ id: 1, name: 'Rated', genres: ['Drama'], rating: { average: 8 } }),
        createMockShow({ id: 2, name: 'Unrated', genres: ['Drama'], rating: { average: null } }),
      ]

      const { movies, moviesByGenre } = useMovies()
      movies.value = shows

      const dramaShows = moviesByGenre.value['Drama']
      // Rated should come first (8 > 0)
      expect(dramaShows?.[0]?.name).toBe('Rated')
      expect(dramaShows?.[1]?.name).toBe('Unrated')
    })

    it('should limit to 20 shows per genre', async () => {
      const shows = Array.from({ length: 30 }, (_, i) =>
        createMockShow({
          id: i + 1,
          name: `Show ${i + 1}`,
          genres: ['Drama'],
          rating: { average: 5 + (i % 5) },
        }),
      )

      const { movies, moviesByGenre } = useMovies()
      movies.value = shows

      expect(moviesByGenre.value['Drama']).toHaveLength(20)
    })
  })

  describe('searchMovies (synchronous)', () => {
    it('should filter loaded movies by name', async () => {
      const shows = [
        createMockShow({ id: 1, name: 'Breaking Bad' }),
        createMockShow({ id: 2, name: 'Better Call Saul' }),
        createMockShow({ id: 3, name: 'The Wire' }),
      ]

      const { movies, searchMovies } = useMovies()
      movies.value = shows

      const results = searchMovies('break')

      expect(results).toHaveLength(1)
      expect(results[0]?.name).toBe('Breaking Bad')
    })

    it('should be case insensitive', async () => {
      const shows = [createMockShow({ id: 1, name: 'Breaking Bad' })]

      const { movies, searchMovies } = useMovies()
      movies.value = shows

      expect(searchMovies('BREAKING')).toHaveLength(1)
      expect(searchMovies('breaking')).toHaveLength(1)
    })

    it('should return empty array for empty query', async () => {
      const shows = [createMockShow({ id: 1, name: 'Test Show' })]

      const { movies, searchMovies } = useMovies()
      movies.value = shows

      expect(searchMovies('')).toHaveLength(0)
    })
  })

  describe('searchMoviesLocal', () => {
    it('should search in IndexedDB', async () => {
      const shows = [
        createMockShow({ id: 1, name: 'Breaking Bad' }),
        createMockShow({ id: 2, name: 'Better Call Saul' }),
      ]
      await db.shows.bulkPut(shows)

      const { searchMoviesLocal, searchResults } = useMovies()

      const results = await searchMoviesLocal('breaking')

      expect(results).toHaveLength(1)
      expect(results[0]?.name).toBe('Breaking Bad')
      expect(searchResults.value).toHaveLength(1)
    })

    it('should return empty array for empty query', async () => {
      const shows = [createMockShow({ id: 1, name: 'Test Show' })]
      await db.shows.bulkPut(shows)

      const { searchMoviesLocal } = useMovies()

      const results = await searchMoviesLocal('')

      expect(results).toHaveLength(0)
    })
  })

  describe('searchMoviesApi', () => {
    it('should fall back to local search when offline', async () => {
      setOnlineStatus(false)

      const shows = [createMockShow({ id: 1, name: 'Breaking Bad' })]
      await db.shows.bulkPut(shows)

      const mockFetch = vi.fn()
      vi.stubGlobal('fetch', mockFetch)

      const { searchMoviesApi, searchResults } = useMovies()

      const results = await searchMoviesApi('breaking')

      expect(mockFetch).not.toHaveBeenCalled()
      expect(results).toHaveLength(1)
      expect(searchResults.value).toHaveLength(1)
    })

    it('should return empty array for empty query', async () => {
      const { searchMoviesApi, searchResults } = useMovies()

      const results = await searchMoviesApi('')

      expect(results).toHaveLength(0)
      expect(searchResults.value).toHaveLength(0)
    })
  })

  describe('fetchMoviesByGenre', () => {
    it('should fetch movies by genre from IndexedDB', async () => {
      const shows = [
        createMockShow({ id: 1, name: 'Drama 1', genres: ['Drama'] }),
        createMockShow({ id: 2, name: 'Drama 2', genres: ['Drama'] }),
        createMockShow({ id: 3, name: 'Comedy', genres: ['Comedy'] }),
      ]
      await db.shows.bulkPut(shows)

      const { fetchMoviesByGenre, searchResults } = useMovies()

      const results = await fetchMoviesByGenre('Drama')

      expect(results).toHaveLength(2)
      expect(searchResults.value).toHaveLength(2)
    })

    it('should sort results by rating', async () => {
      const shows = [
        createMockShow({ id: 1, name: 'Low', genres: ['Drama'], rating: { average: 5 } }),
        createMockShow({ id: 2, name: 'High', genres: ['Drama'], rating: { average: 9 } }),
      ]
      await db.shows.bulkPut(shows)

      const { fetchMoviesByGenre } = useMovies()

      const results = await fetchMoviesByGenre('Drama')

      expect(results[0]?.name).toBe('High')
      expect(results[1]?.name).toBe('Low')
    })

    it('should return empty array for empty genre', async () => {
      const { fetchMoviesByGenre, searchResults } = useMovies()

      const results = await fetchMoviesByGenre('')

      expect(results).toHaveLength(0)
      expect(searchResults.value).toHaveLength(0)
    })
  })
})
