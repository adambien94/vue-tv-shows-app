<template>
  <div class="pb-12">
    <AppHeader v-model="searchTerm" :autofocus="true" :placeholder="searchPlaceholder" />

    <main class="container min-h-[50vh] pt-3 sm:pt-6 lg:pt-8 lg:px-8">
      <div class="flex justify-between items-center mb-2 sm:mb-4 px-4 ">
        <h1 class="flex gap-4 text-text-secondary text-lg lg:text-2xl font-bold">
          {{ pageTitle }}:
        </h1>

        <p class="text-text-tertiary text-sm" aria-live="polite">
          <template v-if="searchLoading">Searching...</template>
          <template v-else>{{ searchResults.length }} result{{ searchResults.length === 1 ? '' : 's' }}</template>
        </p>
      </div>

      <Transition name="fade" mode="out-in">
        <div v-if="searchLoading" key="loading" class="flex items-center justify-center min-h-[40vh]" role="status">
          <LoadingIndicator />
        </div>

        <section v-else-if="searchResults.length" key="results" class="mt-2" aria-label="Search results">
          <MovieGrid :movies="searchResults" />
        </section>

        <div v-else-if="searchTerm || selectedGenre" key="empty"
          class="flex items-center justify-center min-h-[40vh] text-text-tertiary" role="status">
          <p>No results found.</p>
        </div>
      </Transition>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppHeader from '@/components/layout/AppHeader.vue'
import LoadingIndicator from '@/components/ui/LoadingIndicator.vue'
import MovieGrid from '@/components/movie/MovieGrid.vue'
import { useMovies, type Show } from '@/composables/useMovies'

const route = useRoute()
const router = useRouter()

const searchTerm = ref((route.query.q as string) || '')
const selectedGenre = ref((route.query.genre as string) || '')
const genreShows = ref<Show[]>([])

const { movies, fetchMovies, searchMoviesApi, searchResults, searchLoading, fetchMoviesByGenre } = useMovies()

let debounceTimeout: ReturnType<typeof setTimeout> | null = null

const pageTitle = computed(() => {
  if (searchTerm.value && selectedGenre.value) {
    return `'${searchTerm.value}' in ${selectedGenre.value}`
  }
  if (searchTerm.value) {
    return `Search results for '${searchTerm.value}'`
  }
  if (selectedGenre.value) {
    return `Shows in ${selectedGenre.value}`
  }
  return 'Popular Shows'
})

const searchPlaceholder = computed(() => {
  if (selectedGenre.value) {
    return `Search in ${selectedGenre.value}...`
  }
  return 'Search...'
})

const updateUrl = () => {
  const query: Record<string, string> = {}
  if (searchTerm.value) query.q = searchTerm.value
  if (selectedGenre.value) query.genre = selectedGenre.value
  router.replace({ name: 'search', query })
}

const filterGenreShows = (term: string) => {
  if (!term.trim()) {
    searchResults.value = genreShows.value
    return
  }
  const q = term.toLowerCase()
  searchResults.value = genreShows.value.filter((show) =>
    show.name.toLowerCase().includes(q)
  )
}

watch(searchTerm, (newTerm) => {
  updateUrl()

  if (debounceTimeout) {
    clearTimeout(debounceTimeout)
  }

  debounceTimeout = setTimeout(() => {
    if (selectedGenre.value) {
      filterGenreShows(newTerm)
    } else if (newTerm.trim()) {
      searchMoviesApi(newTerm)
    } else {
      // Show limited movies when search is cleared
      searchResults.value = movies.value.slice(0, 24)
    }
  }, 300)
})

watch(
  () => route.query.genre,
  async (newGenre) => {
    if (newGenre && newGenre !== selectedGenre.value) {
      selectedGenre.value = newGenre as string
      const shows = await fetchMoviesByGenre(selectedGenre.value)
      genreShows.value = shows
    }
  }
)

onMounted(async () => {
  if (selectedGenre.value) {
    const shows = await fetchMoviesByGenre(selectedGenre.value)
    genreShows.value = shows
  } else if (searchTerm.value) {
    searchMoviesApi(searchTerm.value)
  } else {
    await fetchMovies()
    searchResults.value = movies.value.slice(0, 24)
  }
})
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
