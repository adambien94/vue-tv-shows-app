<template>
  <Transition name="slide-down">
    <div
      v-if="!isOnline"
      class="offline-banner bg-amber-600 text-amber-950 text-center py-1.5 px-4 text-sm font-medium"
    >
      <div class="flex items-center justify-center gap-2">
        <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path
            d="M1 1l22 22M16.72 11.06A10.94 10.94 0 0 1 19 12.55M5 12.55a10.94 10.94 0 0 1 5.17-2.39M10.71 5.05A16 16 0 0 1 22.58 9M1.42 9a15.91 15.91 0 0 1 4.7-2.88M8.53 16.11a6 6 0 0 1 6.95 0M12 20h.01"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
        <span>You're offline — showing cached data</span>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { useNetwork } from '@/composables/useNetwork'

const { isOnline } = useNetwork()
</script>

<style scoped>
.offline-banner {
  position: relative;
  z-index: 100;
}

.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s ease;
}

.slide-down-enter-from,
.slide-down-leave-to {
  opacity: 0;
  transform: translateY(-100%);
}
</style>
