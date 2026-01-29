<template>
  <div class="pb-12">
    <AppHeader v-model="searchTerm" :autofocus="true" :placeholder="searchPlaceholder" />

    <div class="container min-h-[50vh] pt-6 lg:pt-8 lg:px-8">
      <div class="flex justify-between items-center mb-4 px-4 ">
        <div class="flex gap-4 text-text-secondary text-lg lg:text-2xl font-bold">
          <h2>{{ pageTitle }}:</h2>
        </div>

        <p class="text-text-tertiary text-sm">
          <template v-if="searchLoading">Searching...</template>
          <template v-else>{{ searchResults.length }} result{{ searchResults.length === 1 ? '' : 's' }}</template>
        </p>
      </div>

      <div v-if="searchLoading" class="px-4 lg:px-12 mt-8 text-text-tertiary text-center">
        <p>Searching...</p>
      </div>

      <div v-else-if="searchResults.length" class="mt-2">
        <SearchList :movies="searchResults" />
      </div>

      <div v-else class="px-4 lg:px-12 mt-8 text-text-tertiary text-center">
        <p>{{ !searchTerm && !selectedGenre && !searchLoading ? '' : 'No results.' }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppHeader from '@/components/AppHeader.vue'
import SearchList from '@/components/SearchList.vue'
import { useMovies, type Show } from '@/composables/useMovies'

const route = useRoute()
const router = useRouter()

const searchTerm = ref((route.query.q as string) || '')
const selectedGenre = ref((route.query.genre as string) || '')
const genreShows = ref<Show[]>([])

const { searchMoviesApi, searchResults, searchLoading, fetchMoviesByGenre } = useMovies()

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
  return 'Search your TV shows'
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
    } else {
      searchMoviesApi(newTerm)
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
  }
})
</script>
