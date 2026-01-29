<template>
  <div class="homepage-container pb-4">
    <AppHeader />

    <div class="bg-black/30 lg:bg-black/50 pt-32 lg:pt-24">
      <div class="mt-4" v-for="genre in genres" :key="genre">
        <GenresList :genre="genre" :movies="moviesByGenre[genre] || []" />
      </div>
    </div>
  </div>
  <AppFooter />

</template>

<script setup lang="ts">
import AppHeader from '@/components/AppHeader.vue'
import AppFooter from '@/components/AppFooter.vue'
import GenresList from '@/components/GenresList.vue'
import { computed, onMounted } from 'vue'
import { useMovies } from '@/composables/useMovies'

const { moviesByGenre, fetchMovies } = useMovies()

onMounted(() => {
  fetchMovies()
})

const genres = computed(() => Object.keys(moviesByGenre.value))
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
