/**
 * Rate Limiter - Prevents hitting TVMaze API rate limits
 *
 * THE PROBLEM:
 * TVMaze allows max 20 API calls per 10 seconds.
 * If you exceed this, you get HTTP 429 "Too Many Requests".
 *
 * THE SOLUTION:
 * This rate limiter:
 * 1. Queues all API requests
 * 2. Adds a 500ms delay between requests (= max 2 per second)
 * 3. If we get a 429, backs off exponentially (1s, 2s, 4s, 8s...)
 * 4. Retries failed requests automatically
 *
 * USAGE:
 *   Instead of: fetch(url)
 *   Use:        throttledFetch(url)
 */

type QueuedRequest = {
  url: string
  resolve: (value: Response) => void
  reject: (error: Error) => void
  retryCount: number
}

const MAX_RETRIES = 5
const BASE_DELAY_MS = 500 // 500ms between requests = max 2 per second
const MAX_BACKOFF_MS = 16000 // Max wait time: 16 seconds

class RateLimiter {
  private queue: QueuedRequest[] = []
  private isProcessing = false
  private lastRequestTime = 0

  /**
   * Queue a fetch request
   * Returns a Promise that resolves when the request completes
   */
  async fetch(url: string): Promise<Response> {
    return new Promise((resolve, reject) => {
      this.queue.push({ url, resolve, reject, retryCount: 0 })
      this.processQueue()
    })
  }

  /**
   * Process the queue one request at a time
   * Ensures proper spacing between requests
   */
  private async processQueue(): Promise<void> {
    // Don't start if already processing
    if (this.isProcessing || this.queue.length === 0) {
      return
    }

    this.isProcessing = true

    while (this.queue.length > 0) {
      const request = this.queue.shift()!

      // Ensure minimum delay between requests
      const now = Date.now()
      const timeSinceLastRequest = now - this.lastRequestTime
      if (timeSinceLastRequest < BASE_DELAY_MS) {
        await this.delay(BASE_DELAY_MS - timeSinceLastRequest)
      }

      try {
        const response = await fetch(request.url)
        this.lastRequestTime = Date.now()

        // Handle rate limiting (HTTP 429)
        if (response.status === 429) {
          if (request.retryCount < MAX_RETRIES) {
            // Exponential backoff: 1s, 2s, 4s, 8s, 16s
            const backoffMs = Math.min(
              Math.pow(2, request.retryCount) * 1000,
              MAX_BACKOFF_MS,
            )
            console.warn(
              `Rate limited (429). Waiting ${backoffMs}ms before retry ${request.retryCount + 1}/${MAX_RETRIES}`,
            )
            await this.delay(backoffMs)
            request.retryCount++
            this.queue.unshift(request) // Put back at front of queue
          } else {
            request.reject(new Error('Max retries exceeded due to rate limiting'))
          }
        } else {
          // Success! Resolve the promise
          request.resolve(response)
        }
      } catch (error) {
        // Network error - retry with backoff
        if (request.retryCount < MAX_RETRIES) {
          const backoffMs = Math.min(
            Math.pow(2, request.retryCount) * 1000,
            MAX_BACKOFF_MS,
          )
          console.warn(
            `Network error. Waiting ${backoffMs}ms before retry ${request.retryCount + 1}/${MAX_RETRIES}`,
          )
          await this.delay(backoffMs)
          request.retryCount++
          this.queue.unshift(request)
        } else {
          request.reject(error instanceof Error ? error : new Error(String(error)))
        }
      }
    }

    this.isProcessing = false
  }

  /**
   * Helper: Wait for specified milliseconds
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  /**
   * Cancel all pending requests (useful for cleanup)
   */
  clear(): void {
    for (const request of this.queue) {
      request.reject(new Error('Request cancelled'))
    }
    this.queue = []
  }

  /**
   * How many requests are waiting? (for debugging)
   */
  get pendingCount(): number {
    return this.queue.length
  }
}

// Single instance for the whole app
export const rateLimiter = new RateLimiter()

/**
 * Convenience function - use this instead of fetch()
 *
 * Example:
 *   const response = await throttledFetch('https://api.tvmaze.com/shows/1')
 */
export function throttledFetch(url: string): Promise<Response> {
  return rateLimiter.fetch(url)
}
