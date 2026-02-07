/**
 * Service Worker - Makes the app work offline
 *
 * WHAT THIS DOES:
 * 1. Caches the app shell (HTML, CSS, JS) when installed
 * 2. Serves cached files when offline
 * 3. Updates cache when new version is deployed
 *
 * WITHOUT THIS: App shows "No internet" error when offline
 * WITH THIS: App loads from cache, uses IndexedDB data
 */

const CACHE_NAME = 'tv-shows-v1'

// Files to cache immediately on install
// These are the essential files needed to run the app
const PRECACHE_URLS = [
  './',
  './index.html',
  './manifest.json',
]

/**
 * INSTALL EVENT
 * Runs when the Service Worker is first installed.
 * Pre-caches essential files.
 */
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...')

  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Pre-caching app shell')
      return cache.addAll(PRECACHE_URLS)
    })
  )

  // Activate immediately without waiting for old SW to finish
  self.skipWaiting()
})

/**
 * ACTIVATE EVENT
 * Runs when the Service Worker takes control.
 * Cleans up old caches from previous versions.
 */
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...')

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => {
            console.log('[SW] Deleting old cache:', name)
            return caches.delete(name)
          })
      )
    })
  )

  // Take control of all pages immediately
  self.clients.claim()
})

/**
 * FETCH EVENT
 * Intercepts all network requests.
 *
 * STRATEGY:
 * - HTML pages: Network-first (try network, fall back to cache)
 * - JS/CSS/Images: Cache-first (use cache, update in background)
 * - API calls: Network-only (let IndexedDB handle data caching)
 */
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return
  }

  // Skip API requests - let the app handle these with IndexedDB
  if (url.hostname === 'api.tvmaze.com') {
    return
  }

  // Skip cross-origin requests (except for same-origin)
  if (url.origin !== self.location.origin) {
    return
  }

  event.respondWith(handleFetch(request))
})

/**
 * Handle fetch with appropriate caching strategy
 */
async function handleFetch(request) {
  // For navigation requests (HTML pages): Network-first
  if (request.mode === 'navigate') {
    return networkFirst(request)
  }

  // For assets (JS, CSS, images): Cache-first
  return cacheFirst(request)
}

/**
 * Network-First Strategy
 * Try network, fall back to cache if offline
 * Best for HTML pages that might be updated frequently
 */
async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request)

    // For navigation requests that return 404, fall back to index.html
    // This enables client-side routing to work on static hosts like GitHub Pages
    if (request.mode === 'navigate' && networkResponse.status === 404) {
      console.log('[SW] 404 for navigation request, falling back to index.html:', request.url)
      const requestUrl = new URL(request.url)
      // Construct index.html path: get base path from request and append index.html
      // e.g., /vue-tv-shows-app/search -> /vue-tv-shows-app/index.html
      const pathParts = requestUrl.pathname.split('/').filter(Boolean)
      const basePath = pathParts.length > 0 ? '/' + pathParts[0] + '/' : '/'
      const indexPath = new URL('index.html', requestUrl.origin + basePath)
      
      // Try cache first
      const indexResponse = await caches.match(indexPath)
      if (indexResponse) {
        return indexResponse
      }
      // If index.html not in cache, try fetching it
      try {
        const fetchedIndex = await fetch(indexPath)
        if (fetchedIndex.ok) {
          const cache = await caches.open(CACHE_NAME)
          cache.put(indexPath, fetchedIndex.clone())
          return fetchedIndex
        }
      } catch {
        // Fall through to return 404
      }
    }

    // If successful, cache it for offline use
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME)
      cache.put(request, networkResponse.clone())
    }

    return networkResponse
  } catch {
    // Network failed - try cache
    console.log('[SW] Network failed, trying cache for:', request.url)
    const cachedResponse = await caches.match(request)

    if (cachedResponse) {
      return cachedResponse
    }

    // If it's a navigation request and we have index.html cached, return that
    // This enables client-side routing to work offline
    if (request.mode === 'navigate') {
      const indexResponse = await caches.match('./index.html')
      if (indexResponse) {
        return indexResponse
      }
    }

    // Nothing in cache - return offline fallback or error
    return new Response('Offline', { status: 503, statusText: 'Service Unavailable' })
  }
}

/**
 * Cache-First Strategy
 * Use cache if available, fetch from network otherwise
 * Best for static assets that don't change often
 */
async function cacheFirst(request) {
  const cachedResponse = await caches.match(request)

  if (cachedResponse) {
    // Return cached version immediately
    // Also update cache in background (stale-while-revalidate)
    fetch(request)
      .then((networkResponse) => {
        if (networkResponse.ok) {
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, networkResponse)
          })
        }
      })
      .catch(() => {
        // Network failed, but we already returned cached version
      })

    return cachedResponse
  }

  // Not in cache - fetch from network and cache it
  try {
    const networkResponse = await fetch(request)

    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME)
      cache.put(request, networkResponse.clone())
    }

    return networkResponse
  } catch {
    // Network failed and not in cache
    console.log('[SW] Resource not available:', request.url)
    return new Response('Not found', { status: 404 })
  }
}
