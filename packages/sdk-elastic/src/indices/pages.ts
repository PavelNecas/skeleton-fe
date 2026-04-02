import type { ElasticClient } from '../client'
import type { Editable, PageTechnicalData, NavigationData, Property } from '../types'

export interface Page {
  id: string
  title: string
  description: string
  path: string
  key: string
  locale: string
  published: boolean
  modificationDate: number
  site: string
  parentId: number
  index: number
  prettyUrl: string | null
  creationDate: number
  technicalData: PageTechnicalData
  navigationData: NavigationData
  editables: Editable[]
  properties: Property[]
}

export class PagesIndex {
  constructor(private readonly client: ElasticClient) {}

  private indexName(sitePrefix: string, locale: string): string {
    return `${sitePrefix}_pages_${locale}`
  }

  async findById(sitePrefix: string, locale: string, id: string): Promise<Page | null> {
    return this.client.searchOne<Page>(this.indexName(sitePrefix, locale), {
      query: {
        term: { id },
      },
    })
  }

  async findByPath(sitePrefix: string, locale: string, path: string): Promise<Page | null> {
    return this.client.searchOne<Page>(this.indexName(sitePrefix, locale), {
      query: {
        bool: {
          must: [{ term: { path } }, { term: { published: true } }],
        },
      },
    })
  }
}
