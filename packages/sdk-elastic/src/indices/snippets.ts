import type { ElasticClient } from '../client'
import type { Editable, TechnicalData, Property } from '../types'

export interface Snippet {
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
  technicalData: TechnicalData
  editables: Editable[]
  properties: Property[]
}

export class SnippetsIndex {
  constructor(private readonly client: ElasticClient) {}

  private indexName(sitePrefix: string, locale: string): string {
    return `${sitePrefix}_snippets_${locale}`
  }

  async findByKey(sitePrefix: string, locale: string, key: string): Promise<Snippet | null> {
    return this.client.searchOne<Snippet>(this.indexName(sitePrefix, locale), {
      query: {
        bool: {
          must: [{ term: { key } }, { term: { published: true } }],
        },
      },
    })
  }
}
