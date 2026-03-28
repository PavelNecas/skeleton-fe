import type { ElasticClient } from '../client'

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

export class NavigationsIndex {
  constructor(private readonly client: ElasticClient) {}

  private indexName(sitePrefix: string): string {
    return `${sitePrefix}_navigations`
  }

  async getByName(sitePrefix: string, menuDocumentName: string): Promise<Navigation | null> {
    return this.client.searchOne<Navigation>(this.indexName(sitePrefix), {
      query: {
        term: { menuDocumentName },
      },
    })
  }
}
