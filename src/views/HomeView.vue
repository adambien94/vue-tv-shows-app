<template>
  <div class="homepage-container pb-4">
    <AppHeader />

    <div class="pt-2 lg:pt-4 container">
      <div class="mt-1 sm:mt-4" v-for="genre in genres" :key="genre">
        <HorizontalList>
          <template #header>
            <RouterLink :to="{ name: 'search', query: { genre } }"
              class="flex gap-4 hover:text-text-primary transition-colors cursor-pointer">
              <h2>{{ genre }}</h2>
              <span class="text-accent-primary">&#10095;</span>
            </RouterLink>
          </template>

          <template #items>
            <div v-for="movie in moviesByGenre[genre]" :key="movie.id">
              <MovieCard :id="movie.id" :name="movie.name" :genre="genre"
                :img="movie.image?.medium || movie.image?.original" :rating="movie.rating?.average" />
            </div>
          </template>
        </HorizontalList>
      </div>
    </div>
  </div>
  <AppFooter />

</template>

<script setup lang="ts">
import AppHeader from '@/components/AppHeader.vue'
import AppFooter from '@/components/AppFooter.vue'
import HorizontalList from '@/components/HorizontalList.vue'
import MovieCard from '@/components/MovieCard.vue'
import { RouterLink } from 'vue-router'
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
  background: linear-gradient(#6366f180, #0a0a0a);
  z-index: -1;
}
</style>
