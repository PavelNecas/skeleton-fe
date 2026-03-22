import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextResponse } from 'next/server'
import { AuthClient } from '@skeleton-fe/sdk-pimcore'

import { hasValidAccessToken, getRefreshToken, setAuthCookies } from '../session'
import { isProtectedRoute, handleAuthMiddleware } from '../middleware'

vi.mock('@skeleton-fe/sdk-pimcore', () => {
  const mockRefreshToken = vi.fn()
  const mockAuthClient = vi.fn(() => ({ refreshToken: mockRefreshToken }))
  const mockPimcoreClient = vi.fn(() => ({}))
  return {
    AuthClient: mockAuthClient,
    PimcoreClient: mockPimcoreClient,
  }
})

vi.mock('next/server', () => {
  const redirect = vi.fn((url: URL) => ({
    type: 'redirect',
    url: url.toString(),
    cookies: { set: vi.fn() },
  }))
  const next = vi.fn(() => ({ type: 'next', cookies: { set: vi.fn() } }))
  return {
    NextResponse: { redirect, next },
  }
})

vi.mock('../session', () => ({
  hasValidAccessToken: vi.fn(),
  getRefreshToken: vi.fn(),
  setAuthCookies: vi.fn(),
}))

const mockHasValidAccessToken = vi.mocked(hasValidAccessToken)
const mockGetRefreshToken = vi.mocked(getRefreshToken)
const mockSetAuthCookies = vi.mocked(setAuthCookies)

function makeMockRequest(pathname: string, searchParams?: Record<string, string>) {
  const url = new URL(`http://localhost${pathname}`)
  if (searchParams) {
    for (const [k, v] of Object.entries(searchParams)) {
      url.searchParams.set(k, v)
    }
  }
  return {
    nextUrl: {
      clone: () => new URL(url.toString()),
      pathname,
      searchParams: url.searchParams,
    },
    cookies: {
      get: vi.fn(),
    },
  }
}

describe('isProtectedRoute', () => {
  it('returns true for /account', () => {
    expect(isProtectedRoute('/account')).toBe(true)
  })

  it('returns true for /account/settings', () => {
    expect(isProtectedRoute('/account/settings')).toBe(true)
  })

  it('returns false for /', () => {
    expect(isProtectedRoute('/')).toBe(false)
  })

  it('returns false for /login', () => {
    expect(isProtectedRoute('/login')).toBe(false)
  })

  it('returns false for /products', () => {
    expect(isProtectedRoute('/products')).toBe(false)
  })
})

describe('handleAuthMiddleware', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns null for non-protected routes', async () => {
    const request = makeMockRequest('/products')
    const result = await handleAuthMiddleware(request as never)
    expect(result).toBeNull()
  })

  it('returns null when access token is valid', async () => {
    mockHasValidAccessToken.mockReturnValue(true)
    const request = makeMockRequest('/account')
    const result = await handleAuthMiddleware(request as never)
    expect(result).toBeNull()
  })

  it('redirects to login with returnUrl when no tokens present', async () => {
    mockHasValidAccessToken.mockReturnValue(false)
    mockGetRefreshToken.mockReturnValue(undefined)

    const request = makeMockRequest('/account')
    await handleAuthMiddleware(request as never)

    expect(NextResponse.redirect).toHaveBeenCalledWith(
      expect.objectContaining({ pathname: '/login', searchParams: expect.anything() }),
    )
  })

  it('sets new cookies and returns next() when refresh succeeds', async () => {
    mockHasValidAccessToken.mockReturnValue(false)
    mockGetRefreshToken.mockReturnValue('old-refresh-token')

    const mockTokens = {
      token_type: 'Bearer' as const,
      expires_in: 3600,
      access_token: 'new-access',
      refresh_token: 'new-refresh',
    }

    const mockAuthInstance = { refreshToken: vi.fn().mockResolvedValue(mockTokens) }
    vi.mocked(AuthClient).mockImplementationOnce(() => mockAuthInstance as never)

    const request = makeMockRequest('/account')
    const result = await handleAuthMiddleware(request as never)

    expect(NextResponse.next).toHaveBeenCalled()
    expect(mockSetAuthCookies).toHaveBeenCalledWith(expect.anything(), mockTokens)
    expect(result).toBeTruthy()
  })

  it('redirects to login when refresh fails', async () => {
    mockHasValidAccessToken.mockReturnValue(false)
    mockGetRefreshToken.mockReturnValue('expired-refresh-token')

    const mockAuthInstance = { refreshToken: vi.fn().mockRejectedValue(new Error('Expired')) }
    vi.mocked(AuthClient).mockImplementationOnce(() => mockAuthInstance as never)

    const request = makeMockRequest('/account')
    await handleAuthMiddleware(request as never)

    expect(NextResponse.redirect).toHaveBeenCalled()
  })
})
