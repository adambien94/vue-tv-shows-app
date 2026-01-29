<template>
  <div class="px-4 lg:px-12 flex gap-4 text-text-secondary text-lg lg:text-2xl font-bold ">
    <h2>{{ genreText }} {{ genre }}</h2>
    <span class="text-accent-primary">&#10095;</span>
  </div>

  <div class="mt-4 relative lg:px-12 group">
    <ScrollBtn v-if="canScrollLeft" direction="left" @click="arrowScroll('left')"
      class="hidden lg:block opacity-0 group-hover:opacity-100 transition-opacity duration-300 left-0 absolute top-1/2 -translate-y-[calc(50%+32px)]" />

    <div ref="scrollContainer"
      class=" overscroll-x-none px-4 lg:-mx-4 flex gap-4 [--fade-length:18px] overflow-x-scroll pb-6 scroll-smooth scrollbar-hide lg:[mask-image:linear-gradient(to_right,transparent,black_var(--fade-length),black_calc(100%-var(--fade-length)),transparent)]"
      @scroll="handleScroll">
      <div v-for="movie in movies" :key="movie.id" ref="cardRefs">
        <MovieCard :id="movie.id" :name="movie.name" :genre="genre" :img="movie.image?.medium || movie.image?.original"
          :rating="movie.rating?.average" />
      </div>
    </div>

    <ScrollBtn v-if="canScrollRight" direction="right" @click="arrowScroll('right')"
      class="hidden lg:block opacity-0 group-hover:opacity-100 transition-opacity duration-300 right-0 absolute top-1/2 -translate-y-[calc(50%+32px)] " />
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
const cardRefs = ref<HTMLElement[]>([])
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

  const firstCard = cardRefs.value[0]
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
