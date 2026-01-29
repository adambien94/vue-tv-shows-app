<template>
  <RouterLink class="card block select-none" :to="{
    name: 'movie-details',
    params: { id },
    query: genre ? { genre } : undefined,
  }">
    <div
      class="relative mx-auto w-full min-w-32 aspect-[5/7] lg:min-w-48 lg:max-w-96  rounded-lg lg:rounded-2xl overflow-hidden border border-solid border-white/10">
      <img :src="img" :alt="name" loading="lazy" class="w-full h-full object-cover" />
    </div>

    <span class="mt-2 block mx-auto w-full min-w-32 lg:min-w-48 lg:max-w-96">
      <span class="text-text-primary font-bold lg:text-xl line-clamp-1">
        {{ name }}
      </span>
      <span class="flex items-center gap-2 mt-1">
        <!-- <p v-if="rating !== null && rating !== undefined" class="text-text-secondary text-xs lg:text-sm">
          ⭐ {{ rating.toFixed(1) }}
        </p> -->
        <!-- <div class="flex flex-wrap items-center gap-3 absolute top-[1px] ">
          <div class="px-3 py-1 rounded-full bg-black/50 backdrop-blur-sm text-text-primary/80 border border-white/10">
            <span class="font-semibold">{{
              rating?.toFixed(1)
            }}</span>
            <span class="text-sm text-text-primary/60"> / 10</span>
          </div>
        </div> -->
        <p class="text-text-secondary text-xs lg:text-sm">Rating: <span class="font-semibold">{{ rating?.toFixed(1)
            }}</span> </p>
      </span>
    </span>
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
