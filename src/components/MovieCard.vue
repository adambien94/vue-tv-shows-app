<template>
  <RouterLink class="card block" :to="`/movie/${id}`">
    <div
      class="relative mx-auto w-32 lg:w-64 h-52 lg:h-96 rounded-lg lg:rounded-2xl overflow-hidden border border-solid border-white/10">
      <img :src="img" :alt="title" class="w-full h-full object-cover" />
      <!-- <div class="test p-2 absolute w-full bottom-0 left-0 z-30 bg-black/50 text-center">
        <h3 class="text-accent-primary text-lg font-bold">
          8.1
        </h3>
      </div> -->
    </div>

    <div class="mt-2 mx-auto w-32 lg:w-64">
      <h3 class="text-text-primary font-bold lg:text-xl line-clamp-1">
        {{ title }}
      </h3>
      <p class="text-text-secondary text-xs lg:text-sm mt-1">839 votes</p>
    </div>
  </RouterLink>

</template>

<script setup lang="ts">
defineProps<{
  id: string
  title: string
  img: string,
}>()

</script>


<style scoped></style>
