<template>
  <HorizontalList v-if="loading || seasons.length > 0">
    <template #header>
      <h2 v-if="loading" class="text-text-primary">
        <span class="inline-block w-24 h-6 bg-secondary/60 rounded animate-pulse" />
      </h2>
      <h2 v-else class="text-text-primary">{{ seasons.length }} {{ seasons.length === 1 ? 'Season' : 'Seasons' }}</h2>
    </template>

    <template #items>
      <div v-if="loading" class="season-card relative self-stretch">
        <div
          class="relative w-32 lg:w-48 aspect-[5/7] rounded-lg lg:rounded-2xl overflow-hidden blend-border bg-secondary/40 animate-pulse">
          <div class="w-full h-full bg-gradient-to-br from-secondary/60 to-secondary/30" />
          <div class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3 pt-8">
            <span class="inline-block w-16 h-4 bg-secondary/60 rounded" />
            <span class="block w-12 h-3 bg-secondary/40 rounded mt-1.5" />
          </div>
        </div>
      </div>

      <template v-else>
        <div v-for="season in seasons" :key="season.id" class="season-card relative self-stretch">
          <div
            class="relative w-32 lg:w-48 aspect-[5/7] rounded-lg lg:rounded-2xl overflow-hidden blend-border bg-secondary/40">
            <img v-if="season.image?.medium || season.image?.original"
              :src="season.image?.medium || season.image?.original" :alt="`Season ${season.number}`" loading="lazy"
              class="w-full h-full object-cover" />
            <div v-else class="w-full h-full bg-gradient-to-br from-accent-primary/20 to-accent-primary/5" />

            <div class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3 pt-8">
              <span class="text-text-primary font-bold text-sm lg:text-base">Season {{ season.number }}</span>
              <span v-if="season.episodeOrder" class="block text-text-secondary text-xs mt-0.5">
                {{ season.episodeOrder }} episodes
              </span>
            </div>
          </div>

          <div class="absolute top-3 left-3 pointer-events-none">
            <div
              class="absolute -inset-4 [background:radial-gradient(ellipse_closest-side_at_center,rgba(0,0,0,.4)_0%,rgba(0,0,0,.24)_30%,rgba(0,0,0,.1)_60%,transparent_100%)]" />
            <span
              class="relative text-5xl lg:text-6xl font-black text-white/90 [mask-image:linear-gradient(to_bottom,black_60%,transparent)]">
              {{ season.number }}
            </span>
          </div>
        </div>
      </template>
    </template>
  </HorizontalList>
</template>

<script setup lang="ts">
import HorizontalList from '@/components/ui/HorizontalList.vue'
import type { Season } from '@/db'

defineProps<{
  seasons: Season[]
  loading?: boolean
}>()
</script>
