<template>
  <header class="bg-primary border-b border-b-white/10 sticky top-0 z-[2] w-full">
    <nav class="container px-4 lg:px-12  py-3 lg:py-4 lg:flex lg:justify-between w-full">
      <div class="flex justify-between items-center">
        <RouterLink to="/" class="text-text-primary text-3xl lg:text-4xl font-black ">
          <span class="text-accent-primary">TV</span>Shows
        </RouterLink>
      </div>

      <div class="flex gap-4 items-center mt-2">
        <div class="flex-1 lg:mt-0 bg-secondary rounded-lg">
          <input ref="searchInput" type="text"
            class="w-full h-12 rounded-lg px-4 lg:w-96 bg-transparent outline-none border-none text-text-tertiary placeholder:text-text-tertiary foucs:outline focus:outline-accent-primary"
            placeholder="Search..." :value="modelValue" @input="onInput" @focus="onFocus" />
        </div>
        <div class="w-10 h-10 bg-white/10 rounded-full lg:order-1"></div>
      </div>
    </nav>
  </header>
</template>

<script setup lang="ts">
import { nextTick, onMounted, ref, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const props = defineProps<{
  modelValue?: string
  autofocus?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const router = useRouter()
const route = useRoute()

const searchInput = ref<HTMLInputElement | null>(null)

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

const onFocus = () => {
  if (route.name !== 'search') {
    router.push({ name: 'search' })
  }
}

const onInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  emit('update:modelValue', target.value)
}
</script>
