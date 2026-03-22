import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { resolveSite, clearSiteCache } from '../site-resolver'

vi.mock('../elastic-edge', () => ({
  esSearchOne: vi.fn(),
}))

import { esSearchOne } from '../elastic-edge'

const mockEsSearchOne = vi.mocked(esSearchOne)

beforeEach(() => {
  clearSiteCache()
  vi.stubEnv('SITE_PREFIX', 'skeleton_localhost')
  vi.stubEnv('DEFAULT_LOCALE', 'cs')
  vi.stubEnv('AVAILABLE_LOCALES', 'cs,en')
})

afterEach(() => {
  vi.unstubAllEnvs()
  vi.clearAllMocks()
})

describe('resolveSite', () => {
  it('returns site config from ES with env locale fallbacks', async () => {
    mockEsSearchOne.mockResolvedValueOnce({ id: 1, mainDomain: 'skeleton-fe.localhost' })

    const config = await resolveSite('skeleton-fe.localhost')

    expect(config).toEqual({
      id: 1,
      prefix: 'skeleton_localhost',
      mainDomain: 'skeleton-fe.localhost',
      defaultLocale: 'cs',
      availableLocales: ['cs', 'en'],
    })
  })

  it('uses env defaults when ES returns null', async () => {
    mockEsSearchOne.mockResolvedValueOnce(null)

    const config = await resolveSite('skeleton-fe.localhost')

    expect(config.id).toBe(0)
    expect(config.prefix).toBe('skeleton_localhost')
    expect(config.defaultLocale).toBe('cs')
    expect(config.availableLocales).toEqual(['cs', 'en'])
  })

  it('falls back to env defaults when ES throws', async () => {
    mockEsSearchOne.mockRejectedValueOnce(new Error('ES unavailable'))

    const config = await resolveSite('skeleton-fe.localhost')

    expect(config.prefix).toBe('skeleton_localhost')
    expect(config.defaultLocale).toBe('cs')
  })

  it('caches the result and does not call ES again', async () => {
    mockEsSearchOne.mockResolvedValue({ id: 2, mainDomain: 'skeleton-fe.localhost' })

    await resolveSite('skeleton-fe.localhost')
    await resolveSite('skeleton-fe.localhost')

    expect(mockEsSearchOne).toHaveBeenCalledOnce()
  })

  it('derives prefix from hostname when SITE_PREFIX env is not set', async () => {
    vi.unstubAllEnvs()
    vi.stubEnv('DEFAULT_LOCALE', 'cs')
    vi.stubEnv('AVAILABLE_LOCALES', 'cs')
    mockEsSearchOne.mockResolvedValueOnce(null)

    const config = await resolveSite('my-site.example.com')
    expect(config.prefix).toBe('my_site_example_com')
  })
})
