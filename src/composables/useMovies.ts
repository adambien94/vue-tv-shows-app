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

const API_URL = 'https://api.tvmaze.com/shows'

export function useMovies() {
  const movies = ref<Movie[]>([])
  const loading = ref(false)

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
      if( err instanceof Error ) {
        alert(err.message)
      } else {
        alert('Unknown error')
      }
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

    return movies.value.filter((movie) =>
      movie.name.toLowerCase().includes(q)
    )
  }

  return {
    movies,
    moviesByGenre,
    fetchMovies,
    searchMovies,
    loading,
  }
}
