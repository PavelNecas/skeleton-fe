import { describe, it, expect } from 'vitest'

import { buildMetadata } from '../SEOHead'

describe('buildMetadata', () => {
  it('returns title and description', () => {
    const meta = buildMetadata({ title: 'Test Page', description: 'A test page' })

    expect(meta.title).toBe('Test Page')
    expect(meta.description).toBe('A test page')
  })

  it('returns alternates.languages for hreflang entries', () => {
    const meta = buildMetadata({
      title: 'Page',
      hreflangLinks: [
        { locale: 'en', href: 'https://example.com/en/page' },
        { locale: 'cs', href: 'https://example.com/cs/page' },
      ],
    })

    expect(meta.alternates?.languages).toEqual({
      en: 'https://example.com/en/page',
      cs: 'https://example.com/cs/page',
    })
  })

  it('returns empty alternates when no hreflang entries', () => {
    const meta = buildMetadata({ title: 'Page', hreflangLinks: [] })

    expect(meta.alternates?.languages).toBeUndefined()
  })

  it('returns undefined description when not provided', () => {
    const meta = buildMetadata({ title: 'Page' })

    expect(meta.description).toBeUndefined()
  })
})
