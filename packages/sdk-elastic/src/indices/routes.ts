import type { ElasticClient } from '../client'

export interface RouteAlias {
  path: string
}

export interface TranslationLink {
  locale: string
  sourceId: number
  path: string
}

export interface Route {
  sourceId: number
  sourceType: string
  objectType: string
  controllerTemplate: string
  uid: string
  path: string
  site: string
  locale: string
  published: boolean
  redirect: string
  redirectCode: string
  aliases: RouteAlias[]
  translationLinks: TranslationLink[]
  modificationDate: number
  creationDate: number
}

export class RoutesIndex {
  constructor(private readonly client: ElasticClient) {}

  private indexName(sitePrefix: string): string {
    return `${sitePrefix}_routes`
  }

  async findByPath(sitePrefix: string, path: string, locale: string): Promise<Route | null> {
    return this.client.searchOne<Route>(this.indexName(sitePrefix), {
      query: {
        bool: {
          must: [{ term: { path } }, { term: { locale } }, { term: { published: true } }],
        },
      },
    })
  }

  async findByAlias(sitePrefix: string, path: string, locale: string): Promise<Route | null> {
    return this.client.searchOne<Route>(this.indexName(sitePrefix), {
      query: {
        bool: {
          must: [
            { term: { locale } },
            {
              nested: {
                path: 'aliases',
                query: {
                  term: { 'aliases.path': path },
                },
              },
            },
          ],
        },
      },
    })
  }

  async findTranslations(sitePrefix: string, sourceId: number): Promise<Route[]> {
    return this.client.search<Route>(this.indexName(sitePrefix), {
      query: {
        term: { sourceId },
      },
    })
  }
}
