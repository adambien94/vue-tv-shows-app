type QueuedRequest = {
  url: string
  resolve: (value: Response) => void
  reject: (error: Error) => void
  retryCount: number
}

const MAX_RETRIES = 5
const BASE_DELAY_MS = 500 // 2 requests per second = 500ms between requests
const MAX_BACKOFF_MS = 16000

class RateLimiter {
  private queue: QueuedRequest[] = []
  private isProcessing = false
  private lastRequestTime = 0

  async fetch(url: string): Promise<Response> {
    return new Promise((resolve, reject) => {
      this.queue.push({ url, resolve, reject, retryCount: 0 })
      this.processQueue()
    })
  }

  private async processQueue(): Promise<void> {
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

        if (response.status === 429) {
          // Rate limited - apply exponential backoff
          if (request.retryCount < MAX_RETRIES) {
            const backoffMs = Math.min(
              Math.pow(2, request.retryCount) * 1000,
              MAX_BACKOFF_MS,
            )
            console.warn(
              `Rate limited (429). Retrying in ${backoffMs}ms (attempt ${request.retryCount + 1}/${MAX_RETRIES})`,
            )
            await this.delay(backoffMs)
            request.retryCount++
            this.queue.unshift(request) // Re-add to front of queue
          } else {
            request.reject(new Error('Max retries exceeded due to rate limiting'))
          }
        } else {
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
            `Network error. Retrying in ${backoffMs}ms (attempt ${request.retryCount + 1}/${MAX_RETRIES})`,
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

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  // Cancel all pending requests
  clear(): void {
    for (const request of this.queue) {
      request.reject(new Error('Request cancelled'))
    }
    this.queue = []
  }

  // Get queue length for progress tracking
  get pendingCount(): number {
    return this.queue.length
  }
}

// Singleton instance
export const rateLimiter = new RateLimiter()

// Convenience function
export function throttledFetch(url: string): Promise<Response> {
  return rateLimiter.fetch(url)
}
