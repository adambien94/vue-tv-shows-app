import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import MovieDetailsView from '@/views/MovieDetailsView.vue'
import SearchView from '@/views/SearchView.vue'

const APP_TITLE = 'TV Shows'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'home', component: HomeView, meta: { title: 'Home' } },
    { path: '/movie/:id', name: 'movie-details', component: MovieDetailsView },
    { path: '/search', name: 'search', component: SearchView, meta: { title: 'Search' } },
  ],
  scrollBehavior() {
    return { top: 0 }
  },
})

router.afterEach((to) => {
  const pageTitle = to.meta.title as string | undefined
  document.title = pageTitle ? `${pageTitle} | ${APP_TITLE}` : APP_TITLE
})

export default router
