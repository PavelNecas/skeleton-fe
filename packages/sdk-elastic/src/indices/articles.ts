import type { ElasticClient } from '../client'
import type { ContentBlock, Property } from '../types'

export interface Article {
  id: string
  name: string | null
  metaDescription: string | null
  description: string | null
  perex: string | null
  summary: string | null
  locale: string
  published: boolean
  path: string
  slug: string
  frontendTemplate: string | null
  modificationDate: number
  creationDate: number
  properties: Property[]
  contentBlocks: ContentBlock[]
}

export class ArticlesIndex {
  constructor(private readonly client: ElasticClient) {}

  private indexName(sitePrefix: string, locale: string): string {
    return `${sitePrefix}_articles_${locale}`
  }

  async findById(sitePrefix: string, locale: string, id: string): Promise<Article | null> {
    return this.client.searchOne<Article>(this.indexName(sitePrefix, locale), {
      query: {
        term: { id },
      },
    })
  }

  async findBySlug(sitePrefix: string, locale: string, slug: string): Promise<Article | null> {
    return this.client.searchOne<Article>(this.indexName(sitePrefix, locale), {
      query: {
        bool: {
          must: [{ term: { slug } }, { term: { published: true } }],
        },
      },
    })
  }
}
