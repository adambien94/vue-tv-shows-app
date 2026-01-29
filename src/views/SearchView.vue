<template>
  <div class="pb-12">
    <AppHeader v-model="searchTerm" />

    <div class="min-h-[50vh] pt-5 lg:pt-8">
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
        <!-- TODO: move it to component -->
        <div
          class="px-4 lg:px-8 grid grid-cols-[repeat(auto-fit,minmax(130px,1fr))] lg:grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-4 place-content-center pb-6">
          <div v-for="movie in filteredMovies" :key="movie.id">
            <MovieCard :id="movie.id" :title="movie.title" :img="movie.img" />
          </div>
        </div>

        <!-- <div
          class="px-4 lg:px-8 flex gap-4 overflow-x-scroll pb-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div v-for="movie in filteredMovies" :key="movie.id">
            <MovieCard :id="movie.id" :title="movie.title" :img="movie.img" />
          </div>
        </div> -->
      </div>

      <div v-else class="px-4 lg:px-12 mt-8 text-text-tertiary text-center">
        <p>No results yet. Try typing a movie title above.</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import AppHeader from '@/components/AppHeader.vue'
import MovieCard from '@/components/MovieCard.vue'
import { movies } from '@/data/movies'

const searchTerm = ref('')

const filteredMovies = computed(() => {
  const term = searchTerm.value.trim().toLowerCase()
  if (!term) return movies
  return movies.filter((movie) => movie.title.toLowerCase().includes(term))
})
</script>
