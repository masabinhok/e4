// ./lib/api.ts
class ApiClient {
  private baseURL: string
  private isRefreshing = false

  // Queue item: when a 401 happens during a refresh,
  // we enqueue promises to retry once the refresh completes.
  private failedQueue: Array<{
    resolve: (value?: string | null) => void
    reject: (reason?: unknown) => void
  }> = []

  constructor(baseURL: string) {
    this.baseURL = baseURL
  }

  // Process the queue: if error is truthy, reject all; otherwise resolve with token
  private async processQueue(error: unknown, token: string | null = null): Promise<void> {
    this.failedQueue.forEach(({ resolve, reject }) => {
      if (error) {
        reject(error)
      } else {
        resolve(token)
      }
    })
    this.failedQueue = []
  }

  private async refreshToken(): Promise<string | null> {
    try {
      const response = await fetch(`${this.baseURL}/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      if (!response.ok) {
        return null
      }
      // If your refresh endpoint returns a new access token, parse it here:
      // e.g. const data = await response.json() as { accessToken: string }
      // return data.accessToken
      return null // or return actual token if needed
    } catch (err: unknown) {
      console.error('Token refresh failed:', err)
      return null
    }
  }

  // Main request method
  async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}/${endpoint}`

    const config: RequestInit = {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    }

    try {
      const response = await fetch(url, config)

      // Handle 401 Unauthorized by trying to refresh
      if (response.status === 401) {
        if (this.isRefreshing) {
          // Already refreshing: enqueue and wait
          return new Promise<string | null | undefined>((resolve, reject) => {
            this.failedQueue.push({ resolve, reject })
          }).then(() => {
            // After refresh, retry original request
            return this.request<T>(endpoint, options)
          }) as Promise<T>
        }

        this.isRefreshing = true

        // Attempt refresh
        const newToken = await this.refreshToken()
        this.isRefreshing = false

        if (newToken !== null) {
          // If you need to store/use the new token (e.g., set header), do it here.
          await this.processQueue(null, newToken)
          // Retry original request
          return this.request<T>(endpoint, options)
        } else {
          // Refresh failed: reject all queued, redirect to login
          await this.processQueue(new Error('Token refresh failed'))
          window.location.href = '/auth/login'
          throw new Error('Authentication failed')
        }
      }

      // If other error status
      if (!response.ok) {
        // Try parse error message
        let errorMessage = `HTTP ${response.status}`
        try {
          const errorData = await response.json()
          if (errorData && typeof errorData.message === 'string') {
            errorMessage = errorData.message
          }
        } catch {
          // ignore JSON parse error
        }
        throw new Error(errorMessage)
      }

      // Parse JSON as T
      return (await response.json()) as T
    } catch (err: unknown) {
      // Network or other errors
      if (err instanceof Error && err.message.includes('fetch')) {
        throw new Error('Network error. Please check your connection.')
      }
      throw err
    }
  }

  // Convenience methods with generic request/response types.
  get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' })
  }

  post<T, D = unknown>(endpoint: string, data?: D): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data !== undefined ? JSON.stringify(data) : undefined,
    })
  }

  put<T, D = unknown>(endpoint: string, data?: D): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data !== undefined ? JSON.stringify(data) : undefined,
    })
  }

  delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' })
  }
}

export const apiClient = new ApiClient(
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
)
