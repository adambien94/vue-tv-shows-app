<template>
  <header class="bg-primary backdrop-blur-sm border-b border-b-white/5 sticky top-0 z-[2] w-full">
    <nav class="container px-4 lg:px-12 py-3 lg:py-4 flex justify-between items-center gap-4 w-full">
      <RouterLink to="/" @click="goHome" class="text-text-primary text-3xl lg:text-4xl font-black shrink-0"
        :class="isSearchPage ? 'hidden lg:block' : ''">
        <span class="text-accent-primary inline-block rotate-12">TV</span>Shows
      </RouterLink>

      <div class="flex items-center gap-4" :class="isSearchPage ? 'flex-1 lg:flex-none' : ''">
        <button v-if="isSearchPage" @click="goBack"
          class="lg:hidden w-10 h-10 flex items-center justify-center text-text-tertiary hover:text-text-primary transition-colors shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
        </button>

        <SearchInput v-if="isSearchPage" :model-value="modelValue" :autofocus="autofocus" :placeholder="placeholder"
          @update:model-value="$emit('update:modelValue', $event)" class="flex-1 lg:flex-none lg:w-96" />

        <RouterLink v-if="!isSearchPage" to="/search"
          class="h-12 bg-white/5 rounded-lg flex items-center justify-center gap-3 text-text-tertiary hover:text-text-primary hover:bg-white/10 transition-colors shrink-0 w-12 lg:w-auto lg:px-4">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <span class="hidden lg:inline whitespace-nowrap pr-4">Search in tv shows...</span>
        </RouterLink>

        <div class="w-12 h-12 bg-white/10 rounded-full overflow-hidden shrink-0"
          :class="isSearchPage ? 'hidden lg:block' : ''">
          <img src="../../assets/image/TV-show-profile.png" alt="TV Shows" class="object-cover" />
        </div>
      </div>
    </nav>
  </header>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import SearchInput from '@/components/layout/SearchInput.vue'

defineProps<{
  modelValue?: string
  autofocus?: boolean
  placeholder?: string
}>()

defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const router = useRouter()
const route = useRoute()

const isSearchPage = computed(() => route.name === 'search')

const goHome = (e: MouseEvent) => {
  if (route.name === 'home') return
  e.preventDefault()
  router.push('/')
}

const goBack = () => {
  router.back()
}
</script>
