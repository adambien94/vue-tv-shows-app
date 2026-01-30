<template>
  <Transition name="slide">
    <div v-if="isSyncing" class="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-80 z-50">
      <div class="bg-secondary/95 backdrop-blur-sm rounded-xl border border-white/10 p-4 shadow-xl">
        <div class="flex items-center gap-3 mb-2">
          <div class="relative">
            <svg class="w-5 h-5 text-accent-primary animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              stroke-width="2">
              <path
                d="M12 2v4m0 12v4m-8-10H2m20 0h-2m-2.93-6.07l-1.41 1.41m-9.32 9.32l-1.41 1.41m12.14 0l1.41 1.41M6.34 6.34L4.93 4.93"
                stroke-linecap="round" />
            </svg>
          </div>
          <span class="text-text-primary text-sm font-medium">Syncing Data</span>
        </div>

        <div class="space-y-2">
          <div class="h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div
              class="h-full bg-gradient-to-r from-accent-primary to-indigo-400 rounded-full transition-all duration-300 ease-out"
              :style="{ width: `${syncProgress}%` }" />
          </div>

          <div class="flex justify-between items-center text-xs">
            <span class="text-text-tertiary truncate max-w-[70%]">{{ syncMessage }}</span>
            <span class="text-text-secondary font-mono">{{ syncProgress }}%</span>
          </div>
        </div>
      </div>
    </div>
  </Transition>

  <Transition name="slide">
    <div v-if="syncError && !isSyncing" class="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-80 z-50">
      <div class="bg-red-950/95 backdrop-blur-sm rounded-xl border border-red-500/30 p-4 shadow-xl">
        <div class="flex items-start gap-3">
          <svg class="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" />
            <path d="M12 8v4m0 4h.01" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
          </svg>
          <div class="flex-1 min-w-0">
            <p class="text-red-200 text-sm font-medium">Sync Error</p>
            <p class="text-red-300/70 text-xs mt-1 truncate">{{ syncError }}</p>
          </div>
          <button class="text-red-400 hover:text-red-300 transition-colors" @click="dismissError">
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M6 18L18 6M6 6l12 12" stroke-linecap="round" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useSyncStatus } from '@/services/syncService'

const { isSyncing, syncProgress, syncMessage, syncError } = useSyncStatus()

const showError = ref(false)

watch(syncError, (error) => {
  if (error) {
    showError.value = true
  }
})

const dismissError = () => {
  showError.value = false
}
</script>

<style scoped>
.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease;
}

.slide-enter-from,
.slide-leave-to {
  opacity: 0;
  transform: translateY(20px);
}
</style>
