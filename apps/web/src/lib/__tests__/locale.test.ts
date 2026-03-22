import { describe, it, expect } from 'vitest'
import { detectLocale } from '../locale'

const AVAILABLE_LOCALES = ['cs', 'en']
const DEFAULT_LOCALE = 'cs'

function detect(pathname: string) {
  return detectLocale(pathname, AVAILABLE_LOCALES, DEFAULT_LOCALE)
}

describe('detectLocale', () => {
  it('/en/about-us (secondary locale) → locale: en, resolvedPath: /about-us', () => {
    expect(detect('/en/about-us')).toEqual({ locale: 'en', resolvedPath: '/about-us' })
  })

  it('/about-us (no prefix) → uses default locale, path unchanged', () => {
    expect(detect('/about-us')).toEqual({ locale: 'cs', resolvedPath: '/about-us' })
  })

  it('/ (root, no prefix) → default locale, path /', () => {
    expect(detect('/')).toEqual({ locale: 'cs', resolvedPath: '/' })
  })

  it('/en (secondary locale, root) → locale: en, resolvedPath: /', () => {
    expect(detect('/en')).toEqual({ locale: 'en', resolvedPath: '/' })
  })

  it('/cs/clanky (default locale prefix) → treats cs as non-secondary, keeps path as-is', () => {
    // "cs" is the default locale — not a secondary locale, so path stays
    expect(detect('/cs/clanky')).toEqual({ locale: 'cs', resolvedPath: '/cs/clanky' })
  })

  it('/en/a/b/c (deeply nested) → strips en prefix', () => {
    expect(detect('/en/a/b/c')).toEqual({ locale: 'en', resolvedPath: '/a/b/c' })
  })

  it('unknown locale segment → falls back to default locale', () => {
    expect(detect('/fr/page')).toEqual({ locale: 'cs', resolvedPath: '/fr/page' })
  })

  it('pathname without leading slash is normalised', () => {
    expect(detect('en/about-us')).toEqual({ locale: 'en', resolvedPath: '/about-us' })
  })
})
