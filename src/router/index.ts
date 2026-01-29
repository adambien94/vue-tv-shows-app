import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import MovieDetailsView from '@/views/MovieDetailsView.vue'
import SearchView from '@/views/SearchView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'home', component: HomeView },
    { path: '/movie/:id', name: 'movie-details', component: MovieDetailsView },
    { path: '/search', name: 'search', component: SearchView },
  ],
})

export default router
