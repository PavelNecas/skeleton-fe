import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

import { esSearchOne } from '../elastic-edge'
import { resolveSite, clearSiteCache } from '../site-resolver'

vi.mock('../elastic-edge', () => ({
  esSearchOne: vi.fn(),
}))

const mockEsSearchOne = vi.mocked(esSearchOne)

const FULL_ES_SITE = {
  id: 1,
  mainDomain: 'skeleton-fe.localhost',
  defaultLocale: 'cs',
  availableLocales: ['cs', 'en'],
}

beforeEach(() => {
  clearSiteCache()
})

afterEach(() => {
  vi.clearAllMocks()
})

describe('resolveSite', () => {
  it('returns site config from ES including locales', async () => {
    mockEsSearchOne.mockResolvedValueOnce(FULL_ES_SITE)

    const config = await resolveSite('skeleton-fe.localhost')

    expect(mockEsSearchOne).toHaveBeenCalledWith('app_sites', {
      query: { term: { mainDomain: 'skeleton-fe.localhost' } },
    })
    expect(config).toEqual({
      id: 1,
      prefix: 'skeleton_fe_localhost',
      mainDomain: 'skeleton-fe.localhost',
      defaultLocale: 'cs',
      availableLocales: ['cs', 'en'],
    })
  })

  it('falls back to defaults when ES returns null', async () => {
    mockEsSearchOne.mockResolvedValueOnce(null)

    const config = await resolveSite('skeleton-fe.localhost')

    expect(config.id).toBe(0)
    expect(config.prefix).toBe('skeleton_fe_localhost')
    expect(config.defaultLocale).toBe('cs')
    expect(config.availableLocales).toEqual(['cs'])
  })

  it('falls back to defaults when ES throws', async () => {
    mockEsSearchOne.mockRejectedValueOnce(new Error('ES unavailable'))

    const config = await resolveSite('skeleton-fe.localhost')

    expect(config.prefix).toBe('skeleton_fe_localhost')
    expect(config.defaultLocale).toBe('cs')
    expect(config.availableLocales).toEqual(['cs'])
  })

  it('caches the result and does not call ES again', async () => {
    mockEsSearchOne.mockResolvedValue(FULL_ES_SITE)

    await resolveSite('skeleton-fe.localhost')
    await resolveSite('skeleton-fe.localhost')

    expect(mockEsSearchOne).toHaveBeenCalledOnce()
  })

  it('derives prefix from hostname', async () => {
    mockEsSearchOne.mockResolvedValueOnce(null)

    const config = await resolveSite('my-site.example.com')
    expect(config.prefix).toBe('my_site_example_com')
  })
})
