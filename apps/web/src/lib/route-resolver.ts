import { esSearchOne } from './elastic-edge'

export interface EsTranslationLink {
  locale: string
  sourceId: number
  path: string
}

interface EsRoute {
  sourceId: number
  sourceType: string
  objectType: string
  controllerTemplate: string
  uid: string
  path: string
  site: string
  published: boolean
  redirect: string
  redirectCode: string
  aliases: Array<{ path: string }>
  translationLinks?: EsTranslationLink[]
}

export interface RouteResolution {
  kind: 'route'
  sourceId: number
  sourceType: string
  controllerTemplate: string
  path: string
  translationLinks: EsTranslationLink[]
}

export interface RedirectResolution {
  kind: 'redirect'
  statusCode: 301
  destination: string
}

export interface NotFoundResolution {
  kind: 'not-found'
}

export type RouteResult = RouteResolution | RedirectResolution | NotFoundResolution

/**
 * Resolves a route for the given sitePrefix + path + locale.
 *
 * Algorithm:
 * 1. Query ES {sitePrefix}_routes for a published route with path == resolvedPath
 * 2. If found → return RouteResolution
 * 3. If not found → check aliases; if alias matches → return 301 RedirectResolution to canonical path
 * 4. Otherwise → NotFoundResolution
 */
export async function resolveRoute(
  sitePrefix: string,
  path: string,
  _locale: string,
): Promise<RouteResult> {
  const index = `${sitePrefix}_routes`

  // 1. Direct path lookup
  const route = await esSearchOne<EsRoute>(index, {
    query: {
      bool: {
        must: [{ term: { path } }, { term: { published: true } }],
      },
    },
  })

  if (route) {
    return {
      kind: 'route',
      sourceId: route.sourceId,
      sourceType: route.sourceType,
      controllerTemplate: route.controllerTemplate,
      path: route.path,
      translationLinks: route.translationLinks ?? [],
    }
  }

  // 2. Alias lookup
  const aliasRoute = await esSearchOne<EsRoute>(index, {
    query: {
      nested: {
        path: 'aliases',
        query: {
          term: { 'aliases.path': path },
        },
      },
    },
  })

  if (aliasRoute) {
    return {
      kind: 'redirect',
      statusCode: 301,
      destination: aliasRoute.path,
    }
  }

  return { kind: 'not-found' }
}
