import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

import { esSearchOne } from '../elastic-edge'
import { resolveRoute } from '../route-resolver'

vi.mock('../elastic-edge', () => ({
  esSearchOne: vi.fn(),
}))

const mockEsSearchOne = vi.mocked(esSearchOne)

const SITE_PREFIX = 'skeleton_localhost'
const LOCALE = 'cs'

beforeEach(() => {
  vi.clearAllMocks()
})

afterEach(() => {
  vi.clearAllMocks()
})

const makeRoute = (overrides?: Partial<Record<string, unknown>>) => ({
  sourceId: 42,
  sourceType: 'document',
  objectType: 'page',
  controllerTemplate: 'Cms:Page:default',
  uid: 'abc',
  path: 'about-us',
  site: SITE_PREFIX,
  locale: LOCALE,
  published: true,
  redirect: '',
  redirectCode: '',
  aliases: [],
  translationLinks: [],
  ...overrides,
})

describe('resolveRoute', () => {
  it('returns RouteResolution when direct path is found', async () => {
    mockEsSearchOne.mockResolvedValueOnce(makeRoute())

    const result = await resolveRoute(SITE_PREFIX, '/about-us', LOCALE)

    expect(result).toEqual({
      kind: 'route',
      sourceId: 42,
      sourceType: 'document',
      controllerTemplate: 'Cms:Page:default',
      path: 'about-us',
      translationLinks: [],
    })
  })

  it('returns RedirectResolution (301) when path matches an alias', async () => {
    // First call (direct path) returns null
    mockEsSearchOne.mockResolvedValueOnce(null)
    // Second call (alias lookup) returns a route with canonical path
    mockEsSearchOne.mockResolvedValueOnce(
      makeRoute({ path: 'about-us', aliases: [{ path: 'about' }] }),
    )

    const result = await resolveRoute(SITE_PREFIX, '/about', LOCALE)

    expect(result).toEqual({
      kind: 'redirect',
      statusCode: 301,
      destination: 'about-us',
    })
  })

  it('returns NotFoundResolution when path and alias both miss', async () => {
    mockEsSearchOne.mockResolvedValueOnce(null)
    mockEsSearchOne.mockResolvedValueOnce(null)

    const result = await resolveRoute(SITE_PREFIX, '/nonexistent', LOCALE)

    expect(result).toEqual({ kind: 'not-found' })
  })

  it('queries the correct index with locale filter', async () => {
    mockEsSearchOne.mockResolvedValueOnce(makeRoute())

    await resolveRoute('my_prefix', '/page', LOCALE)

    const [index, query] = mockEsSearchOne.mock.calls[0] as [string, Record<string, unknown>]
    expect(index).toBe('my_prefix_routes')
    // Verify locale filter is included in the query
    const must = (query as { query: { bool: { must: Array<Record<string, unknown>> } } }).query.bool.must
    expect(must).toContainEqual({ term: { locale: LOCALE } })
  })

  it('returns RouteResolution for homepage /', async () => {
    mockEsSearchOne.mockResolvedValueOnce(makeRoute({ path: '/' }))

    const result = await resolveRoute(SITE_PREFIX, '/', LOCALE)
    expect(result.kind).toBe('route')
  })

  it('finds EN homepage via fallback when path "/" returns null for non-default locale', async () => {
    // First call: direct path "/" lookup returns null (EN homepage has path "en" not "/")
    mockEsSearchOne.mockResolvedValueOnce(null)
    // Second call: fallback lookup with locale as path returns the EN homepage
    mockEsSearchOne.mockResolvedValueOnce(makeRoute({ path: 'en', locale: 'en' }))

    const result = await resolveRoute(SITE_PREFIX, '/', 'en')

    expect(result).toEqual({
      kind: 'route',
      sourceId: 42,
      sourceType: 'document',
      controllerTemplate: 'Cms:Page:default',
      path: 'en',
      translationLinks: [],
    })
  })

  it('includes translationLinks from ES route in RouteResolution', async () => {
    const translationLinks = [{ locale: 'en', sourceId: 78, path: 'about-us' }]
    mockEsSearchOne.mockResolvedValueOnce(makeRoute({ translationLinks }))

    const result = await resolveRoute(SITE_PREFIX, '/about-us', LOCALE)

    expect(result.kind).toBe('route')
    if (result.kind === 'route') {
      expect(result.translationLinks).toEqual(translationLinks)
    }
  })

  it('defaults translationLinks to empty array when not present in ES route', async () => {
    const routeWithoutLinks = makeRoute()
    // Remove translationLinks to simulate older ES document
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { translationLinks: _tl, ...routeNoLinks } = routeWithoutLinks
    mockEsSearchOne.mockResolvedValueOnce(routeNoLinks)

    const result = await resolveRoute(SITE_PREFIX, '/about-us', LOCALE)

    expect(result.kind).toBe('route')
    if (result.kind === 'route') {
      expect(result.translationLinks).toEqual([])
    }
  })
})
