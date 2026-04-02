import { cache } from 'react'
import type { Article, Page, Property } from '@skeleton-fe/sdk-elastic'

import { getElasticClient } from './elastic-client'
import type { RouteInfo } from './types'

/**
 * Fetches page or article data from Elasticsearch based on route info.
 * Wrapped with React.cache so the result is deduplicated within a single
 * render pass — used by both generateMetadata and the page component.
 */
export const fetchPageData = cache(
  async (
    sitePrefix: string,
    locale: string,
    routeInfo: RouteInfo,
  ): Promise<Page | Article | null> => {
    const es = getElasticClient()
    const sourceId = String(routeInfo.sourceId)

    switch (routeInfo.objectType) {
      case 'Page':
        return es.pages.findById(sitePrefix, locale, sourceId)
      case 'Article':
        return es.articles.findById(sitePrefix, locale, sourceId)
      case 'Hardlink':
        return resolveHardlink(es, sitePrefix, locale, sourceId)
      default:
        return null
    }
  },
)

async function resolveHardlink(
  es: ReturnType<typeof getElasticClient>,
  sitePrefix: string,
  locale: string,
  hardlinkId: string,
): Promise<Page | null> {
  const hardlink = await es.hardlinks.findById(sitePrefix, locale, hardlinkId)
  if (!hardlink || !hardlink.published || hardlink.sourceData.sourceId === null) {
    return null
  }

  const sourcePage = await es.pages.findById(
    sitePrefix,
    locale,
    String(hardlink.sourceData.sourceId),
  )
  if (!sourcePage || !sourcePage.published) {
    return null
  }

  // Merge properties: if propertiesFromSource, merge source + hardlink (hardlink overrides)
  let properties: Property[] = hardlink.properties ?? []
  if (hardlink.sourceData.propertiesFromSource && sourcePage.properties) {
    const hardlinkPropNames = new Set((hardlink.properties ?? []).map((p) => p.name))
    const sourceProps = sourcePage.properties.filter((p) => !hardlinkPropNames.has(p.name))
    properties = [...sourceProps, ...properties]
  }

  // Build composite Page: source page fields + hardlink identity fields
  return {
    id: hardlink.id,
    path: hardlink.path,
    key: hardlink.key,
    locale: hardlink.locale,
    published: hardlink.published,
    modificationDate: hardlink.modificationDate,
    site: hardlink.site,
    parentId: hardlink.parentId,
    index: hardlink.index,
    creationDate: hardlink.creationDate,
    navigationData: hardlink.navigationData,
    // From source page
    title: sourcePage.title,
    description: sourcePage.description,
    prettyUrl: null,
    technicalData: sourcePage.technicalData,
    editables: sourcePage.editables,
    properties,
  }
}
