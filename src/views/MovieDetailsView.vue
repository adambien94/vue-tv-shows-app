<!-- TODO: refactor component -->
<template>
  <div class="details-container noise-bg min-h-screen relative pb-8 lg:pb-8">
    <AppHeader />

    <main class="container">
      <div v-if="loading" class="px-4 lg:px-8 pt-10 text-center" role="status">
        <!-- <p class="text-text-secondary">Loading...</p> -->
      </div>


      <article v-else-if="movie" class="container sm:px-0 lg:px-8 sm:pt-10 sm:pb-6">
        <div class="sm:flex sm:px-4 items-start">
          <div class="relative sm:rounded-2xl overflow-hidden bg-secondary/40 sm:w-96 z-[-1] sm:blend-border">
            <div class="absolute left-0 w-full top-0 h-full sm:hidden"
              style="background: linear-gradient(to top, rgba(0, 0, 0, 0) 80%, rgba(10, 10, 10, 0.7) 100%);">
            </div>

            <img v-if="movie.image?.medium || movie.image?.original" loading="eager" :src="posterSrc" :alt="movie.name"
              class="poster-image w-full aspect-[2/3] object-cover" />
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

          <div class="space-y-4 px-4 sm:px-8 pb-6 mt-[-226px] sm:mt-6">
            <div class="space-y-2">
              <h1 class="text-text-primary text-3xl sm:text-5xl font-black [text-shadow:0_2px_12px_rgba(0,0,0,0.8)]">
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
              <p ref="summaryRef" class="text-text-secondary leading-relaxed"
                :class="{ 'line-clamp-4 lg:line-clamp-[9]': !isExpanded }" v-html="movieSummary" />
              <button v-if="movieSummary !== 'No overview yet.' && (isClamped || isExpanded)"
                @click="isExpanded = !isExpanded" class="mt-2 text-accent-primary font-medium text-sm hover:underline">
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
      </article>

      <div v-else class="px-4 lg:px-8 pt-10">
        <h1 class="text-text-primary text-2xl font-bold">Movie not found</h1>
        <p class="text-text-secondary mt-2">Try going back and selecting a movie again.</p>
      </div>

      <aside v-if="movie" class="space-y-8" aria-label="Related content">
        <SeasonsList :seasons="seasons" :loading="seasonsLoading" />

        <HorizontalList v-if="activeGenre && moviesInGenre.length > 0">
          <template #header>
            <RouterLink :to="{ name: 'search', query: { genre: activeGenre } }"
              class="flex gap-4 hover:text-text-primary transition-colors cursor-pointer">
              <h2>Other in {{ activeGenre }}</h2>
              <span class="text-accent-primary" aria-hidden="true">&#10095;</span>
            </RouterLink>
          </template>

          <template #items>
            <article v-for="m in moviesInGenre" :key="m.id" class="w-32 lg:w-48 flex-shrink-0">
              <MovieCard :id="m.id" :name="m.name" :genre="activeGenre" :img="m.image?.medium || m.image?.original"
                :rating="m.rating?.average" />
            </article>
          </template>
        </HorizontalList>
      </aside>

    </main>
  </div>
</template>

<script setup lang="ts">
import AppHeader from '@/components/layout/AppHeader.vue'
import HorizontalList from '@/components/ui/HorizontalList.vue'
import MovieCard from '@/components/movie/MovieCard.vue'
import SeasonsList from '@/components/movie/SeasonsList.vue'
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { useMovies } from '@/composables/useMovies'
import { throttledFetch } from '@/services/rateLimiter'
import { checkOnline } from '@/composables/useNetwork'
import type { Season } from '@/db'

const route = useRoute()
const { movies, fetchMovies, fetchMovieById, currentMovie, loading } = useMovies()
const isExpanded = ref(false)
const isClamped = ref(false)
const summaryRef = ref<HTMLParagraphElement | null>(null)
const seasons = ref<Season[]>([])
const seasonsLoading = ref(false)
const posterSrc = ref('')

const checkClamped = () => {
  if (summaryRef.value) {
    isClamped.value = summaryRef.value.scrollHeight > summaryRef.value.clientHeight
  }
}

const handleResize = () => checkClamped()
onMounted(() => window.addEventListener('resize', handleResize))
onUnmounted(() => window.removeEventListener('resize', handleResize))

const setPosterSrc = (mediumUrl: string | undefined, originalUrl: string | undefined) => {
  // Prioritize original image, fall back to medium
  posterSrc.value = originalUrl || mediumUrl || ''
}

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
    await fetchMovieById(newId)
    fetchSeasons(newId)
  }
})

const movie = computed(() => currentMovie.value)

watch(movie, async (newMovie) => {
  document.title = newMovie ? `${newMovie.name} | TV Shows` : 'TV Shows'
  if (newMovie?.image) {
    setPosterSrc(newMovie.image.medium, newMovie.image.original)
  }
  // Reset and re-check clamp state when movie changes
  isExpanded.value = false
  await nextTick()
  checkClamped()
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
/* Scroll-linked animation for poster parallax effect - mobile only, supported browsers */
@supports (animation-timeline: scroll()) {
  @media screen and (max-width: 639px) {
    @keyframes poster-scroll {
      from {
        transform: translateY(0) scale(1);
      }

      to {
        transform: translateY(100px) scale(1.2);
      }
    }

    .poster-image {
      animation: poster-scroll linear both;
      animation-timeline: scroll(root block);
      animation-range: 0 500px;
      transform-origin: center;
    }
  }
}

@media screen and (min-width: 640px) {
  .details-container:before {
    content: '';
    display: block;
    position: absolute;
    bottom: 0;
    left: 0;
    height: 100%;
    width: 100%;
    background: linear-gradient(#0a0a0a 20%, #6366f130 100%);
    z-index: -5;
    mask-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
    mask-size: 400px 400px;
    mask-repeat: repeat;
  }
}
</style>
