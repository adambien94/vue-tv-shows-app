<template>
  <div class="flex-1 lg:mt-0 bg-white/5 rounded-lg relative">
    <input ref="searchInput" type="text" autofocus
      class="w-full h-12 rounded-lg px-4 pr-10 lg:w-96 bg-transparent outline-none border-none text-text-tertiary placeholder:text-text-tertiary foucs:outline focus:outline-accent-primary"
      :placeholder="placeholder || 'Search...'" :value="localValue" @input="onInput" @keydown.escape="onClear" />
    <button v-if="localValue" @click="onClear" type="button"
      class="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-primary transition-colors">
      <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
      </svg>
    </button>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch, nextTick } from 'vue'

const props = defineProps<{
  modelValue?: string
  placeholder?: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const searchInput = ref<HTMLInputElement | null>(null)
const localValue = ref(props.modelValue ?? '')
let debounceTimeout: ReturnType<typeof setTimeout> | null = null

watch(
  () => props.modelValue,
  (val) => {
    localValue.value = val ?? ''
  },
)

onMounted(async () => {
  await nextTick()
  focusInput()
})

onUnmounted(() => {
  if (debounceTimeout) clearTimeout(debounceTimeout)
})

const focusInput = () => {
  setTimeout(() => {
    searchInput.value?.focus()
  }, 50)
}

defineExpose({ focusInput })

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
