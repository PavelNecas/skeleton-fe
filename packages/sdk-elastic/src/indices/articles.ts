import type { ElasticClient } from '../client'
import type { ContentBlock, PimcoreImage, Property } from '../types'

interface CategoryBucket {
  key: string
  doc_count: number
  category_name: {
    buckets: Array<{ key: string; doc_count: number }>
  }
}

export interface ArticleCategory {
  id: string
  name: string
}

export interface ArticleImages {
  articleCard: PimcoreImage | null
  openGraph: PimcoreImage | null
  socialSquare: PimcoreImage | null
}

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
  publishedDate: number
  properties: Property[]
  contentBlocks: ContentBlock[]
  categories: ArticleCategory[]
  authors: string[]
  images: ArticleImages
}

export interface ArticleListingParams {
  page?: number
  perPage?: number
  categoryId?: string
  sort?: 'newest' | 'oldest'
}

export interface ArticleListingResult {
  items: Article[]
  total: number
  page: number
  perPage: number
  totalPages: number
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

  async findAll(
    sitePrefix: string,
    locale: string,
    params?: ArticleListingParams,
  ): Promise<ArticleListingResult> {
    const page = params?.page ?? 1
    const perPage = params?.perPage ?? 10
    const sortDirection = params?.sort === 'oldest' ? 'asc' : 'desc'

    const filter: object[] = [{ term: { published: true } }]
    if (params?.categoryId) {
      filter.push({ term: { 'categories.id.keyword': params.categoryId } })
    }

    const { items, total } = await this.client.searchWithTotal<Article>(
      this.indexName(sitePrefix, locale),
      {
        query: {
          bool: { filter },
        },
        sort: [{ publishedDate: sortDirection }],
        from: (page - 1) * perPage,
        size: perPage,
      },
    )

    return {
      items,
      total,
      page,
      perPage,
      totalPages: Math.ceil(total / perPage),
    }
  }

  async getCategories(sitePrefix: string, locale: string): Promise<ArticleCategory[]> {
    const aggs = await this.client.aggregate(this.indexName(sitePrefix, locale), {
      query: { bool: { filter: [{ term: { published: true } }] } },
      aggs: {
        category_ids: {
          terms: { field: 'categories.id.keyword', size: 1000 },
          aggs: {
            category_name: {
              terms: { field: 'categories.name.keyword', size: 1 },
            },
          },
        },
      },
    })

    const buckets = (aggs.category_ids as { buckets: CategoryBucket[] })?.buckets ?? []

    return buckets.map((bucket) => ({
      id: bucket.key,
      name: bucket.category_name.buckets[0]?.key ?? '',
    }))
  }
}
