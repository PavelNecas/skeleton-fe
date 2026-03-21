# Authentication

## Overview

Two auth mechanisms:
- **Customer login** (password grant) — for end users, via `POST /api/auth/login`
- **M2M client credentials** — for server-side data fetching, via `POST /token`

## Customer Login Flow

```
1. User submits email + password on login page
2. Next.js API route → sdk-pimcore: POST /api/auth/login
3. Backend validates credentials, returns TokenResponse
4. Frontend stores tokens in httpOnly cookies
5. Redirect to originally requested page
```

### TokenResponse

```typescript
interface TokenResponse {
  token_type: 'Bearer'
  expires_in: number        // 3600 (1 hour)
  access_token: string      // JWT signed with RSA
  refresh_token: string     // 40-char hex identifier, TTL 30 days
}
```

### Backend Login Flow (for reference)

1. Loads customer from Pimcore DataObject by email
2. Verifies password via Symfony UserPasswordHasherInterface
3. Checks account is active (`CustomerAuth.active`)
4. Verifies OAuth2 client `frontend-app` exists
5. Generates access token (JWT, 1h) + refresh token (30d)
6. Writes `lastLogin` timestamp
7. Returns TokenResponse

## Session Management

### Cookie Storage

| Cookie | Content | TTL | Flags |
|--------|---------|-----|-------|
| `access_token` | JWT | 1h | httpOnly, Secure (prod), SameSite=Lax |
| `refresh_token` | hex string | 30d | httpOnly, Secure (prod), SameSite=Lax |

### Token Refresh

- Middleware checks `access_token` cookie on each request
- If expired → call refresh endpoint with `refresh_token`
- If refresh succeeds → set new cookies, continue
- If refresh fails → redirect to login

## Key Files

| File | Purpose |
|------|---------|
| `src/lib/auth/session.ts` | Cookie read/write, token storage |
| `src/lib/auth/middleware.ts` | Auth check helpers for middleware |
| `src/app/api/auth/[...nextauth]/route.ts` | Auth API routes (login proxy, refresh) |

## M2M Client Credentials

Server-side only. Used when Next.js server needs to call authenticated Pimcore API endpoints.

```typescript
// Server-side only — never exposed to client
const token = await pimcoreClient.auth.clientCredentials(
  process.env.PIMCORE_CLIENT_ID,
  process.env.PIMCORE_CLIENT_SECRET
)
```

Token cached server-side, refreshed on expiry.

## Protected Pages

Middleware checks auth state for protected routes. If not authenticated → redirect to login with return URL.

```typescript
// In middleware.ts
if (isProtectedRoute(path) && !hasValidToken(request)) {
  return NextResponse.redirect(`/login?returnUrl=${encodeURIComponent(path)}`)
}
```
