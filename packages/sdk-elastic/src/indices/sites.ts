import type { ElasticClient } from '../client'

export interface LocalizedErrorDocument {
  locale: string
  path: string
}

export interface Site {
  id: number
  domains: string[]
  rootId: number
  rootPath: string
  mainDomain: string
  errorDocument: string
  localizedErrorDocuments: LocalizedErrorDocument[]
  redirectToMainDomain: boolean
  defaultLocale: string
  availableLocales: string[]
  modificationDate: number
  creationDate: number
}

export class SitesIndex {
  constructor(private readonly client: ElasticClient) {}

  private readonly indexName = 'app_sites'

  async findByDomain(domain: string): Promise<Site | null> {
    return this.client.searchOne<Site>(this.indexName, {
      query: {
        term: { mainDomain: domain },
      },
    })
  }

  async getAll(): Promise<Site[]> {
    return this.client.search<Site>(this.indexName, {
      query: {
        match_all: {},
      },
    })
  }
}
