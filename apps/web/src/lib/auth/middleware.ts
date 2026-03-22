import type { NextRequest, NextResponse } from 'next/server'
import { NextResponse as NextResponseClass } from 'next/server'

import { AuthClient } from '@skeleton-fe/sdk-pimcore'
import { PimcoreClient } from '@skeleton-fe/sdk-pimcore'

import { LOGIN_PATH, PROTECTED_ROUTES } from './constants'
import { getRefreshToken, hasValidAccessToken, setAuthCookies } from './session'

export function isProtectedRoute(pathname: string): boolean {
  return PROTECTED_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  )
}

export async function handleAuthMiddleware(
  request: NextRequest,
): Promise<NextResponse | null> {
  const { pathname } = request.nextUrl

  if (!isProtectedRoute(pathname)) {
    return null
  }

  // Access token is present — allow through
  if (hasValidAccessToken(request)) {
    return null
  }

  const refreshToken = getRefreshToken(request)

  // No tokens at all — redirect to login
  if (!refreshToken) {
    const loginUrl = request.nextUrl.clone()
    loginUrl.pathname = LOGIN_PATH
    loginUrl.searchParams.set('returnUrl', pathname)
    return NextResponseClass.redirect(loginUrl)
  }

  // Attempt silent refresh
  try {
    const pimcoreClient = new PimcoreClient({
      baseUrl: process.env.PIMCORE_API_URL ?? 'http://pimcore',
    })
    const authClient = new AuthClient(pimcoreClient)
    const tokens = await authClient.refreshToken(refreshToken)

    // Let the request continue — caller must merge cookies
    const response = NextResponseClass.next()
    setAuthCookies(response, tokens)
    return response
  } catch {
    // Refresh failed — redirect to login
    const loginUrl = request.nextUrl.clone()
    loginUrl.pathname = LOGIN_PATH
    loginUrl.searchParams.set('returnUrl', pathname)
    return NextResponseClass.redirect(loginUrl)
  }
}
