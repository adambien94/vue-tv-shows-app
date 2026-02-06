<template>
  <header class="bg-primary backdrop-blur-sm border-b border-b-white/5 sticky top-0 z-[2] w-full">
    <nav class="container px-4 lg:px-12 py-3 lg:py-4 lg:flex lg:justify-between w-full">
      <div
        class="flex justify-between items-center overflow-hidden transition-all duration-300 ease-out lg:!max-h-none lg:!opacity-100 lg:!mb-0"
        :class="logoVisible ? 'max-h-12 opacity-100 mb-0' : 'max-h-0 opacity-0 -mb-2'">
        <RouterLink to="/" @click="goHome" class="text-text-primary text-3xl lg:text-4xl font-black">
          <span class="text-accent-primary inline-block rotate-12">TV</span>Shows
        </RouterLink>
      </div>

      <div class="flex gap-4 items-center mt-2 lg:mt-0">
        <SearchInput :model-value="modelValue" :autofocus="autofocus" :placeholder="placeholder"
          @update:model-value="$emit('update:modelValue', $event)" @focus="onSearchFocus" />
        <div class="w-12 h-12 bg-white/10 rounded-full lg:order-1 overflow-hidden">
          <img src="../../assets/image/TV-show-profile.png" alt="TV Shows" class="object-cover" />
        </div>
      </div>
    </nav>
  </header>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
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

const logoVisible = ref(true)
let lastScrollY = 0
const scrollThreshold = 10

const handleScroll = () => {
  if (window.innerWidth >= 1024) {
    logoVisible.value = true
    return
  }

  const currentScrollY = window.scrollY

  if (currentScrollY <= 10 || currentScrollY < lastScrollY - scrollThreshold) {
    logoVisible.value = true
  }
  else if (currentScrollY > lastScrollY + scrollThreshold) {
    logoVisible.value = false
  }

  lastScrollY = currentScrollY
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll, { passive: true })
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})

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
