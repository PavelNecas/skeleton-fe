import { describe, it, expect, vi, beforeEach } from 'vitest'
import { AuthClient } from '@skeleton-fe/sdk-pimcore'

vi.mock('@skeleton-fe/sdk-pimcore', () => {
  const mockClientCredentials = vi.fn()
  const mockSetAccessToken = vi.fn()
  const mockAuthClient = vi.fn(() => ({ clientCredentials: mockClientCredentials }))
  const mockPimcoreClient = vi.fn(() => ({ setAccessToken: mockSetAccessToken }))
  return {
    AuthClient: mockAuthClient,
    PimcoreClient: mockPimcoreClient,
  }
})

const makeTokenResponse = (expiresIn = 3600) => ({
  token_type: 'Bearer' as const,
  expires_in: expiresIn,
  access_token: `access-${Math.random()}`,
  refresh_token: 'refresh-token',
})

describe('getM2MToken', () => {
  beforeEach(async () => {
    vi.clearAllMocks()
    vi.stubEnv('PIMCORE_CLIENT_ID', 'test-client-id')
    vi.stubEnv('PIMCORE_CLIENT_SECRET', 'test-client-secret')
    vi.stubEnv('PIMCORE_API_URL', 'http://pimcore-test')

    // Reset the module to clear the module-level cachedToken between tests
    vi.resetModules()
  })

  it('fetches a new token when cache is empty', async () => {
    const { getM2MToken } = await import('../m2m')
    const mockTokens = makeTokenResponse()
    const mockInstance = { clientCredentials: vi.fn().mockResolvedValue(mockTokens) }
    vi.mocked(AuthClient).mockImplementationOnce(() => mockInstance as never)

    const token = await getM2MToken()
    expect(token).toBe(mockTokens.access_token)
    expect(mockInstance.clientCredentials).toHaveBeenCalledOnce()
  })

  it('returns cached token on subsequent calls within expiry', async () => {
    const { getM2MToken } = await import('../m2m')
    const mockTokens = makeTokenResponse(3600)
    const mockInstance = { clientCredentials: vi.fn().mockResolvedValue(mockTokens) }
    vi.mocked(AuthClient).mockImplementation(() => mockInstance as never)

    await getM2MToken()
    await getM2MToken()

    // Should only have fetched once
    expect(mockInstance.clientCredentials).toHaveBeenCalledOnce()
  })

  it('throws when env vars are missing', async () => {
    vi.stubEnv('PIMCORE_CLIENT_ID', '')
    vi.stubEnv('PIMCORE_CLIENT_SECRET', '')
    const { getM2MToken } = await import('../m2m')

    await expect(getM2MToken()).rejects.toThrow(
      'PIMCORE_CLIENT_ID and PIMCORE_CLIENT_SECRET must be set',
    )
  })
})

describe('createAuthenticatedPimcoreClient', () => {
  beforeEach(async () => {
    vi.clearAllMocks()
    vi.stubEnv('PIMCORE_CLIENT_ID', 'test-client-id')
    vi.stubEnv('PIMCORE_CLIENT_SECRET', 'test-client-secret')
    vi.stubEnv('PIMCORE_API_URL', 'http://pimcore-test')
    vi.resetModules()
  })

  it('returns a PimcoreClient with access token set', async () => {
    const { createAuthenticatedPimcoreClient } = await import('../m2m')
    const mockTokens = makeTokenResponse()
    const mockAuthInstance = { clientCredentials: vi.fn().mockResolvedValue(mockTokens) }
    const mockSetAccessToken = vi.fn()
    const mockPimcoreInstance = { setAccessToken: mockSetAccessToken }

    vi.mocked(AuthClient).mockImplementationOnce(() => mockAuthInstance as never)

    const { PimcoreClient } = await import('@skeleton-fe/sdk-pimcore')
    vi.mocked(PimcoreClient)
      .mockImplementationOnce(() => ({}) as never) // first call: for auth
      .mockImplementationOnce(() => mockPimcoreInstance as never) // second call: for the returned client

    const client = await createAuthenticatedPimcoreClient()
    expect(mockSetAccessToken).toHaveBeenCalledWith(mockTokens.access_token, 0)
    expect(client).toBe(mockPimcoreInstance)
  })
})
