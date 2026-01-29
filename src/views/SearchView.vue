<template>
  <div class="pb-12">
    <AppHeader v-model="searchTerm" :autofocus="true" />

    <div class="container min-h-[50vh] pt-6 lg:pt-8 lg:px-8">
      <div class="flex justify-between items-center mb-4 px-4 ">
        <!-- TODO: move it to component -->
        <div class="flex gap-4 text-text-secondary text-lg lg:text-2xl font-bold">
          <h2>{{ !!searchTerm ? `Search results for '${searchTerm}'` : 'Search your TV shows' }}</h2>
          <span class="text-accent-primary">&#10095;</span>
        </div>

        <p class="text-text-tertiary text-sm">
          <template v-if="searchLoading">Searching...</template>
          <template v-else>{{ searchResults.length }} result{{ searchResults.length === 1 ? '' : 's' }}</template>
        </p>
      </div>

      <div v-if="searchLoading" class="px-4 lg:px-12 mt-8 text-text-tertiary text-center">
        <p>Searching...</p>
      </div>

      <div v-else-if="searchResults.length" class="mt-2">
        <SearchList :movies="searchResults" />
      </div>

      <div v-else class="px-4 lg:px-12 mt-8 text-text-tertiary text-center">
        <p>{{ !searchTerm || !searchLoading ? 'Start searching for your favorite TVshows' : 'No results.' }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppHeader from '@/components/AppHeader.vue'
import SearchList from '@/components/SearchList.vue'
import { useMovies } from '@/composables/useMovies'

const route = useRoute()
const router = useRouter()

const searchTerm = ref((route.query.q as string) || '')

const { searchMoviesApi, searchResults, searchLoading } = useMovies()

let debounceTimeout: ReturnType<typeof setTimeout> | null = null

watch(searchTerm, (newTerm) => {
  router.replace({
    name: 'search',
    query: newTerm ? { q: newTerm } : {},
  })

  if (debounceTimeout) {
    clearTimeout(debounceTimeout)
  }

  debounceTimeout = setTimeout(() => {
    searchMoviesApi(newTerm)
  }, 300)
})

onMounted(() => {
  if (searchTerm.value) {
    searchMoviesApi(searchTerm.value)
  }
})
</script>
