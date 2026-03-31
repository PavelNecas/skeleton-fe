import { unstable_cache } from 'next/cache'
import type { Navigation, NavigationNode } from '@skeleton-fe/sdk-elastic'

import { getElasticClient } from './elastic-client'

export const MAIN_NAVIGATION = 'MAIN'
export const FOOTER_NAVIGATION = 'FOOTER'

/**
 * Fetches all navigations for a given site prefix and locale.
 * Results are cached across requests (revalidated every 60s).
 * Returns a record keyed by menuDocumentName.
 */
export const fetchAllNavigations = unstable_cache(
  async (sitePrefix: string, locale: string): Promise<Record<string, Navigation>> => {
    try {
      const es = getElasticClient()
      return await es.navigations.getAll(sitePrefix, locale)
    } catch (error) {
      console.warn(`Failed to fetch navigations for ${sitePrefix}/${locale}:`, error)
      return {}
    }
  },
  ['navigations'],
  { revalidate: 60, tags: ['navigations'] },
)

/**
 * Extracts navigation nodes (root children) for a given navigation name.
 * Returns an empty array if the navigation doesn't exist.
 */
export function getNavigationNodes(
  navigations: Record<string, Navigation>,
  name: string,
): NavigationNode[] {
  return navigations[name]?.root.children ?? []
}
