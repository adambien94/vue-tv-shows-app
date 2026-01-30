<template>
  <div v-if="visible" class="flex justify-center items-center gap-2" :class="containerClass">
    <span v-for="i in 5" :key="i" class="bar" :style="{ animationDelay: `${i * 0.1}s` }"></span>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const props = withDefaults(defineProps<{
  containerClass?: string
  delay?: number
}>(), {
  delay: 300
})

const visible = ref(props.delay === 0)
let timeout: ReturnType<typeof setTimeout> | null = null

onMounted(() => {
  if (props.delay > 0) {
    timeout = setTimeout(() => {
      visible.value = true
    }, props.delay)
  }
})

onUnmounted(() => {
  if (timeout) {
    clearTimeout(timeout)
  }
})
</script>

<style scoped>
.bar {
  display: inline-block;
  width: 4px;
  height: 24px;
  background: linear-gradient(to top, #6366f1, #a855f7);
  border-radius: 2px;
  animation: equalizer 0.8s ease-in-out infinite;
}

@keyframes equalizer {

  0%,
  100% {
    transform: scaleY(0.3);
    opacity: 0.4;
  }

  50% {
    transform: scaleY(1);
    opacity: 1;
  }
}
</style>
