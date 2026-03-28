import { cache } from 'react'
import type { Article, Page } from '@skeleton-fe/sdk-elastic'

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

    if (routeInfo.sourceType === 'document') {
      return es.pages.findById(sitePrefix, locale, sourceId)
    }

    return es.articles.findById(sitePrefix, locale, sourceId)
  },
)
