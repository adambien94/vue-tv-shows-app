<template>
  <button :class="arrowClasses"
    class="absolute mx-4 border border-white/20 top-1/2 -translate-y-1/2 z-10 bg-white/20 backdrop-blur-sm hover:bg-black/90 text-white/50 rounded-full p-2 lg:p-3 transition-all duration-200 shadow-lg"
    aria-label="Scroll right">
    <svg class="w-6 h-6 lg:w-8 lg:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path v-if="direction === 'right'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
        d="M9 5l7 7-7 7" />
      <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
    </svg>
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  direction: 'left' | 'right'
}>()

const arrowClasses = computed(() => {
  if (props.direction === 'right') {
    return 'right-0';
  } else {
    return 'left-0';
  }
});
</script>
