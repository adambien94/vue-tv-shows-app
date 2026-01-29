<!-- TODO: refactor component -->
<template>
  <div class="details-container min-h-screen relative pb-8 lg:pb-0">
    <AppHeader />

    <div class="container">
      <div v-if="loading" class="px-4 lg:px-8 pt-10 text-center">
        <p class="text-text-secondary">Loading...</p>
      </div>


      <div v-else-if="movie" class="container sm:px-0 lg:px-8 sm:pt-10 pb-6">
        <div class="sm:flex sm:px-4 items-start">
          <div class="relative sm:rounded-2xl overflow-hidden bg-secondary/40 sm:w-96 z-[-1] sm:blend-border">
            <div class="absolute left-0 w-full top-0 h-full sm:hidden"
              style="background: linear-gradient(to top, rgba(0, 0, 0, 0) 80%, rgba(10, 10, 10, 0.7) 100%);">
            </div>

            <img v-if="movie.image?.original || movie.image?.medium" loading="eager"
              :src="movie.image?.original || movie.image?.medium" :alt="movie.name"
              class="w-full aspect-[2/3] object-cover " />
            <div v-else
              class="w-full aspect-[2/3] bg-secondary/60 flex flex-col items-center justify-center text-text-tertiary">
              <svg class="w-20 h-20 opacity-40" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                stroke-width="1.5">
                <rect x="2" y="4" width="20" height="16" rx="2" />
                <path d="M7 4v16M17 4v16M2 9h5M17 9h5M2 14h5M17 14h5" />
              </svg>
              <span class="mt-3 text-sm opacity-60">No Image Available</span>
            </div>

            <div class="absolute left-0 w-full bottom-0 h-full sm:hidden"
              style="background: linear-gradient(to bottom, rgba(0, 0, 0, 0) 0%, rgba(10, 10, 10, 1) 75%);">
            </div>
          </div>

          <div class="space-y-4 px-4 sm:px-8 pb-6 mt-[-136px] sm:mt-6">
            <div class="space-y-2">
              <h1 class="text-text-primary text-3xl sm:text-5xl font-black">
                {{ movie.name }}
              </h1>
              <div v-if="movie.genres?.length" class="flex flex-wrap items-center gap-x-1 text-text-tertiary">
                <template v-for="(genre, index) in movie.genres" :key="genre">
                  <RouterLink :to="{ name: 'search', query: { genre } }"
                    class="hover:text-accent-primary transition-colors">
                    {{ genre }}
                  </RouterLink>
                  <span v-if="index < movie.genres.length - 1">•</span>
                </template>
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

            <div class="max-w-3xl">
              <p class="text-text-secondary leading-relaxed" :class="{ 'line-clamp-4 lg:line-clamp-none': !isExpanded }"
                v-html="movieSummary" />
              <button v-if="movieSummary !== 'No overview yet.'" @click="isExpanded = !isExpanded"
                class="lg:hidden mt-2 text-accent-primary font-medium text-sm hover:underline">
                {{ isExpanded ? 'Read Less' : 'Read More' }}
              </button>
            </div>

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

      <div v-if="movie" class="space-y-8">
        <!-- Seasons List -->
        <HorizontalList v-if="seasons.length > 0">
          <template #header>
            <h2 class="text-text-primary">{{ seasons.length }} {{ seasons.length === 1 ? 'Season' : 'Seasons' }}</h2>
          </template>

          <template #items>
            <div v-for="season in seasons" :key="season.id" class="season-card relative">
              <div
                class="relative mx-auto w-full min-w-32 aspect-[5/7] lg:min-w-48 lg:max-w-96 rounded-lg lg:rounded-2xl overflow-hidden blend-border bg-secondary/40">
                <img v-if="season.image?.medium || season.image?.original"
                  :src="season.image?.medium || season.image?.original" :alt="`Season ${season.number}`" loading="lazy"
                  class="w-full h-full object-cover" />
                <div v-else class="w-full h-full bg-gradient-to-br from-accent-primary/20 to-accent-primary/5" />

                <div class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3 pt-8">
                  <span class="text-text-primary font-bold text-sm lg:text-base">Season {{ season.number }}</span>
                  <span v-if="season.episodeOrder" class="block text-text-secondary text-xs mt-0.5">
                    {{ season.episodeOrder }} episodes
                  </span>
                </div>
              </div>

              <!-- Season number overlay (outside overflow-hidden) -->
              <div class="absolute top-3 left-3 pointer-events-none">
                <!-- Gradient background -->
                <div
                  class="absolute -inset-4 [background:radial-gradient(ellipse_closest-side_at_center,rgba(0,0,0,.4)_0%,rgba(0,0,0,.24)_30%,rgba(0,0,0,.1)_60%,transparent_100%)]" />
                <!-- Number -->
                <span
                  class="relative text-5xl lg:text-6xl font-black text-white/90 [mask-image:linear-gradient(to_bottom,black_60%,transparent)]">
                  {{ season.number }}
                </span>
              </div>
            </div>
          </template>
        </HorizontalList>

        <!-- Other Movies in Genre -->
        <HorizontalList v-if="activeGenre && moviesInGenre.length > 0">
          <template #header>
            <RouterLink :to="{ name: 'search', query: { genre: activeGenre } }"
              class="flex gap-4 hover:text-text-primary transition-colors cursor-pointer">
              <h2>Other in {{ activeGenre }}</h2>
              <span class="text-accent-primary">&#10095;</span>
            </RouterLink>
          </template>

          <template #items>
            <div v-for="m in moviesInGenre" :key="m.id">
              <MovieCard :id="m.id" :name="m.name" :genre="activeGenre" :img="m.image?.medium || m.image?.original"
                :rating="m.rating?.average" />
            </div>
          </template>
        </HorizontalList>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import AppHeader from '@/components/AppHeader.vue'
import HorizontalList from '@/components/HorizontalList.vue'
import MovieCard from '@/components/MovieCard.vue'
import { computed, onMounted, ref, watch } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { useMovies } from '@/composables/useMovies'
import { throttledFetch } from '@/services/rateLimiter'
import { checkOnline } from '@/composables/useNetwork'
import type { Season } from '@/db'

const route = useRoute()
const { movies, fetchMovies, fetchMovieById, currentMovie, loading } = useMovies()
const isExpanded = ref(false)
const seasons = ref<Season[]>([])
const seasonsLoading = ref(false)

const fetchSeasons = async (showId: number) => {
  seasonsLoading.value = true
  seasons.value = []

  if (!checkOnline()) {
    seasonsLoading.value = false
    return
  }

  try {
    const response = await throttledFetch(`https://api.tvmaze.com/shows/${showId}/seasons`)
    if (!response.ok) throw new Error('Failed to fetch seasons')
    const data: Season[] = await response.json()
    seasons.value = data.sort((a, b) => a.number - b.number)
  } catch (err) {
    console.error('Failed to fetch seasons:', err)
  } finally {
    seasonsLoading.value = false
  }
}

const movieId = computed(() => {
  const id = Number(route.params.id)
  return Number.isNaN(id) ? null : id
})

onMounted(async () => {
  if (movieId.value !== null) {
    await fetchMovieById(movieId.value)
    fetchSeasons(movieId.value)
  }
  if (!movies.value.length) {
    fetchMovies()
  }
})

watch(movieId, async (newId) => {
  if (newId !== null) {
    if (document.startViewTransition) {
      document.startViewTransition(async () => {
        await fetchMovieById(newId)
      })
    } else {
      await fetchMovieById(newId)
    }
    fetchSeasons(newId)
  }
})

const movie = computed(() => currentMovie.value)

watch(movie, (newMovie) => {
  document.title = newMovie ? `${newMovie.name} | TV Shows` : 'TV Shows'
}, { immediate: true })

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
@media screen and (min-width: 640px) {
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
