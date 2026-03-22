import type { NextRequest, NextResponse } from 'next/server'

import type { TokenResponse } from '@skeleton-fe/sdk-pimcore'

import { COOKIE_ACCESS_TOKEN, COOKIE_REFRESH_TOKEN, REFRESH_TOKEN_MAX_AGE } from './constants'

const isProduction = process.env.NODE_ENV === 'production'

export function setAuthCookies(response: NextResponse, tokens: TokenResponse): void {
  response.cookies.set(COOKIE_ACCESS_TOKEN, tokens.access_token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    maxAge: tokens.expires_in,
    path: '/',
  })

  response.cookies.set(COOKIE_REFRESH_TOKEN, tokens.refresh_token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    maxAge: REFRESH_TOKEN_MAX_AGE,
    path: '/',
  })
}

export function clearAuthCookies(response: NextResponse): void {
  response.cookies.set(COOKIE_ACCESS_TOKEN, '', {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  })

  response.cookies.set(COOKIE_REFRESH_TOKEN, '', {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  })
}

export function getAccessToken(request: NextRequest): string | undefined {
  return request.cookies.get(COOKIE_ACCESS_TOKEN)?.value
}

export function getRefreshToken(request: NextRequest): string | undefined {
  return request.cookies.get(COOKIE_REFRESH_TOKEN)?.value
}

export function hasValidAccessToken(request: NextRequest): boolean {
  const token = request.cookies.get(COOKIE_ACCESS_TOKEN)?.value
  return token !== undefined && token.length > 0
}
