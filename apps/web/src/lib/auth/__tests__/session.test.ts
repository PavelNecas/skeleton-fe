import { describe, it, expect, vi, beforeEach } from 'vitest'

import type { TokenResponse } from '@skeleton-fe/sdk-pimcore'

// We need to test in dev mode (non-production) by default
vi.stubEnv('NODE_ENV', 'test')

// Import after env is set
const { setAuthCookies, clearAuthCookies, getAccessToken, getRefreshToken, hasValidAccessToken } =
  await import('../session')

const { COOKIE_ACCESS_TOKEN, COOKIE_REFRESH_TOKEN } = await import('../constants')

function makeMockResponse() {
  const store = new Map<string, { value: string; options: Record<string, unknown> }>()
  return {
    cookies: {
      set: vi.fn((name: string, value: string, options: Record<string, unknown>) => {
        store.set(name, { value, options })
      }),
      get: (name: string) => store.get(name),
    },
    _store: store,
  }
}

function makeMockRequest(cookies: Record<string, string> = {}) {
  return {
    cookies: {
      get: (name: string) => (cookies[name] !== undefined ? { value: cookies[name] } : undefined),
    },
  }
}

const sampleTokens: TokenResponse = {
  token_type: 'Bearer',
  expires_in: 3600,
  access_token: 'eyJhbGciOiJSUzI1NiJ9.payload.signature',
  refresh_token: 'abcdef1234567890abcdef1234567890abcdef12',
}

describe('setAuthCookies', () => {
  it('sets access_token cookie with expires_in maxAge', () => {
    const response = makeMockResponse()
    setAuthCookies(response as never, sampleTokens)

    expect(response.cookies.set).toHaveBeenCalledWith(
      COOKIE_ACCESS_TOKEN,
      sampleTokens.access_token,
      expect.objectContaining({
        httpOnly: true,
        sameSite: 'lax',
        maxAge: sampleTokens.expires_in,
        path: '/',
      }),
    )
  })

  it('sets refresh_token cookie with 30-day maxAge', () => {
    const response = makeMockResponse()
    setAuthCookies(response as never, sampleTokens)

    expect(response.cookies.set).toHaveBeenCalledWith(
      COOKIE_REFRESH_TOKEN,
      sampleTokens.refresh_token,
      expect.objectContaining({
        httpOnly: true,
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 30,
        path: '/',
      }),
    )
  })

  it('sets secure: false in non-production', () => {
    const response = makeMockResponse()
    setAuthCookies(response as never, sampleTokens)

    expect(response.cookies.set).toHaveBeenCalledWith(
      COOKIE_ACCESS_TOKEN,
      expect.any(String),
      expect.objectContaining({ secure: false }),
    )
  })
})

describe('clearAuthCookies', () => {
  it('clears access_token and refresh_token with maxAge: 0', () => {
    const response = makeMockResponse()
    clearAuthCookies(response as never)

    expect(response.cookies.set).toHaveBeenCalledWith(
      COOKIE_ACCESS_TOKEN,
      '',
      expect.objectContaining({ maxAge: 0 }),
    )
    expect(response.cookies.set).toHaveBeenCalledWith(
      COOKIE_REFRESH_TOKEN,
      '',
      expect.objectContaining({ maxAge: 0 }),
    )
  })
})

describe('getAccessToken', () => {
  it('returns access token value when present', () => {
    const request = makeMockRequest({ [COOKIE_ACCESS_TOKEN]: 'my-token' })
    expect(getAccessToken(request as never)).toBe('my-token')
  })

  it('returns undefined when cookie is absent', () => {
    const request = makeMockRequest()
    expect(getAccessToken(request as never)).toBeUndefined()
  })
})

describe('getRefreshToken', () => {
  it('returns refresh token value when present', () => {
    const request = makeMockRequest({ [COOKIE_REFRESH_TOKEN]: 'my-refresh' })
    expect(getRefreshToken(request as never)).toBe('my-refresh')
  })

  it('returns undefined when cookie is absent', () => {
    const request = makeMockRequest()
    expect(getRefreshToken(request as never)).toBeUndefined()
  })
})

describe('hasValidAccessToken', () => {
  it('returns true when access_token cookie is present and non-empty', () => {
    const request = makeMockRequest({ [COOKIE_ACCESS_TOKEN]: 'some-jwt' })
    expect(hasValidAccessToken(request as never)).toBe(true)
  })

  it('returns false when access_token cookie is absent', () => {
    const request = makeMockRequest()
    expect(hasValidAccessToken(request as never)).toBe(false)
  })

  it('returns false when access_token cookie is empty string', () => {
    const request = makeMockRequest({ [COOKIE_ACCESS_TOKEN]: '' })
    expect(hasValidAccessToken(request as never)).toBe(false)
  })
})

// Reset module between test runs if needed
beforeEach(() => {
  vi.clearAllMocks()
})
