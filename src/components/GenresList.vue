<template>
  <div class="px-4 lg:px-12 flex gap-4 text-text-secondary text-lg lg:text-2xl font-bold">
    <span class="text-accent-primary">&#10095;</span>
    <h2>{{ genre }}</h2>
  </div>

  <div class="mt-4">
    <div class="px-4 lg:px-8 flex gap-4 overflow-x-scroll pb-6 scrollbar-tv scrollbar-hide-mobile">
      <div v-for="movie in movies" :key="movie.id">
        <MovieCard :id="movie.id" :title="movie.title" :img="movie.img" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import MovieCard from '@/components/MovieCard.vue'
import type { Movie } from '../data/movies'

defineProps<{
  genre: string
  movies: Movie[]
}>()

</script>


<style scoped></style>
