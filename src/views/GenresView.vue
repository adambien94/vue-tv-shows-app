<template>
  <div class="homepage-container pb-4">
    <AppHeader />

    <div class="bg-black/30 lg:bg-black/50 pt-1 lg:pt-4">
      <div class="mt-4" v-for="genre in genres" :key="genre">
        <GenresList :genre="genre" :movies="movies" />
      </div>
    </div>
  </div>
  <AppFooter />
</template>

<script setup lang="ts">
import AppHeader from '@/components/AppHeader.vue'
import AppFooter from '@/components/AppFooter.vue'
import GenresList from '@/components/GenresList.vue'
import { movies } from '@/data/movies'

const genres = ['Top 10 Today', 'Comedy', 'Trending Dramas']
</script>

<style scoped>
.homepage-container:after {
  content: '';
  display: block;
  position: absolute;
  top: 0;
  left: 0;
  height: 60vh;
  width: 100%;
  background: linear-gradient(#6366f1, #0a0a0a);
  z-index: -1;
}
</style>
