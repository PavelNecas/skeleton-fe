import type { NavigationNode } from '@skeleton-fe/sdk-elastic'

import { getElasticClient } from './elastic-client'

export const DEFAULT_MENU_NAME = 'main-navigation'

/**
 * Fetches the main navigation tree for a given site prefix.
 * Returns the root node's children (top-level navigation items).
 */
export async function fetchMainNavigation(sitePrefix: string): Promise<NavigationNode[]> {
  const es = getElasticClient()
  const navigation = await es.navigations.getByName(sitePrefix, DEFAULT_MENU_NAME)
  return navigation?.root.children ?? []
}
