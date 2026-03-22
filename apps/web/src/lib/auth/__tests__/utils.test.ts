import { describe, it, expect } from 'vitest'

import { parseJwtPayload, isAuthenticated } from '../utils'
import { COOKIE_ACCESS_TOKEN } from '../constants'

// Build a minimal JWT: base64url(header).base64url(payload).signature
function makeJwt(payload: Record<string, unknown>): string {
  const header = btoa(JSON.stringify({ alg: 'RS256', typ: 'JWT' }))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
  const body = btoa(JSON.stringify(payload))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
  return `${header}.${body}.fakesignature`
}

describe('parseJwtPayload', () => {
  it('decodes a valid JWT payload', () => {
    const payload = { sub: '42', email: 'user@example.com', exp: 9999999999 }
    const token = makeJwt(payload)
    const result = parseJwtPayload(token)
    expect(result.sub).toBe('42')
    expect(result.email).toBe('user@example.com')
    expect(result.exp).toBe(9999999999)
  })

  it('throws for a token without 3 parts', () => {
    expect(() => parseJwtPayload('not.valid')).toThrow('Invalid JWT: expected 3 parts')
  })

  it('throws for an empty string', () => {
    expect(() => parseJwtPayload('')).toThrow()
  })
})

describe('isAuthenticated', () => {
  function makeCookieStore(cookies: Record<string, string>) {
    return {
      get: (name: string) =>
        cookies[name] !== undefined ? { value: cookies[name] } : undefined,
    }
  }

  it('returns true when access_token cookie is present', () => {
    const store = makeCookieStore({ [COOKIE_ACCESS_TOKEN]: 'some-jwt' })
    expect(isAuthenticated(store as never)).toBe(true)
  })

  it('returns false when access_token cookie is absent', () => {
    const store = makeCookieStore({})
    expect(isAuthenticated(store as never)).toBe(false)
  })

  it('returns false when access_token cookie is empty string', () => {
    const store = makeCookieStore({ [COOKIE_ACCESS_TOKEN]: '' })
    expect(isAuthenticated(store as never)).toBe(false)
  })
})
