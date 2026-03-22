import { describe, it, expect, vi } from 'vitest'

import { loadSiteConfig } from '../site-config'

describe('loadSiteConfig', () => {
  it('returns default config when no site config file exists', async () => {
    const result = await loadSiteConfig('unknown_site')
    expect(result).toEqual({ name: 'Unknown site' })
  })

  it('returns mocked config when site config file exists', async () => {
    vi.mock('@/sites/_example/config', () => ({
      siteConfig: {
        name: 'Example Site',
        theme: 'example',
        features: { showPrices: true },
      },
    }))

    const result = await loadSiteConfig('_example')
    expect(result.name).toBe('Example Site')
    expect(result.theme).toBe('example')
    expect(result.features?.showPrices).toBe(true)
  })

  it('derives site name from prefix when no config', async () => {
    const result = await loadSiteConfig('my_shop')
    expect(result.name).toBe('My shop')
  })

  it('returns config without theme when not specified in default fallback', async () => {
    const result = await loadSiteConfig('bare_site')
    expect(result.theme).toBeUndefined()
  })
})
