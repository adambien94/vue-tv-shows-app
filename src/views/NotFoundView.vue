<template>
  <div class="not-found-container min-h-screen flex flex-col">
    <AppHeader />

    <div class="flex-1 flex items-center justify-center px-4">
      <div class="text-center max-w-lg">
        <div class="glitch-wrapper mb-6">
          <h1 class="error-code font-bold text-[120px] sm:text-[180px] leading-none tracking-tighter">
            404
          </h1>
        </div>

        <div class="static-lines mb-8">
          <p class="text-2xl sm:text-3xl font-semibold text-text-primary mb-3">
            Signal Lost
          </p>
          <p class="text-text-secondary text-lg">
            Looks like this channel doesn't exist. The show you're looking for has been cancelled or moved.
          </p>
        </div>

        <div class="flex flex-col sm:flex-row gap-4 justify-center mt-10">
          <RouterLink to="/"
            class="px-6 py-3 bg-accent-primary text-white font-semibold rounded-lg hover:bg-accent-primary/80 transition-all hover:scale-105">
            Back to Home
          </RouterLink>
          <RouterLink :to="{ name: 'search' }"
            class="px-6 py-3 border border-text-secondary/30 text-text-primary font-semibold rounded-lg hover:border-accent-primary hover:text-accent-primary transition-all">
            Search Shows
          </RouterLink>
        </div>

        <div class="mt-16 flex justify-center gap-2">
          <span v-for="i in 5" :key="i" class="bar" :style="{ animationDelay: `${i * 0.1}s` }"></span>
        </div>
      </div>
    </div>

    <AppFooter />
  </div>
</template>

<script setup lang="ts">
import AppHeader from '@/components/AppHeader.vue'
import AppFooter from '@/components/AppFooter.vue'
import { RouterLink } from 'vue-router'
</script>

<style scoped>
.not-found-container {
  background: radial-gradient(ellipse at top, #1a1a2e 0%, #0a0a0a 60%);
}

.error-code {
  background: linear-gradient(135deg, #6366f1 0%, #ec4899 50%, #6366f1 100%);
  background-size: 200% 200%;
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  animation: gradient-shift 3s ease infinite;
  text-shadow: 0 0 80px rgba(99, 102, 241, 0.5);
}

@keyframes gradient-shift {

  0%,
  100% {
    background-position: 0% 50%;
  }

  50% {
    background-position: 100% 50%;
  }
}

.glitch-wrapper {
  position: relative;
}

.glitch-wrapper::before,
.glitch-wrapper::after {
  content: '404';
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  font-size: 180px;
  font-weight: bold;
  opacity: 0.1;
  pointer-events: none;
}

.glitch-wrapper::before {
  color: #00ffff;
  animation: glitch-1 2s infinite;
}

.glitch-wrapper::after {
  color: #ff00ff;
  animation: glitch-2 2s infinite;
}

@keyframes glitch-1 {

  0%,
  90%,
  100% {
    transform: translateX(-50%);
  }

  92% {
    transform: translateX(calc(-50% - 8px));
  }

  94% {
    transform: translateX(calc(-50% + 8px));
  }
}

@keyframes glitch-2 {

  0%,
  90%,
  100% {
    transform: translateX(-50%);
  }

  91% {
    transform: translateX(calc(-50% + 6px));
  }

  93% {
    transform: translateX(calc(-50% - 6px));
  }
}

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

@media (max-width: 640px) {

  .glitch-wrapper::before,
  .glitch-wrapper::after {
    font-size: 120px;
  }
}
</style>
