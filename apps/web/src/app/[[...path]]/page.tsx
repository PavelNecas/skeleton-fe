import { headers } from 'next/headers'
import { notFound } from 'next/navigation'

import { MainLayout } from '@/core/layouts/MainLayout'
import { resolveComponent } from '@/lib/component-resolver'
import { getElasticClient } from '@/lib/elastic-client'
import { fetchMainNavigation } from '@/lib/navigation'
import { parseMiddlewareHeaders } from '@/lib/types'
import type { RouteInfo } from '@/lib/types'

/**
 * Derives a human-readable site name from the site prefix.
 * e.g. "my_site" → "My site"
 */
function deriveSiteName(sitePrefix: string): string {
  return sitePrefix
    .split('_')
    .map((part, index) => (index === 0 ? part.charAt(0).toUpperCase() + part.slice(1) : part))
    .join(' ')
}

/**
 * Catch-all Server Component.
 *
 * Reads the x-* headers set by middleware, fetches page/article data from
 * Elasticsearch via the SDK, resolves the correct template component
 * (with site-override support), and renders it wrapped in MainLayout.
 */
export default async function CatchAllPage() {
  const headersList = await headers()
  const parsed = parseMiddlewareHeaders(headersList)

  // Middleware sets x-not-found when the route was not found
  if (!parsed || headersList.get('x-not-found') === '1') {
    notFound()
  }

  const { sitePrefix, locale, route: routeJson, template } = parsed

  let routeInfo: RouteInfo
  try {
    routeInfo = JSON.parse(routeJson) as RouteInfo
  } catch {
    notFound()
  }

  // Fetch page data and navigation in parallel
  const es = getElasticClient()
  const sourceId = String(routeInfo.sourceId)

  const [data, navigationNodes] = await Promise.all([
    routeInfo.sourceType === 'document'
      ? es.pages.findById(sitePrefix, locale, sourceId)
      : es.articles.findById(sitePrefix, locale, sourceId),
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

  const siteName = deriveSiteName(sitePrefix)

  return (
    <MainLayout
      navigationNodes={navigationNodes}
      siteName={siteName}
      currentLocale={locale}
      translationLinks={[]}
    >
      <Template data={data} route={routeInfo} locale={locale} sitePrefix={sitePrefix} />
    </MainLayout>
  )
}
