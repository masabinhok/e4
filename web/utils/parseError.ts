export class FetchError extends Error {
  public status: number
  public data: unknown

  constructor(message: string, status: number, data?: unknown) {
    super(message)
    this.name = 'FetchError'
    this.status = status
    this.data = data
  }
}


export function parseError(error: unknown): string {
  // Detect our FetchError
  if (error instanceof FetchError) {
    // 401 specific
    if (error.status === 401) {
      return 'Invalid credentials. Please try again.'
    }
    // If data has message
    const data = error.data
    if (
      data &&
      typeof data === 'object' &&
      'message' in (data as any) &&
      typeof (data as any).message === 'string'
    ) {
      return (data as any).message
    }
    // Fallback to error.message
    return error.message || `Request failed with status ${error.status}`
  }

  // Network or other Error
  if (error instanceof Error) {
    // e.g., network error or thrown manually
    return error.message || 'Something went wrong. Please try again.'
  }

  // Unknown thrown value (e.g., someone did: throw 'oops')
  try {
    return JSON.stringify(error) || 'Something went wrong. Please try again.'
  } catch {
    return 'Something went wrong. Please try again.'
  }
}
