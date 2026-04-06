import { Client } from '@elastic/elasticsearch'

import { RoutesIndex } from './indices/routes'
import { PagesIndex } from './indices/pages'
import { ArticlesIndex } from './indices/articles'
import { NavigationsIndex } from './indices/navigations'
import { SitesIndex } from './indices/sites'
import { SnippetsIndex } from './indices/snippets'
import { LinksIndex } from './indices/links'
import { HardlinksIndex } from './indices/hardlinks'

export interface SearchWithTotalResult<T> {
  items: T[]
  total: number
}

export interface ElasticClientConfig {
  url: string
  username: string
  password: string
}

export class ElasticClient {
  private readonly esClient: Client

  private _routes?: RoutesIndex
  private _pages?: PagesIndex
  private _articles?: ArticlesIndex
  private _navigations?: NavigationsIndex
  private _sites?: SitesIndex
  private _snippets?: SnippetsIndex
  private _links?: LinksIndex
  private _hardlinks?: HardlinksIndex

  constructor(config: ElasticClientConfig) {
    this.esClient = new Client({
      node: config.url,
      auth: {
        username: config.username,
        password: config.password,
      },
    })
  }

  async search<T>(index: string, query: object): Promise<T[]> {
    const response = await this.esClient.search<T>({
      index,
      ...query,
    })

    return response.hits.hits.map((hit) => hit._source as T)
  }

  async searchOne<T>(index: string, query: object): Promise<T | null> {
    const results = await this.search<T>(index, query)
    return results[0] ?? null
  }

  async searchWithTotal<T>(index: string, query: object): Promise<SearchWithTotalResult<T>> {
    const response = await this.esClient.search<T>({
      index,
      ...query,
    })

    const total =
      typeof response.hits.total === 'number'
        ? response.hits.total
        : (response.hits.total?.value ?? 0)

    return {
      items: response.hits.hits.map((hit) => hit._source as T),
      total,
    }
  }

  async aggregate(index: string, query: object): Promise<Record<string, unknown>> {
    const response = await this.esClient.search({
      index,
      size: 0,
      ...query,
    })

    return (response.aggregations ?? {}) as Record<string, unknown>
  }

  get routes(): RoutesIndex {
    this._routes ??= new RoutesIndex(this)
    return this._routes
  }

  get pages(): PagesIndex {
    this._pages ??= new PagesIndex(this)
    return this._pages
  }

  get articles(): ArticlesIndex {
    this._articles ??= new ArticlesIndex(this)
    return this._articles
  }

  get navigations(): NavigationsIndex {
    this._navigations ??= new NavigationsIndex(this)
    return this._navigations
  }

  get sites(): SitesIndex {
    this._sites ??= new SitesIndex(this)
    return this._sites
  }

  get snippets(): SnippetsIndex {
    this._snippets ??= new SnippetsIndex(this)
    return this._snippets
  }

  get links(): LinksIndex {
    this._links ??= new LinksIndex(this)
    return this._links
  }

  get hardlinks(): HardlinksIndex {
    this._hardlinks ??= new HardlinksIndex(this)
    return this._hardlinks
  }
}
