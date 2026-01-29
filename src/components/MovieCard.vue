<template>
  <RouterLink class="card block select-none hover:brightness-[0.7] transition-all duration-300" :to="{
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
        <span class="text-text-secondary text-xs lg:text-sm">Rating: <span class="font-semibold">{{ rating?.toFixed(1)
            }}</span> </span>
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
