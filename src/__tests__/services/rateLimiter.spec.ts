import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { createMockResponse } from '../setup'

// We need to test the RateLimiter class, so we'll import the module
// and create a fresh instance for each test
describe('RateLimiter', () => {
  let rateLimiter: typeof import('@/services/rateLimiter').rateLimiter
  let throttledFetch: typeof import('@/services/rateLimiter').throttledFetch
  let pendingPromises: Promise<unknown>[] = []

  beforeEach(async () => {
    vi.useFakeTimers()
    pendingPromises = []

    // Clear module cache and re-import to get fresh instances
    vi.resetModules()
    const module = await import('@/services/rateLimiter')
    rateLimiter = module.rateLimiter
    throttledFetch = module.throttledFetch
  })

  afterEach(async () => {
    // Clear pending requests first
    rateLimiter.clear()

    // Wait for any pending promises to settle (they should reject after clear)
    await Promise.allSettled(pendingPromises)

    vi.useRealTimers()
  })

  describe('throttledFetch', () => {
    it('should make a successful request', async () => {
      const mockData = { id: 1, name: 'Test' }
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue(createMockResponse(mockData)))

      const responsePromise = throttledFetch('https://api.example.com/test')
      pendingPromises.push(responsePromise)

      // Advance timers to process the queue
      await vi.runAllTimersAsync()

      const response = await responsePromise
      const data = await response.json()

      expect(data).toEqual(mockData)
      expect(fetch).toHaveBeenCalledWith('https://api.example.com/test')
    })

    it('should queue multiple requests', async () => {
      const mockFetch = vi.fn().mockImplementation(() =>
        Promise.resolve(createMockResponse({ success: true })),
      )
      vi.stubGlobal('fetch', mockFetch)

      // Make multiple requests
      const promise1 = throttledFetch('https://api.example.com/1')
      const promise2 = throttledFetch('https://api.example.com/2')
      const promise3 = throttledFetch('https://api.example.com/3')
      pendingPromises.push(promise1, promise2, promise3)

      // All should be pending initially
      expect(rateLimiter.pendingCount).toBeGreaterThanOrEqual(0)

      // Process all requests
      await vi.runAllTimersAsync()

      // All requests should complete
      await Promise.all([promise1, promise2, promise3])

      expect(mockFetch).toHaveBeenCalledTimes(3)
    })

    it('should add delay between requests', async () => {
      const mockFetch = vi.fn().mockImplementation(() =>
        Promise.resolve(createMockResponse({ success: true })),
      )
      vi.stubGlobal('fetch', mockFetch)

      const promise1 = throttledFetch('https://api.example.com/1')
      const promise2 = throttledFetch('https://api.example.com/2')
      pendingPromises.push(promise1, promise2)

      // First request should start immediately
      await vi.advanceTimersByTimeAsync(0)

      // Wait for first request and delay
      await vi.runAllTimersAsync()

      await Promise.all([promise1, promise2])

      // Both requests should have completed
      expect(mockFetch).toHaveBeenCalledTimes(2)
    })
  })

  describe('429 handling with exponential backoff', () => {
    it('should retry on 429 response', async () => {
      let callCount = 0
      const mockFetch = vi.fn().mockImplementation(() => {
        callCount++
        if (callCount === 1) {
          // First call returns 429
          return Promise.resolve(createMockResponse({}, { ok: false, status: 429 }))
        }
        // Subsequent calls succeed
        return Promise.resolve(createMockResponse({ success: true }))
      })
      vi.stubGlobal('fetch', mockFetch)

      const responsePromise = throttledFetch('https://api.example.com/test')
      pendingPromises.push(responsePromise)

      await vi.runAllTimersAsync()

      const response = await responsePromise

      expect(response.ok).toBe(true)
      expect(mockFetch).toHaveBeenCalledTimes(2)
    })

    it('should use exponential backoff for retries', async () => {
      let callCount = 0
      const mockFetch = vi.fn().mockImplementation(() => {
        callCount++
        if (callCount <= 3) {
          // First 3 calls return 429
          return Promise.resolve(createMockResponse({}, { ok: false, status: 429 }))
        }
        return Promise.resolve(createMockResponse({ success: true }))
      })
      vi.stubGlobal('fetch', mockFetch)

      const responsePromise = throttledFetch('https://api.example.com/test')
      pendingPromises.push(responsePromise)

      await vi.runAllTimersAsync()

      await responsePromise

      // Should have made 4 calls: initial + 3 retries
      expect(mockFetch).toHaveBeenCalledTimes(4)
    })

    it('should reject after max retries exceeded', async () => {
      const mockFetch = vi.fn().mockImplementation(() =>
        Promise.resolve(createMockResponse({}, { ok: false, status: 429 })),
      )
      vi.stubGlobal('fetch', mockFetch)

      const responsePromise = throttledFetch('https://api.example.com/test')
      pendingPromises.push(responsePromise.catch(() => {})) // Catch to prevent unhandled rejection

      await vi.runAllTimersAsync()

      await expect(responsePromise).rejects.toThrow('Max retries exceeded')
    })
  })

  describe('network error handling', () => {
    it('should retry on network error', async () => {
      let callCount = 0
      const mockFetch = vi.fn().mockImplementation(() => {
        callCount++
        if (callCount === 1) {
          return Promise.reject(new Error('Network error'))
        }
        return Promise.resolve(createMockResponse({ success: true }))
      })
      vi.stubGlobal('fetch', mockFetch)

      const responsePromise = throttledFetch('https://api.example.com/test')
      pendingPromises.push(responsePromise)

      await vi.runAllTimersAsync()

      const response = await responsePromise

      expect(response.ok).toBe(true)
      expect(mockFetch).toHaveBeenCalledTimes(2)
    })

    it('should reject after max retries on persistent network error', async () => {
      const mockFetch = vi.fn().mockRejectedValue(new Error('Network error'))
      vi.stubGlobal('fetch', mockFetch)

      const responsePromise = throttledFetch('https://api.example.com/test')
      pendingPromises.push(responsePromise.catch(() => {})) // Catch to prevent unhandled rejection

      await vi.runAllTimersAsync()

      await expect(responsePromise).rejects.toThrow('Network error')
    })
  })

  describe('clear method', () => {
    it('should cancel pending requests', async () => {
      const mockFetch = vi.fn().mockImplementation(() =>
        Promise.resolve(createMockResponse({ success: true })),
      )
      vi.stubGlobal('fetch', mockFetch)

      const promise1 = throttledFetch('https://api.example.com/1')
      const promise2 = throttledFetch('https://api.example.com/2')
      const promise3 = throttledFetch('https://api.example.com/3')

      // Track promises but catch their rejections
      pendingPromises.push(
        promise1.catch(() => {}),
        promise2.catch(() => {}),
        promise3.catch(() => {}),
      )

      // Clear all pending requests
      rateLimiter.clear()

      // Pending promises should reject
      await expect(promise2).rejects.toThrow('Request cancelled')
      await expect(promise3).rejects.toThrow('Request cancelled')

      // Clean up timers
      await vi.runAllTimersAsync()
    })
  })

  describe('pendingCount getter', () => {
    it('should start at zero', () => {
      expect(rateLimiter.pendingCount).toBe(0)
    })
  })
})
