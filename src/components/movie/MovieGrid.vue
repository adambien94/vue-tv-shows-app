<template>
  <div
    class="px-4 grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-6 xl:grid-cols-9 gap-4 lg:gap-y-8 place-content-center pb-6">
    <div v-for="movie in movies" :key="movie.id">
      <MovieCard :id="movie.id" :name="movie.name" :genre="movie.genres?.[0]"
        :img="movie.image?.medium || movie.image?.original" :rating="movie.rating?.average" />
    </div>
  </div>
</template>

<script setup lang="ts">
import MovieCard from '@/components/movie/MovieCard.vue'
import type { Movie } from '@/composables/useMovies'

defineProps<{
  movies: Movie[]
}>()
</script>
