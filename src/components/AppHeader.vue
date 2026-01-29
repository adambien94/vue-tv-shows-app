<template>
  <header class="bg-primary border-b border-b-white/5 sticky top-0 z-[2] w-full">
    <nav class="container px-4 lg:px-12  py-3 lg:py-4 lg:flex lg:justify-between w-full">
      <div class="flex justify-between items-center">
        <a href="/" @click="goHome" class="text-text-primary text-3xl lg:text-4xl font-black ">
          <span class="text-accent-primary inline-block rotate-12">TV</span>Shows
        </a>
      </div>

      <div class="flex gap-4 items-center mt-2">
        <div class="flex-1 lg:mt-0 bg-secondary rounded-lg relative">
          <input ref="searchInput" type="text"
            class="w-full h-12 rounded-lg px-4 pr-10 lg:w-96 bg-transparent outline-none border-none text-text-tertiary placeholder:text-text-tertiary foucs:outline focus:outline-accent-primary"
            :placeholder="props.placeholder || 'Search...'" :value="localValue" @input="onInput" @focus="onFocus"
            @keydown.escape="onClear" />
          <button v-if="localValue" @click="onClear" type="button"
            class="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-primary transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        <div class="w-12 h-12 bg-white/10 rounded-full lg:order-1"></div>
      </div>
    </nav>
  </header>
</template>

<script setup lang="ts">
import { nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const props = defineProps<{
  modelValue?: string
  autofocus?: boolean
  placeholder?: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const router = useRouter()
const route = useRoute()

const searchInput = ref<HTMLInputElement | null>(null)
const localValue = ref(props.modelValue ?? '')
let debounceTimeout: ReturnType<typeof setTimeout> | null = null

watch(
  () => props.modelValue,
  (val) => {
    localValue.value = val ?? ''
  },
)

onUnmounted(() => {
  if (debounceTimeout) clearTimeout(debounceTimeout)
})

const focusInput = async () => {
  await nextTick()
  searchInput.value?.focus()
}

onMounted(() => {
  if (props.autofocus) {
    focusInput()
  }
})

watch(
  () => props.autofocus,
  (val) => {
    if (val) {
      focusInput()
    }
  },
)

const goHome = (e: MouseEvent) => {
  if (route.name === 'home') return
  e.preventDefault()
  if (document.startViewTransition) {
    document.startViewTransition(() => router.push('/'))
  } else {
    router.push('/')
  }
}

const onFocus = () => {
  if (route.name !== 'search') {
    if (document.startViewTransition) {
      document.startViewTransition(() => router.push({ name: 'search' }))
    } else {
      router.push({ name: 'search' })
    }
  }
}

const onInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  localValue.value = target.value

  if (debounceTimeout) clearTimeout(debounceTimeout)
  debounceTimeout = setTimeout(() => {
    emit('update:modelValue', localValue.value)
  }, 300)
}

const onClear = () => {
  if (debounceTimeout) clearTimeout(debounceTimeout)
  localValue.value = ''
  emit('update:modelValue', '')
  focusInput()
}
</script>
