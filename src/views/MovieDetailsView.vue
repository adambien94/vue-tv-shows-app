<template>
  <div class="min-h-screen relative details-container">
    <div
      class="px-4 lg:px-8 py-4 lg:py-7 fixed backdrop-blur lg:backdrop-none bg-black/20 lg:relative bac lg:bg-inherit rounded-e- w-full border-b border-b-white/5 mb-4">
      <RouterLink to="/"
        class="inline-flex font-bold items-center gap-2 text-text-secondary hover:text-text-primary transition-colors">
        <span aria-hidden="true">←</span>
        Back
      </RouterLink>
    </div>

    <div v-if="movie" class="lg:px-8 lg:pt-4 pb-12">
      <div class="lg:flex">
        <div class="relative lg:rounded-2xl overflow-hidden bg-secondary/40 lg:w-96 z-[-1]">
          <div class="absolute left-0 w-full top-0 h-full lg:hidden"
            style="background: linear-gradient(to top, rgba(0, 0, 0, 0) 80%, rgba(10, 10, 10, 0.7) 100%);">
          </div>

          <img :src="movie.img" :alt="movie.title" class="w-full aspect-[2/3]  object-cover" />

          <div class="absolute left-0 w-full bottom-0 h-full lg:hidden"
            style="background: linear-gradient(to bottom, rgba(0, 0, 0, 0) 0%, rgba(10, 10, 10, 1) 75%);">
          </div>
        </div>

        <div class="space-y-4 px-4 pb-6 mt-[-136px] lg:mt-6 lg:px-6">
          <div class="space-y-2">
            <h1 class="text-text-primary text-3xl lg:text-5xl font-black">
              {{ movie.title }}
            </h1>
            <div class="flex flex-wrap items-center gap-2 text-text-tertiary">
              <span v-if="movie.year">{{ movie.year }}</span>
              <span v-if="movie.year && movie.genres?.length" aria-hidden="true">•</span>
              <span v-if="movie.genres?.length">{{ movie.genres.join(' • ') }}</span>
            </div>
          </div>

          <div class="flex flex-wrap items-center gap-3">
            <div
              class="px-3 py-1 rounded-full bg-accent-primary/15 text-accent-primary border border-accent-primary/30">
              <span class="font-semibold">{{ movie.rating?.toFixed(1) ?? '—' }}</span>
              <span class="text-sm text-accent-primary/90"> / 10</span>
            </div>
            <div class="text-text-secondary text-sm" v-if="movie.voteCount">
              {{ movie.voteCount }} votes
            </div>
          </div>

          <p class="text-text-secondary leading-relaxed max-w-3xl">
            {{ movie.overview ?? 'No overview yet.' }}
          </p>

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

    <!-- TODO: Create genre list component -->
    <div>
      <GenresList genre="Other in Drama" :movies="movies" />
    </div>

    <AppFooter />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { getMovieById } from '@/data/movies'
import AppFooter from '@/components/AppFooter.vue'
import GenresList from '@/components/GenresList.vue'


import { movies } from '@/data/movies'


const route = useRoute()
const movie = computed(() => getMovieById(String(route.params.id ?? '')))
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
