<template>
  <button
    class="z-10 hover:bg-white/10 hover:backdrop-blur-sm  text-white/50 rounded-lg py-3 transition-all duration-200 "
    aria-label="Scroll right">
    <svg class="w-6 h-6 lg:w-8 lg:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path v-if="direction === 'right'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
        d="M9 5l7 7-7 7" />
      <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
    </svg>
  </button>
</template>

<script setup lang="ts">
defineProps<{
  direction: 'left' | 'right'
}>()


</script>
