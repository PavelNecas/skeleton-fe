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
  controllerTemplate: 'CmsModule:ContentPage',
  uid: 'abc',
  path: '/about-us',
  site: SITE_PREFIX,
  published: true,
  redirect: '',
  redirectCode: '',
  aliases: [],
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
      controllerTemplate: 'CmsModule:ContentPage',
      path: '/about-us',
    })
  })

  it('returns RedirectResolution (301) when path matches an alias', async () => {
    // First call (direct path) returns null
    mockEsSearchOne.mockResolvedValueOnce(null)
    // Second call (alias lookup) returns a route with canonical path
    mockEsSearchOne.mockResolvedValueOnce(
      makeRoute({ path: '/about-us', aliases: [{ path: '/about' }] }),
    )

    const result = await resolveRoute(SITE_PREFIX, '/about', LOCALE)

    expect(result).toEqual({
      kind: 'redirect',
      statusCode: 301,
      destination: '/about-us',
    })
  })

  it('returns NotFoundResolution when path and alias both miss', async () => {
    mockEsSearchOne.mockResolvedValueOnce(null)
    mockEsSearchOne.mockResolvedValueOnce(null)

    const result = await resolveRoute(SITE_PREFIX, '/nonexistent', LOCALE)

    expect(result).toEqual({ kind: 'not-found' })
  })

  it('queries the correct index', async () => {
    mockEsSearchOne.mockResolvedValueOnce(makeRoute())

    await resolveRoute('my_prefix', '/page', LOCALE)

    const [index] = mockEsSearchOne.mock.calls[0] as [string, object]
    expect(index).toBe('my_prefix_routes')
  })

  it('returns RouteResolution for homepage /', async () => {
    mockEsSearchOne.mockResolvedValueOnce(makeRoute({ path: '/' }))

    const result = await resolveRoute(SITE_PREFIX, '/', LOCALE)
    expect(result.kind).toBe('route')
  })
})
