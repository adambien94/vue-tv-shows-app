<template>
  <div class="min-h-screen relative details-container pb-8 lg:pb-0">
    <AppHeader />

    <div v-if="movie" class="lg:px-8 pt-28 pb-12">
      <div class="lg:flex">
        <div class="relative lg:rounded-2xl overflow-hidden bg-secondary/40 lg:w-96 z-[-1]">
          <div class="absolute left-0 w-full top-0 h-full lg:hidden"
            style="background: linear-gradient(to top, rgba(0, 0, 0, 0) 80%, rgba(10, 10, 10, 0.7) 100%);">
          </div>

          <img :src="movie.image?.original || movie.image?.medium" :alt="movie.name"
            class="w-full aspect-[2/3] object-cover" />

          <div class="absolute left-0 w-full bottom-0 h-full lg:hidden"
            style="background: linear-gradient(to bottom, rgba(0, 0, 0, 0) 0%, rgba(10, 10, 10, 1) 75%);">
          </div>
        </div>

        <div class="space-y-4 px-4 pb-6 mt-[-136px] lg:mt-6 lg:px-6">
          <div class="space-y-2">
            <h1 class="text-text-primary text-3xl lg:text-5xl font-black">
              {{ movie.name }}
            </h1>
            <div class="flex flex-wrap items-center gap-2 text-text-tertiary">
              <span v-if="movie.genres?.length">{{ movie.genres.join(' • ') }}</span>
            </div>
          </div>

          <div class="flex flex-wrap items-center gap-3">
            <div
              class="px-3 py-1 rounded-full bg-accent-primary/15 text-accent-primary border border-accent-primary/30">
              <span class="font-semibold">{{
                movie.rating?.average != null ? movie.rating.average.toFixed(1) : '—'
              }}</span>
              <span class="text-sm text-accent-primary/90"> / 10</span>
            </div>
          </div>

          <p class="text-text-secondary leading-relaxed max-w-3xl" v-html="movieSummary" />

          <div class="pt-2">
            <button class="btn-accent-primary w-full lg:w-64 lg:mt-4">
              Watch Now
            </button>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="px-4 lg:px-8 pt-10">
      <h1 class="text-text-primary text-2xl font-bold">Movie not found</h1>
      <p class="text-text-secondary mt-2">Try going back and selecting a movie again.</p>
    </div>

    <GenresList v-if="activeGenre" genreText="Other in " :genre="activeGenre" :movies="moviesInGenre" />
  </div>
</template>

<script setup lang="ts">
import AppHeader from '@/components/AppHeader.vue'
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import GenresList from '@/components/GenresList.vue'
import { useMovies } from '@/composables/useMovies'

const route = useRoute()
const { movies, fetchMovies } = useMovies()

onMounted(() => {
  if (!movies.value.length) {
    fetchMovies()
  }
})

const movie = computed(() => {
  const movieId = Number(route.params.id)
  if (Number.isNaN(movieId)) return undefined
  return movies.value.find(({ id }) => id === movieId)
})

const movieSummary = computed(() => {
  const summary = movie.value?.summary
  if (!summary) return 'No overview yet.'
  return summary
})

const activeGenre = computed(() => {
  const genre = route.query.genre
  if (Array.isArray(genre)) {
    return genre[0] || ''
  }
  return genre || ''
})

const moviesInGenre = computed(() => {
  if (!activeGenre.value) return []
  return movies.value.filter(
    (m) => m.id !== movie.value?.id && m.genres?.includes(activeGenre.value),
  )?.slice(0, 20)
})
</script>

<style scoped>
@media screen and (min-width: 1024px) {
  .details-container:after {
    content: '';
    display: block;
    position: absolute;
    bottom: 0;
    left: 0;
    height: 100%;
    width: 100%;
    background: linear-gradient(#0a0a0a 20%, #6366f130 100%);
    z-index: -5;
  }
}
</style>
