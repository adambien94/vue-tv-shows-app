<template>
  <div class="pb-12">
    <div class="p-4">
      <div class="flex justify-between items-center">
        <h1 class="text-text-primary text-2xl font-bold">
          TV Shows
        </h1>
        <div class="w-10 h-10 bg-secondary rounded-full"></div>
      </div>


      <div class="mt-4 h-12 bg-secondary rounded-lg flex items-center px-4">
        <p class="text-text-tertiary">Search...</p>
      </div>
    </div>


    <div class="mt-2" v-for="category in categories" :key="category">
      <h2 class="px-4 text-text-secondary text-lg font-bold">
        {{ category }}
      </h2>

      <div class="mt-4">
        <div class="px-4 flex gap-4 overflow-x-scroll pb-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <!-- Card -->
          <div class="card" v-for="show in 3" :key="show">
            <div class="w-32 h-52 rounded-lg overflow-hidden border border-solid border-white/10">
              <img :src="imgs[show - 1]" alt="Show" class="w-full h-full object-cover" />
            </div>
            <h3 class="text-text-primary text-md mt-2">
              Breaking Bade...
            </h3>
            <p class="text-text-secondary text-xs mt-1">839 votes</p>
          </div>
        </div>
      </div>

      <!-- <div class="mx-4 border-b-2 border-b-white/10"></div> -->
    </div>
  </div>
</template>

<script setup lang="ts">

const imgs = ['https://cdn1.naekranie.pl/media/cache/amp/2014/12/breaking-bad-1.jpg', 'https://media.posterstore.com/site_images/68631db092c536b9cc92b06f_775081888_WB0101-5.jpg', 'https://play-lh.googleusercontent.com/5WZEffr_t4UHJGD2H9YxJiVoUnV8jA_DztRtdwkZpC4pJdk8ZIjOkMmabtJyaHPFM8Wp']
const categories = ['Top 10 Today', 'Comedy', 'Trending Dramas']
</script>


<style scoped></style>
