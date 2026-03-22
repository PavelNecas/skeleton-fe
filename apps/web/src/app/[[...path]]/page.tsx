import { headers } from 'next/headers'
import { notFound } from 'next/navigation'
import { parseMiddlewareHeaders } from '@/lib/types'
import type { RouteInfo } from '@/lib/types'
import { resolveComponent } from '@/lib/component-resolver'
import { getElasticClient } from '@/lib/elastic-client'

/**
 * Catch-all Server Component.
 *
 * Reads the x-* headers set by middleware, fetches page/article data from
 * Elasticsearch via the SDK, resolves the correct template component
 * (with site-override support), and renders it.
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

  // Fetch page data from the appropriate ES index
  const es = getElasticClient()
  const sourceId = String(routeInfo.sourceId)

  const data =
    routeInfo.sourceType === 'document'
      ? await es.pages.findById(sitePrefix, locale, sourceId)
      : await es.articles.findById(sitePrefix, locale, sourceId)

  if (!data) {
    notFound()
  }

  // Resolve template component (site override → core fallback)
  const Template = await resolveComponent(template, sitePrefix)

  if (!Template) {
    notFound()
  }

  return <Template data={data} route={routeInfo} locale={locale} sitePrefix={sitePrefix} />
}
