# TV Shows Dashboard

A Vue.js application for browsing TV shows using the [TVMaze API](http://www.tvmaze.com/api). Built as a frontend developer assignment showcasing clean code, reusability, and modern frontend practices.

![Vue.js](https://img.shields.io/badge/Vue.js-3.5-4FC08D?logo=vuedotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-06B6D4?logo=tailwindcss&logoColor=white)

---

## Key Features

### 📺 Genre-Based Dashboard
TV shows organized into horizontal scrollable lists grouped by genre (Drama, Comedy, Action, etc.), with each category sorted by rating from highest to lowest.

### 🔍 Search Functionality
Full-text search allowing users to find shows by name. Search results are displayed in a clean grid layout with live filtering.

### 📱 Mobile-First Design
Built with a mobile-first approach using Tailwind CSS. The interface adapts seamlessly from phones to tablets to desktops. Touch-friendly horizontal scrolling on mobile, with navigation arrows appearing on hover for desktop users.

### ⚡ Offline Support
The app works even without an internet connection:
- **Service Worker** caches application assets (HTML, CSS, JS)
- **IndexedDB** stores show data locally
- **Offline banner** notifies users when they're working offline

### 🚀 Local-First Architecture
Instead of hitting the API on every page load, data is fetched once and stored in IndexedDB. The app automatically refreshes data every hour to keep content up-to-date while minimizing API calls. This means:
- Instant page loads after first visit
- Reduced API calls (respecting TVMaze rate limits)
- Automatic background sync every hour
- Full offline functionality

### 📄 Show Details
Clicking on any show opens a detailed view with:
- Show summary and metadata
- Season and episode information
- Cast information
- Rating display

---

## Getting Started

### Prerequisites

- **Node.js**: `^20.19.0` or `>=22.12.0`
- **npm**: Comes with Node.js

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd vue-tv-app

# Install dependencies
npm install

# Start development server
npm run dev
```

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build locally |
| `npm run test:unit` | Run unit tests |
| `npm run type-check` | TypeScript type checking |
| `npm run lint` | Run ESLint with auto-fix |

### Testing Offline Mode

To test offline functionality, you need a production build:

```bash
npm run build
npm run preview
```

1. Open the app and wait for initial sync to complete
2. Open DevTools → Application → Service Workers (verify `sw.js` is active)
3. Go to Network tab → check "Offline"
4. Refresh the page – the app should still work!

---

## Architecture Decisions

### Why Local-First with IndexedDB?
The TVMaze API doesn't have an endpoint to fetch shows by genre directly – `/shows` returns all shows with a `genres` array. Additionally, there's a rate limit of 20 requests per 10 seconds.

My solution: fetch the data once, store it in IndexedDB, and perform all filtering/sorting locally. This provides:
- Instant UI responses (no network latency for filtering)
- Works offline out of the box
- Respects API rate limits naturally

### Why Dexie.js?
IndexedDB's native API is callback-based and verbose. Dexie provides a clean Promise-based wrapper with powerful indexing features. The "multi-entry index" on the `genres` field allows efficient querying like "give me all shows with genre Drama" despite the data being stored as arrays.

### Why Not a Plugin for PWA?
I wrote the Service Worker manually instead of using `vite-plugin-pwa`. This gives full control over caching strategies and is simpler to understand and debug. The SW uses a cache-first strategy for app assets.

### Why Tailwind CSS?
Rapid styling with utility classes, excellent responsive design support, and it keeps component files focused on logic rather than scattered styles.

---

## Project Structure

```
src/
├── components/
│   ├── feedback/          # OfflineBanner, SyncStatus
│   ├── layout/            # AppHeader, AppFooter, SearchInput
│   ├── movie/             # MovieCard, MovieGrid, SeasonsList
│   └── ui/                # HorizontalList, ScrollBtn, LoadingIndicator
│
├── composables/
│   ├── useMovies.ts       # Data access layer (local-first logic)
│   └── useNetwork.ts      # Online/offline status tracking
│
├── db/
│   └── index.ts           # IndexedDB schema (Dexie.js)
│
├── services/
│   ├── rateLimiter.ts     # API request queue with backoff
│   └── syncService.ts     # Data sync logic
│
├── views/
│   ├── HomeView.vue       # Main dashboard with genre lists
│   ├── SearchView.vue     # Search results page
│   ├── MovieDetailsView.vue # Show details page
│   └── NotFoundView.vue   # 404 page
│
└── router/
    └── index.ts           # Vue Router configuration
```

---

## Tech Stack

| Technology | Purpose |
|------------|---------|
| **Vue 3** | UI framework with Composition API |
| **TypeScript** | Static typing for better DX and fewer bugs |
| **Vue Router** | SPA navigation |
| **Dexie.js** | IndexedDB wrapper for local storage |
| **Tailwind CSS** | Utility-first styling |
| **Vite** | Build tool and dev server |
| **Vitest** | Unit testing framework |

---

## Unit Tests

Tests are written using Vitest and Vue Test Utils. Run them with:

```bash
npm run test:unit
```

Test coverage includes:
- Component rendering and interactions
- Composables (useMovies, useNetwork)
- Service layer (rateLimiter, syncService)
- Database operations

---

## API Notes

The TVMaze API has some quirks I worked around:

1. **No genre endpoint**: The `/shows` endpoint returns all shows. I filter them locally using IndexedDB multi-entry indexes on the `genres` array field.

2. **Rate limiting**: Max 20 requests per 10 seconds. My `rateLimiter.ts` service queues requests and implements exponential backoff on 429 errors.

3. **Pagination**: The Show Index endpoint pages through all shows. I fetch multiple pages during initial sync and store everything locally.

---

## Browser Support

Tested on:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

Requires IndexedDB and Service Worker support for full offline functionality.

---

## License

This project was created as part of a frontend developer assessment.
