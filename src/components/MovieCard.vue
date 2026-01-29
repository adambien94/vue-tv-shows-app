<template>
  <RouterLink class="card block" :to="{
    name: 'movie-details',
    params: { id },
    query: genre ? { genre } : undefined,
  }">
    <div
      class="relative mx-auto w-full min-w-32 lg:min-w-64 lg:max-w-96 h-52 lg:h-96 rounded-lg lg:rounded-2xl overflow-hidden border border-solid border-white/10">
      <img :src="img" :alt="name" class="w-full h-full object-cover" />
    </div>

    <div class="mt-2 mx-auto w-full min-w-32 lg:min-w-64 lg:max-w-96">
      <h3 class="text-text-primary font-bold lg:text-xl line-clamp-1">
        {{ name }}
      </h3>
      <div class="flex items-center gap-2 mt-1">
        <!-- <p v-if="rating !== null && rating !== undefined" class="text-text-secondary text-xs lg:text-sm">
          ⭐ {{ rating.toFixed(1) }}
        </p> -->
        <p class="text-text-secondary text-xs lg:text-sm">839 votes</p>
      </div>
    </div>
  </RouterLink>

</template>

<script setup lang="ts">
defineProps<{
  id: string | number
  name: string
  img: string
  genre?: string
  rating?: number | null
}>()

</script>


<style scoped></style>
