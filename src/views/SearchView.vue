<template>
  <div class="pb-12">
    <AppHeader v-model="searchTerm" :autofocus="true" />

    <div class="container min-h-[50vh] pt-6 lg:pt-8 lg:px-8">
      <div class="flex justify-between items-center mb-4 px-4 ">
        <!-- TODO: move it to component -->
        <div class="flex gap-4 text-text-secondary text-lg lg:text-2xl font-bold">
          <h2>{{ !!searchTerm ? `Search results for '${searchTerm}'` : 'Search your TV shows' }}</h2>
          <span class="text-accent-primary">&#10095;</span>
        </div>

        <p class="text-text-tertiary text-sm">
          {{ filteredMovies.length }} result{{ filteredMovies.length === 1 ? '' : 's' }}
        </p>
      </div>

      <div v-if="filteredMovies.length" class="mt-2">
        <SearchList :movies="filteredMovies" />
      </div>

      <div v-else class="px-4 lg:px-12 mt-8 text-text-tertiary text-center">
        <p>No results. Try typing a movie title above.</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import AppHeader from '@/components/AppHeader.vue'
import SearchList from '@/components/SearchList.vue'
import { useMovies } from '@/composables/useMovies'

const searchTerm = ref('')

const { movies, fetchMovies } = useMovies()

onMounted(() => {
  if (!movies.value.length) {
    fetchMovies()
  }
})

const filteredMovies = computed(() => {
  const term = searchTerm.value.trim().toLowerCase()
  if (!term) return movies.value.slice(0, 20)
  return movies.value.filter((movie) => movie.name.toLowerCase().includes(term))
})
</script>
