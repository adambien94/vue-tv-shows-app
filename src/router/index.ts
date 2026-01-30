import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import MovieDetailsView from '@/views/MovieDetailsView.vue'
import SearchView from '@/views/SearchView.vue'
import NotFoundView from '@/views/NotFoundView.vue'

const APP_TITLE = 'TV Shows'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'home', component: HomeView, meta: { title: 'Home' } },
    { path: '/movie/:id', name: 'movie-details', component: MovieDetailsView },
    { path: '/search', name: 'search', component: SearchView, meta: { title: 'Search' } },
    { path: '/:pathMatch(.*)*', name: 'not-found', component: NotFoundView, meta: { title: 'Page Not Found' } },
  ],
  scrollBehavior() {
    return { top: 0 }
  },
})

// Handle view transitions for all navigations
router.beforeResolve(async (to, from) => {
  // Skip if navigating to same path or view transitions not supported
  if (to.path === from.path || !document.startViewTransition) {
    return
  }

  // Wrap the navigation in a view transition
  return new Promise<void>((resolve) => {
    document.startViewTransition(() => {
      resolve()
    })
  })
})

router.afterEach((to) => {
  const pageTitle = to.meta.title as string | undefined
  document.title = pageTitle ? `${pageTitle} | ${APP_TITLE}` : APP_TITLE
})

export default router
