import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './assets/main.css'

const app = createApp(App)

app.use(router)

app.mount('#app')

/**
 * Register Service Worker for offline support
 *
 * The Service Worker caches the app shell (HTML, CSS, JS)
 * so the app can load even when offline.
 * Data is cached separately in IndexedDB.
 *
 * Only register in production - Vite dev server doesn't serve sw.js correctly
 */
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register(`${import.meta.env.BASE_URL}sw.js`)
      .then((registration) => {
        console.log('Service Worker registered:', registration.scope)

        // Check for updates periodically
        setInterval(() => {
          registration.update()
        }, 60 * 60 * 1000) // Check every hour
      })
      .catch((error) => {
        console.error('Service Worker registration failed:', error)
      })
  })
}
