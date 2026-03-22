import type { Article, Page } from '@skeleton-fe/sdk-elastic'

/**
 * Headers set by middleware and read by the catch-all page component.
 */
export interface MiddlewareHeaders {
  sitePrefix: string
  locale: string
  route: string // JSON-serialised RouteInfo
  template: string
}

/**
 * Parsed route info stored as JSON in x-route header.
 */
export interface RouteInfo {
  sourceId: number
  sourceType: string
  controllerTemplate: string
}

/**
 * Props passed to every template component.
 */
export interface TemplateProps {
  data: Page | Article
  route: RouteInfo
  locale: string
  sitePrefix: string
}

/**
 * Parses the x-* middleware headers from a Headers object into a MiddlewareHeaders.
 * Returns null when any required header is missing.
 */
export function parseMiddlewareHeaders(headers: Headers): MiddlewareHeaders | null {
  const sitePrefix = headers.get('x-site-prefix')
  const locale = headers.get('x-locale')
  const route = headers.get('x-route')
  const template = headers.get('x-template')

  if (!sitePrefix || !locale || !route || !template) {
    return null
  }

  return { sitePrefix, locale, route, template }
}
