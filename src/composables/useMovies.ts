import { ref, computed } from 'vue'

export type Movie = {
  id: number
  name: string
  genres: string[]
  rating: {
    average: number | null
  }
  image?: {
    medium: string
    original: string
  }
  summary?: string
  premiered?: string
}

type SearchResult = {
  score: number
  show: Movie
}

const API_URL = 'https://api.tvmaze.com/shows'
const SEARCH_API_URL = 'https://api.tvmaze.com/search/shows'

export function useMovies() {
  const movies = ref<Movie[]>([])
  const searchResults = ref<Movie[]>([])
  const currentMovie = ref<Movie | null>(null)
  const loading = ref(false)
  const searchLoading = ref(false)

  const fetchMovies = async () => {
    loading.value = true
    try {
      const response = await fetch(API_URL)
      if (!response.ok) {
        throw new Error('Failed to fetch TV movies')
      }
      const data: Movie[] = await response.json()
      movies.value = data
    } catch (err) {
      if (err instanceof Error) {
        alert(err.message)
      } else {
        alert('Unknown error')
      }
    } finally {
      loading.value = false
    }
  }

  const searchMoviesApi = async (query: string) => {
    if (!query.trim()) {
      searchResults.value = []
      return []
    }

    searchLoading.value = true
    try {
      const response = await fetch(`${SEARCH_API_URL}?q=${encodeURIComponent(query)}`)
      if (!response.ok) {
        throw new Error('Failed to search TV shows')
      }
      const data: SearchResult[] = await response.json()
      searchResults.value = data.map((result) => result.show)
      return searchResults.value
    } catch (err) {
      if (err instanceof Error) {
        alert(err.message)
      } else {
        alert('Unknown error')
      }
      return []
    } finally {
      searchLoading.value = false
    }
  }

  const fetchMovieById = async (id: number) => {
    loading.value = true
    currentMovie.value = null
    try {
      const response = await fetch(`${API_URL}/${id}`)
      if (!response.ok) {
        throw new Error('Failed to fetch TV show details')
      }
      const data: Movie = await response.json()
      currentMovie.value = data
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

  const moviesByGenre = computed<Record<string, Movie[]>>(() => {
    const moviesMap: Record<string, Movie[]> = {}

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

  return {
    movies,
    moviesByGenre,
    fetchMovies,
    searchMovies,
    searchMoviesApi,
    fetchMovieById,
    searchResults,
    currentMovie,
    loading,
    searchLoading,
  }
}
