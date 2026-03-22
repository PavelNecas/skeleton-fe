import type { ElasticClient } from '../client'

export interface LocalizedErrorDocument {
  locale: string
  path: string
}

export interface Site {
  id: number
  domains: string
  rootId: number
  rootPath: string
  mainDomain: string
  errorDocument: string
  localizedErrorDocuments: LocalizedErrorDocument[]
  redirectToMainDomain: boolean
  modificationDate: number
  creationDate: number
}

export class SitesIndex {
  constructor(private readonly client: ElasticClient) {}

  private indexName(sitePrefix: string): string {
    return `${sitePrefix}_sites`
  }

  async findByDomain(sitePrefix: string, domain: string): Promise<Site | null> {
    return this.client.searchOne<Site>(this.indexName(sitePrefix), {
      query: {
        term: { mainDomain: domain },
      },
    })
  }

  async getAll(sitePrefix: string): Promise<Site[]> {
    return this.client.search<Site>(this.indexName(sitePrefix), {
      query: {
        match_all: {},
      },
    })
  }
}
