<template>
  <div class="px-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 place-content-center pb-6">
    <div v-for="movie in movies" :key="movie.id">
      <MovieCard :id="movie.id" :name="movie.name" :genre="movie.genres?.[0]"
        :img="movie.image?.medium || movie.image?.original || 'https://via.placeholder.com/300x450?text=No+Image'"
        :rating="movie.rating?.average" />
    </div>
  </div>
</template>

<script setup lang="ts">
import MovieCard from '@/components/MovieCard.vue'
import type { Movie } from '@/composables/useMovies'

defineProps<{
  movies: Movie[]
}>()
</script>
