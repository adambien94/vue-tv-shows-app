/**
 * Vitest Test Setup
 *
 * This file is loaded before each test file runs.
 * It sets up global mocks for:
 * - IndexedDB (via fake-indexeddb)
 * - fetch API
 * - navigator.onLine
 * - Image imports
 */

import 'fake-indexeddb/auto'
import { vi, beforeEach, afterEach } from 'vitest'
import type { Show, Season } from '@/db'

// Mock image imports
vi.mock('@/assets/images/logo.png', () => ({ default: '' }))
vi.mock('../assets/images/logo.png', () => ({ default: '' }))

// Reset all mocks between tests
beforeEach(() => {
  vi.clearAllMocks()
})

afterEach(() => {
  vi.restoreAllMocks()
})

// ============================================
// Mock Helpers
// ============================================

/**
 * Set navigator.onLine value for testing offline behavior
 */
export function setOnlineStatus(online: boolean): void {
  Object.defineProperty(navigator, 'onLine', {
    value: online,
    writable: true,
    configurable: true,
  })
}

/**
 * Trigger online/offline events for testing useNetwork composable
 */
export function triggerOnlineEvent(): void {
  window.dispatchEvent(new Event('online'))
}

export function triggerOfflineEvent(): void {
  window.dispatchEvent(new Event('offline'))
}

// ============================================
// Test Data Factories
// ============================================

/**
 * Create a mock Show object for testing
 */
export function createMockShow(overrides: Partial<Show> = {}): Show {
  return {
    id: Math.floor(Math.random() * 10000),
    name: 'Test Show',
    genres: ['Drama'],
    rating: { average: 8.5 },
    image: {
      medium: 'https://example.com/medium.jpg',
      original: 'https://example.com/original.jpg',
    },
    summary: '<p>A test show summary.</p>',
    premiered: '2020-01-01',
    updated: Date.now(),
    ...overrides,
  }
}

/**
 * Create multiple mock shows with different genres
 */
export function createMockShows(count: number): Show[] {
  const genres = ['Drama', 'Comedy', 'Action', 'Thriller', 'Sci-Fi', 'Horror']
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    name: `Show ${i + 1}`,
    genres: [genres[i % genres.length] as string, genres[(i + 1) % genres.length] as string],
    rating: { average: 5 + (i % 5) },
    image: {
      medium: `https://example.com/show${i + 1}-medium.jpg`,
      original: `https://example.com/show${i + 1}-original.jpg`,
    },
    summary: `<p>Summary for Show ${i + 1}</p>`,
    premiered: `202${i % 5}-01-01`,
    updated: Date.now() - i * 1000,
  }))
}

/**
 * Create a mock Season object for testing
 */
export function createMockSeason(overrides: Partial<Season> = {}): Season {
  return {
    id: Math.floor(Math.random() * 10000),
    number: 1,
    name: 'Season 1',
    episodeOrder: 10,
    premiereDate: '2020-01-01',
    endDate: '2020-03-01',
    image: {
      medium: 'https://example.com/season-medium.jpg',
      original: 'https://example.com/season-original.jpg',
    },
    summary: '<p>Season summary.</p>',
    ...overrides,
  }
}

/**
 * Create multiple mock seasons
 */
export function createMockSeasons(count: number): Season[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    number: i + 1,
    name: `Season ${i + 1}`,
    episodeOrder: 10 + i,
    premiereDate: `202${i}-01-01`,
    endDate: `202${i}-03-01`,
  }))
}

// ============================================
// Fetch Mock Helpers
// ============================================

/**
 * Create a mock Response object
 */
export function createMockResponse(
  data: unknown,
  options: { ok?: boolean; status?: number } = {},
): Response {
  const { ok = true, status = 200 } = options
  return {
    ok,
    status,
    json: () => Promise.resolve(data),
    text: () => Promise.resolve(JSON.stringify(data)),
    headers: new Headers(),
    redirected: false,
    statusText: ok ? 'OK' : 'Error',
    type: 'basic',
    url: '',
    clone: () => createMockResponse(data, options),
    body: null,
    bodyUsed: false,
    arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
    blob: () => Promise.resolve(new Blob()),
    formData: () => Promise.resolve(new FormData()),
    bytes: () => Promise.resolve(new Uint8Array()),
  } as Response
}

/**
 * Create a mock fetch function that returns specified responses
 */
export function createMockFetch(responses: Map<string, Response | (() => Response)>): typeof fetch {
  return vi.fn((url: string | URL | Request) => {
    const urlString = url.toString()
    for (const [pattern, response] of responses) {
      if (urlString.includes(pattern)) {
        const res = typeof response === 'function' ? response() : response
        return Promise.resolve(res)
      }
    }
    // Default: return empty array
    return Promise.resolve(createMockResponse([]))
  }) as unknown as typeof fetch
}
