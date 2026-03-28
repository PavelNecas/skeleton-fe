import type { Metadata } from 'next'
import { headers } from 'next/headers'
import { notFound } from 'next/navigation'

import { MainLayout } from '@/core/layouts/MainLayout'
import { buildMetadata } from '@/core/components/shared/SEOHead'
import { resolveComponent } from '@/lib/component-resolver'
import { fetchPageData } from '@/lib/data-fetching'
import { fetchMainNavigation } from '@/lib/navigation'
import { loadSiteConfig } from '@/lib/site-config'
import { parseMiddlewareHeaders } from '@/lib/types'
import type { RouteInfo } from '@/lib/types'
import { buildTranslationUrls, buildHreflangLinks } from '@/lib/url'

function parseRouteInfo(routeJson: string): RouteInfo | null {
  try {
    return JSON.parse(routeJson) as RouteInfo
  } catch {
    return null
  }
}

/**
 * Generates Next.js Metadata for the current page by reusing cached data
 * from fetchPageData — avoids duplicate Elasticsearch calls.
 */
export async function generateMetadata(): Promise<Metadata> {
  const headersList = await headers()
  const parsed = parseMiddlewareHeaders(headersList)

  if (!parsed) {
    return {}
  }

  const { sitePrefix, locale, defaultLocale, route: routeJson } = parsed
  const routeInfo = parseRouteInfo(routeJson)

  if (!routeInfo) {
    return {}
  }

  const data = await fetchPageData(sitePrefix, locale, routeInfo)

  if (!data) {
    return {}
  }

  // Build hreflang links from translation data
  const hreflangLinks = buildHreflangLinks(
    routeInfo.translationLinks?.find((l) => l.locale === locale)?.path ??
      headersList.get('x-pathname') ??
      '/',
    locale,
    defaultLocale,
    routeInfo.translationLinks ?? [],
  )

  // Page has title+description; Article has name+metaDescription
  if ('title' in data) {
    return buildMetadata({
      title: data.title,
      description: data.description || undefined,
      hreflangLinks,
    })
  }

  return buildMetadata({
    title: data.name ?? '',
    description: data.metaDescription ?? undefined,
    hreflangLinks,
  })
}

/**
 * Catch-all Server Component.
 *
 * Reads the x-* headers set by middleware, fetches page/article data from
 * Elasticsearch via the SDK (shared with generateMetadata via React.cache),
 * resolves the correct template component (with site-override support),
 * and renders it wrapped in MainLayout.
 */
export default async function CatchAllPage() {
  const headersList = await headers()
  const parsed = parseMiddlewareHeaders(headersList)

  // Middleware sets x-not-found when the route was not found
  if (!parsed || headersList.get('x-not-found') === '1') {
    notFound()
  }

  const { sitePrefix, locale, defaultLocale, route: routeJson, template } = parsed

  const routeInfo = parseRouteInfo(routeJson)
  if (!routeInfo) {
    notFound()
  }

  // Fetch page data (deduplicated with generateMetadata via React.cache) and navigation in parallel
  const [data, navigationNodes] = await Promise.all([
    fetchPageData(sitePrefix, locale, routeInfo),
    fetchMainNavigation(sitePrefix),
  ])

  if (!data) {
    notFound()
  }

  // Resolve template component (site override → core fallback)
  const Template = await resolveComponent(template, sitePrefix)

  if (!Template) {
    notFound()
  }

  // Load site config (name, theme, features) for this site
  const siteConfig = await loadSiteConfig(sitePrefix)

  // Build locale-aware translation links for LanguageSwitcher
  const translationLinks = buildTranslationUrls(
    routeInfo.translationLinks?.find((l) => l.locale === locale)?.path ?? '/',
    locale,
    defaultLocale,
    routeInfo.translationLinks ?? [],
  )

  return (
    <MainLayout
      navigationNodes={navigationNodes}
      siteName={siteConfig.name}
      currentLocale={locale}
      defaultLocale={defaultLocale}
      translationLinks={translationLinks}
      theme={siteConfig.theme}
    >
      <Template data={data} route={routeInfo} locale={locale} sitePrefix={sitePrefix} />
    </MainLayout>
  )
}
