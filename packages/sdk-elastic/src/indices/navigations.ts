import type { ElasticClient } from '../client'
import type { NavigationData } from '../types'

interface EsNavigationNode {
  documentId: number
  path: string
  documentType: string | null
  navigationData: NavigationData
  children: EsNavigationNode[]
}

interface EsNavigation {
  id: string
  menuDocumentName: string
  modificationDate: number
  root: EsNavigationNode
}

export interface NavigationNode {
  id: string
  path: string
  label: string | null
  href: string | null
  documentType: string | null
  children: NavigationNode[]
}

export interface Navigation {
  id: string
  menuDocumentName: string
  modificationDate: number
  root: NavigationNode
}

function normalizePath(path: string): string {
  if (path === '/' || path.startsWith('http')) {
    return path
  }
  if (path.startsWith('www.')) {
    return `https://${path}`
  }
  return path.startsWith('/') ? path : `/${path}`
}

function mapNode(node: EsNavigationNode): NavigationNode {
  return {
    id: String(node.documentId),
    path: node.path,
    label: node.navigationData.name,
    href: normalizePath(node.path),
    documentType: node.documentType,
    children: node.children.map(mapNode),
  }
}

function mapNavigation(raw: EsNavigation): Navigation {
  return {
    id: raw.id,
    menuDocumentName: raw.menuDocumentName,
    modificationDate: raw.modificationDate,
    root: mapNode(raw.root),
  }
}

export class NavigationsIndex {
  constructor(private readonly client: ElasticClient) {}

  private indexName(sitePrefix: string, locale: string): string {
    return `${sitePrefix}_navigations_${locale}`
  }

  async getByName(
    sitePrefix: string,
    locale: string,
    menuDocumentName: string,
  ): Promise<Navigation | null> {
    const raw = await this.client.searchOne<EsNavigation>(this.indexName(sitePrefix, locale), {
      query: {
        term: { menuDocumentName },
      },
    })
    return raw ? mapNavigation(raw) : null
  }

  async getAll(sitePrefix: string, locale: string): Promise<Record<string, Navigation>> {
    const results = await this.client.search<EsNavigation>(this.indexName(sitePrefix, locale), {
      query: { match_all: {} },
      size: 100,
    })

    const map: Record<string, Navigation> = {}
    for (const raw of results) {
      map[raw.menuDocumentName] = mapNavigation(raw)
    }
    return map
  }
}
