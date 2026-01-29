<template>
  <div class="px-4 lg:px-12 flex gap-4 text-text-secondary text-lg lg:text-2xl font-bold">
    <span class="text-accent-primary">&#10095;</span>
    <h2>{{ genreText }} {{ genre }}</h2>
  </div>

  <div class="mt-4 relative">
    <ScrollBtn v-if="canScrollLeft" direction="left" @click="arrowScroll('left')" class="hidden lg:block" />

    <div ref="scrollContainer"
      class="px-4 lg:px-8 flex gap-4 overflow-x-scroll pb-6 scrollbar-tv scrollbar-hide-mobile scroll-smooth"
      @scroll="handleScroll">
      <div v-for="movie in movies" :key="movie.id" class="flex-shrink-0">
        <MovieCard :id="movie.id" :name="movie.name" :genre="genre" :img="movie.image?.medium || movie.image?.original"
          :rating="movie.rating?.average" />
      </div>
    </div>

    <ScrollBtn v-if="canScrollRight" direction="right" @click="arrowScroll('right')" class="hidden lg:block" />
  </div>
</template>

<script setup lang="ts">
import MovieCard from '@/components/MovieCard.vue'
import ScrollBtn from '@/components/ScrollBtn.vue'
import type { Movie } from '@/composables/useMovies'
import { ref, onMounted, onUnmounted, nextTick } from 'vue'

defineProps<{
  genre: string
  genreText?: string
  movies: Movie[]
}>()

const scrollContainer = ref<HTMLElement | null>(null)
const canScrollLeft = ref(false)
const canScrollRight = ref(false)

const updateScrollButtons = () => {
  if (!scrollContainer.value) return

  const { scrollLeft, scrollWidth, clientWidth } = scrollContainer.value
  canScrollLeft.value = scrollLeft > 0
  canScrollRight.value = scrollLeft < scrollWidth - clientWidth - 1
}

const handleScroll = () => {
  updateScrollButtons()
}

const arrowScroll = (direction: 'left' | 'right') => {
  if (!scrollContainer.value) return

  const firstCard = scrollContainer.value.querySelector('.flex-shrink-0')
  if (!firstCard) return

  const cardWidth = firstCard.getBoundingClientRect().width
  const gap = 16
  const scrollAmount = (cardWidth + gap) * 3

  scrollContainer.value.scrollBy({
    left: direction === 'left' ? -scrollAmount : scrollAmount,
    behavior: 'smooth'
  })
}

onMounted(async () => {
  await nextTick()
  setTimeout(() => {
    updateScrollButtons()
    if (scrollContainer.value) {
      scrollContainer.value.addEventListener('scroll', handleScroll)
    }
    window.addEventListener('resize', updateScrollButtons)
  }, 100)

})

onUnmounted(() => {
  window.removeEventListener('resize', updateScrollButtons)
  if (scrollContainer.value) {
    scrollContainer.value.removeEventListener('scroll', handleScroll)
  }
})

</script>
