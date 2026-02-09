<template>
  <div class="homepage-container pb-4">
    <AppHeader />

    <main class="pt-3 lg:pt-4 container">
      <h1 class="sr-only">Browse TV Shows by Genre</h1>

      <section class="mt-1 sm:mt-4" v-for="genre in genres" :key="genre" :aria-labelledby="`genre-${genre}`">
        <HorizontalList>
          <template #header>
            <h2 class="text-xl lg:text-2xl mb-1 lg:mb-0">
              <RouterLink :to="{ name: 'search', query: { genre } }"
                class="flex  gap-4 hover:text-text-primary transition-colors cursor-pointer">
                {{ genre }}
                <span class="text-accent-primary">&#10095;</span>
              </RouterLink>
            </h2>
          </template>

          <template #items>
            <article v-for="movie in moviesByGenre[genre]" :key="movie.id" class="w-32 lg:w-48 flex-shrink-0">
              <MovieCard :id="movie.id" :name="movie.name" :genre="genre"
                :img="movie.image?.medium || movie.image?.original" :rating="movie.rating?.average" />
            </article>
          </template>
        </HorizontalList>
      </section>
    </main>
  </div>
  <AppFooter />

</template>

<script setup lang="ts">
import AppHeader from '@/components/layout/AppHeader.vue'
import AppFooter from '@/components/layout/AppFooter.vue'
import HorizontalList from '@/components/ui/HorizontalList.vue'
import MovieCard from '@/components/movie/MovieCard.vue'
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
.homepage-container::before {
  content: '';
  display: block;
  position: absolute;
  top: 0;
  left: 0;
  height: 60vh;
  width: 100%;
  background: linear-gradient(#6366f120, #0a0a0a);
  z-index: -1;
  mask-size: 400px 400px;
  mask-repeat: repeat;
}
</style>
