import type { TranslationLink } from '@/core/components/layout'

import type { RouteTranslationLink } from './types'

/**
 * Builds a locale-aware URL.
 *
 * - Default locale: no path prefix → `/path`
 * - Secondary locale: /{locale}{path} → `/en/path`
 */
export function buildLocalizedUrl(path: string, locale: string, defaultLocale: string): string {
  // Ensure path has leading slash (ES stores flat paths like "clanky")
  const normalized = path === '/' || path.startsWith('/') ? path : `/${path}`

  if (locale === defaultLocale) {
    return normalized
  }
  return `/${locale}${normalized}`
}

/**
 * Builds an array of TranslationLink objects for the LanguageSwitcher and hreflang tags.
 *
 * Combines the current page (currentPath + currentLocale) with the translationLinks
 * from the route to produce the full list of localized URLs, excluding the current locale.
 */
export function buildTranslationUrls(
  currentPath: string,
  currentLocale: string,
  defaultLocale: string,
  translationLinks: RouteTranslationLink[],
): TranslationLink[] {
  const links: TranslationLink[] = []

  // Add links for other locales from translation data
  for (const link of translationLinks) {
    if (link.locale !== currentLocale) {
      links.push({
        locale: link.locale,
        href: buildLocalizedUrl(link.path, link.locale, defaultLocale),
      })
    }
  }

  return links
}

/**
 * Builds a complete hreflang array including the current page and x-default.
 *
 * The x-default entry always points to the default locale URL.
 */
export function buildHreflangLinks(
  currentPath: string,
  currentLocale: string,
  defaultLocale: string,
  translationLinks: RouteTranslationLink[],
): Array<{ locale: string; href: string }> {
  const all: Array<{ locale: string; href: string }> = []

  // Current page
  all.push({
    locale: currentLocale,
    href: buildLocalizedUrl(currentPath, currentLocale, defaultLocale),
  })

  // Other locales
  for (const link of translationLinks) {
    if (link.locale !== currentLocale) {
      all.push({
        locale: link.locale,
        href: buildLocalizedUrl(link.path, link.locale, defaultLocale),
      })
    }
  }

  // x-default → default locale URL
  const defaultEntry = all.find((e) => e.locale === defaultLocale)
  if (defaultEntry) {
    all.push({ locale: 'x-default', href: defaultEntry.href })
  }

  return all
}

/**
 * Builds a navigation URL that is locale-aware.
 * Used in the Navigation component to prefix hrefs for non-default locales.
 */
export function buildNavigationUrl(href: string, locale: string, defaultLocale: string): string {
  return buildLocalizedUrl(href, locale, defaultLocale)
}
