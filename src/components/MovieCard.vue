<template>
  <RouterLink class="card block select-none hover:brightness-[0.7] transition-all duration-300" :to="{
    name: 'movie-details',
    params: { id },
    query: genre ? { genre } : undefined,
  }">
    <div
      :class="['relative mx-auto w-full min-w-32 aspect-[5/7] lg:min-w-48 lg:max-w-96 before:absolute before:inset-0 after:rounded-[inherit] after:mix-blend-plus-lighter before:bg-white/10 rounded-lg lg:rounded-2xl overflow-hidden blend-border', { skeleton: !isLoaded && img }]">
      <img v-if="img" :src="img" :alt="name" loading="lazy"
        :class="['w-full h-full object-cover relative', isLoaded ? 'opacity-100' : 'opacity-0']"
        @load="isLoaded = true" />
      <div v-else class="w-full h-full bg-secondary/60 flex flex-col items-center justify-center text-text-tertiary">
        <svg class="w-12 h-12 lg:w-16 lg:h-16 opacity-40" viewBox="0 0 24 24" fill="none" stroke="currentColor"
          stroke-width="1.5">
          <rect x="2" y="4" width="20" height="16" rx="2" />
          <path d="M7 4v16M17 4v16M2 9h5M17 9h5M2 14h5M17 14h5" />
        </svg>
        <span class="mt-2 text-xs lg:text-sm opacity-60">No Image</span>
      </div>
    </div>

    <span class="mt-2 block mx-auto w-full min-w-32 lg:min-w-48 lg:max-w-96">
      <span class="text-text-primary font-bold lg:text-xl line-clamp-1">
        {{ name }}
      </span>
      <span class="flex items-center gap-2 mt-1">
        <span class="text-text-secondary text-xs lg:text-sm">Rating: <span class="font-semibold">{{ rating?.toFixed(1)
          || '-'
            }}</span> </span>
      </span>
    </span>
  </RouterLink>

</template>

<script setup lang="ts">
import { ref } from 'vue'

defineProps<{
  id: string | number
  name: string
  img?: string
  genre?: string
  rating?: number | null
}>()

const isLoaded = ref(false)
</script>


<style scoped>
.skeleton::before {
  animation: skeleton-pulse 2s ease-in-out infinite;
}

@keyframes skeleton-pulse {

  0%,
  100% {
    opacity: 0.2;
  }

  50% {
    opacity: 0.8;
  }
}
</style>
