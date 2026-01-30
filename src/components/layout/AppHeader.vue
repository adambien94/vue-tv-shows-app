<template>
  <header class="bg-primary border-b border-b-white/5 sticky top-0 z-[2] w-full">
    <nav class="container px-4 lg:px-12  py-3 lg:py-4 lg:flex lg:justify-between w-full">
      <div class="flex justify-between items-center">
        <RouterLink to="/" @click="goHome" class="text-text-primary text-3xl lg:text-4xl font-black ">
          <span class="text-accent-primary inline-block rotate-12">TV</span>Shows
        </RouterLink>
      </div>

      <div class="flex gap-4 items-center mt-2">
        <SearchInput
          :model-value="modelValue"
          :autofocus="autofocus"
          :placeholder="placeholder"
          @update:model-value="$emit('update:modelValue', $event)"
          @focus="onSearchFocus"
        />
        <div class="w-12 h-12 bg-white/10 rounded-full lg:order-1 overflow-hidden" />
      </div>
    </nav>
  </header>
</template>

<script setup lang="ts">
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

const goHome = (e: MouseEvent) => {
  if (route.name === 'home') return
  e.preventDefault()
  router.push('/')
}

const onSearchFocus = () => {
  if (route.name !== 'search') {
    router.push({ name: 'search' })
  }
}
</script>
