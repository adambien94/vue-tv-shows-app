import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import MovieDetailsView from '@/views/MovieDetailsView.vue'
import SearchView from '@/views/SearchView.vue'
import NotFoundView from '@/views/NotFoundView.vue'

const APP_TITLE = 'TV Shows'

// Track if navigation is from browser back/forward (including swipe gestures)
let isPopstateNavigation = false
window.addEventListener('popstate', () => {
  isPopstateNavigation = true
})

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'home', component: HomeView, meta: { title: 'Home' } },
    { path: '/movie/:id', name: 'movie-details', component: MovieDetailsView },
    { path: '/search', name: 'search', component: SearchView, meta: { title: 'Search' } },
    { path: '/:pathMatch(.*)*', name: 'not-found', component: NotFoundView, meta: { title: 'Page Not Found' } },
  ],
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    }
    return { top: 0 }
  },
})

// Handle view transitions for forward navigations only
router.beforeResolve(async (to, from) => {
  // Skip view transition for back/forward navigation or same path
  if (isPopstateNavigation || to.path === from.path || !document.startViewTransition) {
    return
  }

  return new Promise<void>((resolve) => {
    document.startViewTransition(() => {
      resolve()
    })
  })
})

router.afterEach((to) => {
  // Reset popstate flag
  isPopstateNavigation = false

  // Update page title
  const pageTitle = to.meta.title as string | undefined
  document.title = pageTitle ? `${pageTitle} | ${APP_TITLE}` : APP_TITLE
})

export default router
