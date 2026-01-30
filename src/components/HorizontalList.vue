<template>
  <div>
    <div class="px-4 lg:px-12 flex gap-4 text-text-secondary text-lg lg:text-2xl font-bold">
      <slot name="header">
        <h2>{{ title }}</h2>
      </slot>
    </div>

    <div class="mt-2 sm:mt-4 relative lg:px-12 group">
      <ScrollBtn v-if="canScrollLeft" direction="left" @click="arrowScroll('left')"
        class="hidden lg:block opacity-0 group-hover:opacity-100 transition-opacity duration-300 left-0 absolute top-1/2 -translate-y-[calc(50%+32px)]" />

      <div ref="scrollContainer"
        class="overscroll-x-contain px-4 lg:-mx-4 flex items-stretch gap-4 [--fade-length:18px] overflow-x-scroll pb-4 sm:pb-6 scroll-smooth scrollbar-hide lg:[mask-image:linear-gradient(to_right,transparent,black_var(--fade-length),black_calc(100%-var(--fade-length)),transparent)]"
        @scroll="handleScroll">
        <slot name="items" />
      </div>

      <ScrollBtn v-if="canScrollRight" direction="right" @click="arrowScroll('right')"
        class="hidden lg:block opacity-0 group-hover:opacity-100 transition-opacity duration-300 right-0 absolute top-1/2 -translate-y-[calc(50%+32px)]" />
    </div>
  </div>
</template>

<script setup lang="ts">
import ScrollBtn from '@/components/ScrollBtn.vue'
import { ref, onMounted, onUnmounted, nextTick, useTemplateRef } from 'vue'

defineProps<{
  title?: string
}>()

const scrollContainer = useTemplateRef<HTMLElement>('scrollContainer')
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

  const firstCard = scrollContainer.value.firstElementChild as HTMLElement
  if (!firstCard) return

  const cardWidth = firstCard.getBoundingClientRect().width
  const gap = 16
  const scrollAmount = (cardWidth + gap) * 3

  scrollContainer.value.scrollBy({
    left: direction === 'left' ? -scrollAmount : scrollAmount,
    behavior: 'smooth'
  })
}

const refresh = async () => {
  await nextTick()
  setTimeout(updateScrollButtons, 100)
}

defineExpose({ refresh })

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
