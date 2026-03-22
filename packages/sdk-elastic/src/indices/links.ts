import type { ElasticClient } from '../client'
import type { NavigationData } from '../types'

export interface LinkData {
  href: string | null
  linktype: string | null
  internalType: string | null
  internalId: number | null
  direct: string | null
}

export interface Link {
  id: string
  path: string
  key: string
  locale: string
  published: boolean
  modificationDate: number
  site: string
  parentId: number
  index: number
  creationDate: number
  linkData: LinkData
  navigationData: NavigationData
}

export class LinksIndex {
  constructor(private readonly client: ElasticClient) {}

  private indexName(sitePrefix: string, locale: string): string {
    return `${sitePrefix}_links_${locale}`
  }

  async findById(sitePrefix: string, locale: string, id: string): Promise<Link | null> {
    return this.client.searchOne<Link>(this.indexName(sitePrefix, locale), {
      query: {
        term: { id },
      },
    })
  }

  async findByPath(sitePrefix: string, locale: string, path: string): Promise<Link | null> {
    return this.client.searchOne<Link>(this.indexName(sitePrefix, locale), {
      query: {
        bool: {
          must: [{ term: { path } }, { term: { published: true } }],
        },
      },
    })
  }
}
