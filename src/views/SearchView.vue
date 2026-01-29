<template>
  <div class="pb-12">
    <AppHeader v-model="searchTerm" :autofocus="true" />

    <div class="min-h-[50vh] pt-36 lg:pt-28">
      <div class="flex justify-between items-center mb-4 px-4 lg:px-12">
        <!-- TODO: move it to component -->
        <div class=" flex gap-4 text-text-secondary text-lg lg:text-2xl font-bold">
          <span class="text-accent-primary">&#10095;</span>
          <h2>Search results for '{{ searchTerm }}'</h2>
        </div>

        <p class="text-text-tertiary text-sm">
          {{ filteredMovies.length }} result{{ filteredMovies.length === 1 ? '' : 's' }}
        </p>
      </div>

      <div v-if="filteredMovies.length" class="mt-2">
        <div
          class="px-4 lg:px-8 grid grid-cols-[repeat(auto-fit,minmax(130px,1fr))] lg:grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-4 place-content-center pb-6">
          <div v-for="movie in filteredMovies" :key="movie.id">
            <MovieCard
              :id="movie.id"
              :name="movie.name"
              :genre="movie.genres?.[0]"
              :img="movie.image?.medium || movie.image?.original || 'https://via.placeholder.com/300x450?text=No+Image'"
              :rating="movie.rating?.average" />
          </div>
        </div>
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
import MovieCard from '@/components/MovieCard.vue'
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
  if (!term) return movies.value
  return movies.value.filter((movie) => movie.name.toLowerCase().includes(term))
})
</script>
