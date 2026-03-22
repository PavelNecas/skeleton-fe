import { AuthClient, PimcoreClient } from '@skeleton-fe/sdk-pimcore'

interface CachedToken {
  accessToken: string
  expiresAt: number
}

/** Module-level singleton cache — server-side only, never exposed to the client */
let cachedToken: CachedToken | null = null

/** Buffer in milliseconds before expiry at which we proactively refresh */
const EXPIRY_BUFFER_MS = 60 * 1000

function isTokenFresh(token: CachedToken): boolean {
  return Date.now() < token.expiresAt - EXPIRY_BUFFER_MS
}

/**
 * Returns a valid M2M access token, fetching a new one if the cache is stale.
 * Server-side only — reads PIMCORE_CLIENT_ID and PIMCORE_CLIENT_SECRET from env.
 */
export async function getM2MToken(): Promise<string> {
  if (cachedToken !== null && isTokenFresh(cachedToken)) {
    return cachedToken.accessToken
  }

  const clientId = process.env.PIMCORE_CLIENT_ID ?? ''
  const clientSecret = process.env.PIMCORE_CLIENT_SECRET ?? ''

  if (!clientId || !clientSecret) {
    throw new Error('PIMCORE_CLIENT_ID and PIMCORE_CLIENT_SECRET must be set for M2M auth')
  }

  const pimcoreClient = new PimcoreClient({
    baseUrl: process.env.PIMCORE_API_URL ?? 'http://pimcore',
  })
  const authClient = new AuthClient(pimcoreClient)

  const tokens = await authClient.clientCredentials({ client_id: clientId, client_secret: clientSecret })

  cachedToken = {
    accessToken: tokens.access_token,
    expiresAt: Date.now() + tokens.expires_in * 1000,
  }

  return cachedToken.accessToken
}

/**
 * Creates a PimcoreClient pre-authenticated with the M2M access token.
 * Server-side only.
 */
export async function createAuthenticatedPimcoreClient(): Promise<PimcoreClient> {
  const token = await getM2MToken()
  const client = new PimcoreClient({
    baseUrl: process.env.PIMCORE_API_URL ?? 'http://pimcore',
  })
  client.setAccessToken(token, 0)
  return client
}
