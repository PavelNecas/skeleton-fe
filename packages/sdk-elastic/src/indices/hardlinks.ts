import type { ElasticClient } from '../client'
import type { Editable, NavigationData, Property } from '../types'

export interface SourceData {
  sourceId: number | null
  sourceType: string | null
  sourcePath: string | null
  propertiesFromSource: boolean
  childrenFromSource: boolean
}

export interface Hardlink {
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
  sourceData: SourceData
  navigationData: NavigationData
  editables: Editable[] | null
  properties: Property[] | null
}

export class HardlinksIndex {
  constructor(private readonly client: ElasticClient) {}

  private indexName(sitePrefix: string, locale: string): string {
    return `${sitePrefix}_hardlinks_${locale}`
  }

  async findById(sitePrefix: string, locale: string, id: string): Promise<Hardlink | null> {
    return this.client.searchOne<Hardlink>(this.indexName(sitePrefix, locale), {
      query: {
        term: { id },
      },
    })
  }

  async findByPath(sitePrefix: string, locale: string, path: string): Promise<Hardlink | null> {
    return this.client.searchOne<Hardlink>(this.indexName(sitePrefix, locale), {
      query: {
        bool: {
          must: [{ term: { path } }, { term: { published: true } }],
        },
      },
    })
  }
}
