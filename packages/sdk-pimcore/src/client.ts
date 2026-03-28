import type { PimcoreClientConfig } from './types'

export class PimcoreClient {
  private readonly baseUrl: string
  private accessToken: string | null
  private tokenExpiresAt: number | null

  constructor(config: PimcoreClientConfig) {
    this.baseUrl = config.baseUrl.replace(/\/$/, '')
    this.accessToken = config.accessToken ?? null
    this.tokenExpiresAt = config.tokenExpiresAt ?? null
  }

  setAccessToken(token: string, expiresIn: number): void {
    this.accessToken = token
    this.tokenExpiresAt = Date.now() + expiresIn * 1000
  }

  getAccessToken(): string | null {
    return this.accessToken
  }

  isTokenExpired(): boolean {
    if (this.tokenExpiresAt === null) {
      return true
    }
    return Date.now() >= this.tokenExpiresAt
  }

  async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${path}`

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> | undefined),
    }

    if (this.accessToken !== null) {
      headers['Authorization'] = `Bearer ${this.accessToken}`
    }

    const response = await fetch(url, {
      ...options,
      headers,
    })

    if (!response.ok) {
      throw new Error(`Pimcore API request failed: ${response.status} ${response.statusText}`)
    }

    return response.json() as Promise<T>
  }
}
