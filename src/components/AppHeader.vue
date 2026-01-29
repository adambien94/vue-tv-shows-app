<template>
  <div class="py-3 lg:py-4 px-4 lg:px-8 lg:flex lg:justify-between bg-primary border-b border-b-white/10">
    <div class="flex justify-between items-center">
      <RouterLink class="flex lg:px-2 lg:order-2" to="/">
        <h1 class="text-text-primary text-3xl lg:text-4xl font-black lg:px-2">
          <span class="text-accent-primary">TV</span>Shows
        </h1>
      </RouterLink>
      <div class="w-10 h-10 bg-white/10 rounded-full lg:order-1"></div>
    </div>

    <div class="mt-2 lg:mt-0 bg-secondary rounded-lg">
      <input type="text"
        class="w-full h-12 rounded-lg px-4 lg:w-96 bg-transparent outline-none border-none text-text-tertiary placeholder:text-text-tertiary foucs:outline focus:outline-accent-primary"
        placeholder="Search..." :value="modelValue" @input="onInput" @focus="onFocus" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter, useRoute } from 'vue-router'

defineProps<{
  modelValue?: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const router = useRouter()
const route = useRoute()

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
