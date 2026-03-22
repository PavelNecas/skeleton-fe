import type { ReadonlyRequestCookies } from 'next/dist/server/web/spec-extension/adapters/request-cookies'

import { COOKIE_ACCESS_TOKEN } from './constants'

interface JwtPayload {
  sub?: string
  email?: string
  exp?: number
  iat?: number
  [key: string]: unknown
}

/**
 * Decodes the payload of a JWT without verifying the signature.
 * Never use the result for security decisions — verification happens server-side.
 */
export function parseJwtPayload(token: string): JwtPayload {
  const parts = token.split('.')

  if (parts.length !== 3) {
    throw new Error('Invalid JWT: expected 3 parts')
  }

  // parts.length === 3 is asserted above, so parts[1] is always defined
  const payload = parts[1] as string

  // Base64url → base64
  const base64 = payload.replace(/-/g, '+').replace(/_/g, '/')
  const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=')

  const decoded = atob(padded)
  return JSON.parse(decoded) as JwtPayload
}

/**
 * Returns true if the access_token cookie is present in the given cookie store.
 * For use in Server Components.
 */
export function isAuthenticated(cookieStore: ReadonlyRequestCookies): boolean {
  const token = cookieStore.get(COOKIE_ACCESS_TOKEN)?.value
  return token !== undefined && token.length > 0
}
