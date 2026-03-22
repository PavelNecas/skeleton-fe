import { describe, it, expect } from 'vitest'

import { buildLocalizedUrl, buildTranslationUrls, buildHreflangLinks, buildNavigationUrl } from '../url'

const DEFAULT_LOCALE = 'cs'

describe('buildLocalizedUrl', () => {
  it('returns path as-is for default locale', () => {
    expect(buildLocalizedUrl('/clanky', 'cs', DEFAULT_LOCALE)).toBe('/clanky')
  })

  it('prepends locale prefix for non-default locale', () => {
    expect(buildLocalizedUrl('/articles', 'en', DEFAULT_LOCALE)).toBe('/en/articles')
  })

  it('handles root path for default locale', () => {
    expect(buildLocalizedUrl('/', 'cs', DEFAULT_LOCALE)).toBe('/')
  })

  it('handles root path for non-default locale', () => {
    expect(buildLocalizedUrl('/', 'en', DEFAULT_LOCALE)).toBe('/en/')
  })
})

describe('buildTranslationUrls', () => {
  it('returns empty array when no translation links', () => {
    const result = buildTranslationUrls('/clanky', 'cs', DEFAULT_LOCALE, [])
    expect(result).toEqual([])
  })

  it('excludes the current locale from results', () => {
    const translationLinks = [
      { locale: 'cs', sourceId: 1, path: '/clanky' },
      { locale: 'en', sourceId: 2, path: '/articles' },
    ]
    const result = buildTranslationUrls('/clanky', 'cs', DEFAULT_LOCALE, translationLinks)
    expect(result).toHaveLength(1)
    expect(result[0]).toEqual({ locale: 'en', href: '/en/articles' })
  })

  it('uses correct href for default locale translation link', () => {
    const translationLinks = [{ locale: 'cs', sourceId: 1, path: '/clanky' }]
    const result = buildTranslationUrls('/articles', 'en', DEFAULT_LOCALE, translationLinks)
    expect(result).toHaveLength(1)
    expect(result[0]).toEqual({ locale: 'cs', href: '/clanky' })
  })

  it('handles multiple translation locales', () => {
    const translationLinks = [
      { locale: 'en', sourceId: 10, path: '/articles' },
      { locale: 'de', sourceId: 11, path: '/artikel' },
    ]
    const result = buildTranslationUrls('/clanky', 'cs', DEFAULT_LOCALE, translationLinks)
    expect(result).toHaveLength(2)
    expect(result.find((l) => l.locale === 'en')).toEqual({ locale: 'en', href: '/en/articles' })
    expect(result.find((l) => l.locale === 'de')).toEqual({ locale: 'de', href: '/de/artikel' })
  })
})

describe('buildHreflangLinks', () => {
  it('includes current page and x-default', () => {
    const result = buildHreflangLinks('/clanky', 'cs', DEFAULT_LOCALE, [])
    expect(result).toContainEqual({ locale: 'cs', href: '/clanky' })
    expect(result).toContainEqual({ locale: 'x-default', href: '/clanky' })
  })

  it('x-default points to default locale URL', () => {
    const translationLinks = [{ locale: 'cs', sourceId: 1, path: '/clanky' }]
    const result = buildHreflangLinks('/articles', 'en', DEFAULT_LOCALE, translationLinks)
    const xDefault = result.find((l) => l.locale === 'x-default')
    expect(xDefault).toEqual({ locale: 'x-default', href: '/clanky' })
  })

  it('includes all translation locales', () => {
    const translationLinks = [
      { locale: 'en', sourceId: 10, path: '/articles' },
      { locale: 'de', sourceId: 11, path: '/artikel' },
    ]
    const result = buildHreflangLinks('/clanky', 'cs', DEFAULT_LOCALE, translationLinks)
    const locales = result.map((l) => l.locale)
    expect(locales).toContain('cs')
    expect(locales).toContain('en')
    expect(locales).toContain('de')
    expect(locales).toContain('x-default')
  })
})

describe('buildNavigationUrl', () => {
  it('returns href as-is for default locale', () => {
    expect(buildNavigationUrl('/about', 'cs', DEFAULT_LOCALE)).toBe('/about')
  })

  it('prepends locale prefix for non-default locale', () => {
    expect(buildNavigationUrl('/about', 'en', DEFAULT_LOCALE)).toBe('/en/about')
  })
})
