import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { Article, Hardlink, Page, TextProperty } from '@skeleton-fe/sdk-elastic'
import type * as ReactTypes from 'react'

// Mock React.cache to be a pass-through so we can call fetchPageData normally in tests
vi.mock('react', async (importOriginal) => {
  const actual = await importOriginal<typeof ReactTypes>()
  return { ...actual, cache: (fn: unknown) => fn }
})

// Mock the elastic client module
vi.mock('@/lib/elastic-client', () => ({
  getElasticClient: vi.fn(),
}))

import { getElasticClient } from '@/lib/elastic-client'

import { fetchPageData } from '../data-fetching'
import type { RouteInfo } from '../types'

const mockFindPageById = vi.fn()
const mockFindArticleById = vi.fn()
const mockFindHardlinkById = vi.fn()

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(getElasticClient).mockReturnValue({
    pages: { findById: mockFindPageById },
    articles: { findById: mockFindArticleById },
    hardlinks: { findById: mockFindHardlinkById },
  } as unknown as ReturnType<typeof getElasticClient>)
})

const SITE_PREFIX = 'skeleton_localhost'
const LOCALE = 'cs'

const makeRouteInfo = (objectType: string, sourceId = 42): RouteInfo => ({
  sourceId,
  sourceType: 'document',
  objectType,
  controllerTemplate: 'CmsModule:ContentPage',
  translationLinks: [],
})

const makeNavigationData = () => ({
  name: null,
  title: null,
  cssClass: null,
  target: null,
  anchor: null,
  parameters: null,
  exclude: false,
  relation: null,
  accesskey: null,
  tabindex: null,
})

const makePageTechnicalData = () => ({
  controller: null,
  template: null,
  contentMainDocumentId: null,
  staticGeneratorEnabled: false,
  staticGeneratorLifetime: null,
})

const makePage = (overrides?: Partial<Page>): Page => ({
  id: '42',
  title: 'Source Page',
  description: 'Source description',
  path: '/source',
  key: 'source',
  locale: LOCALE,
  published: true,
  modificationDate: 1700000000,
  site: SITE_PREFIX,
  parentId: 1,
  index: 0,
  prettyUrl: '/source',
  creationDate: 1700000000,
  technicalData: makePageTechnicalData(),
  navigationData: makeNavigationData(),
  editables: [],
  properties: [],
  ...overrides,
})

const makeHardlink = (overrides?: Partial<Hardlink>): Hardlink => ({
  id: '99',
  path: '/hardlink',
  key: 'hardlink',
  locale: LOCALE,
  published: true,
  modificationDate: 1700000001,
  site: SITE_PREFIX,
  parentId: 2,
  index: 1,
  creationDate: 1700000001,
  sourceData: {
    sourceId: 42,
    sourceType: 'document',
    sourcePath: '/source',
    propertiesFromSource: false,
    childrenFromSource: false,
  },
  navigationData: { ...makeNavigationData(), name: 'Hardlink nav' },
  editables: null,
  properties: null,
  ...overrides,
})

describe('fetchPageData', () => {
  describe('objectType: Page', () => {
    it('dispatches to pages.findById', async () => {
      const page = makePage()
      mockFindPageById.mockResolvedValue(page)

      const result = await fetchPageData(SITE_PREFIX, LOCALE, makeRouteInfo('Page'))

      expect(mockFindPageById).toHaveBeenCalledWith(SITE_PREFIX, LOCALE, '42')
      expect(mockFindArticleById).not.toHaveBeenCalled()
      expect(mockFindHardlinkById).not.toHaveBeenCalled()
      expect(result).toBe(page)
    })

    it('returns null when page not found', async () => {
      mockFindPageById.mockResolvedValue(null)

      const result = await fetchPageData(SITE_PREFIX, LOCALE, makeRouteInfo('Page'))

      expect(result).toBeNull()
    })
  })

  describe('objectType: Article', () => {
    it('dispatches to articles.findById', async () => {
      const article: Article = {
        id: '42',
        name: 'Test Article',
        metaDescription: null,
        description: 'desc',
        perex: null,
        summary: null,
        locale: LOCALE,
        published: true,
        path: '/articles/test',
        slug: 'test',
        frontendTemplate: null,
        modificationDate: 1700000000,
        creationDate: 1700000000,
        properties: [],
        contentBlocks: [],
      }
      mockFindArticleById.mockResolvedValue(article)

      const result = await fetchPageData(SITE_PREFIX, LOCALE, makeRouteInfo('Article'))

      expect(mockFindArticleById).toHaveBeenCalledWith(SITE_PREFIX, LOCALE, '42')
      expect(mockFindPageById).not.toHaveBeenCalled()
      expect(mockFindHardlinkById).not.toHaveBeenCalled()
      expect(result).toBe(article)
    })
  })

  describe('objectType: unknown', () => {
    it('returns null for unknown objectType', async () => {
      const result = await fetchPageData(SITE_PREFIX, LOCALE, makeRouteInfo('UnknownType'))

      expect(mockFindPageById).not.toHaveBeenCalled()
      expect(mockFindArticleById).not.toHaveBeenCalled()
      expect(mockFindHardlinkById).not.toHaveBeenCalled()
      expect(result).toBeNull()
    })
  })

  describe('objectType: Hardlink', () => {
    it('fetches hardlink then source page and returns composite Page', async () => {
      const hardlink = makeHardlink()
      const sourcePage = makePage()
      mockFindHardlinkById.mockResolvedValue(hardlink)
      mockFindPageById.mockResolvedValue(sourcePage)

      const result = await fetchPageData(SITE_PREFIX, LOCALE, makeRouteInfo('Hardlink', 99))

      expect(mockFindHardlinkById).toHaveBeenCalledWith(SITE_PREFIX, LOCALE, '99')
      expect(mockFindPageById).toHaveBeenCalledWith(SITE_PREFIX, LOCALE, '42')

      expect(result).not.toBeNull()
      const page = result as Page
      // Identity from hardlink
      expect(page.id).toBe('99')
      expect(page.path).toBe('/hardlink')
      expect(page.navigationData).toEqual(hardlink.navigationData)
      // Content from source page
      expect(page.title).toBe(sourcePage.title)
      expect(page.editables).toBe(sourcePage.editables)
      expect(page.technicalData).toBe(sourcePage.technicalData)
    })

    it('returns null when hardlink is not found', async () => {
      mockFindHardlinkById.mockResolvedValue(null)

      const result = await fetchPageData(SITE_PREFIX, LOCALE, makeRouteInfo('Hardlink', 99))

      expect(result).toBeNull()
      expect(mockFindPageById).not.toHaveBeenCalled()
    })

    it('returns null when hardlink has no sourceId', async () => {
      const hardlink = makeHardlink({
        sourceData: {
          sourceId: null,
          sourceType: null,
          sourcePath: null,
          propertiesFromSource: false,
          childrenFromSource: false,
        },
      })
      mockFindHardlinkById.mockResolvedValue(hardlink)

      const result = await fetchPageData(SITE_PREFIX, LOCALE, makeRouteInfo('Hardlink', 99))

      expect(result).toBeNull()
      expect(mockFindPageById).not.toHaveBeenCalled()
    })

    it('returns null when source page is not found', async () => {
      const hardlink = makeHardlink()
      mockFindHardlinkById.mockResolvedValue(hardlink)
      mockFindPageById.mockResolvedValue(null)

      const result = await fetchPageData(SITE_PREFIX, LOCALE, makeRouteInfo('Hardlink', 99))

      expect(result).toBeNull()
    })

    it('returns null when source page is unpublished', async () => {
      const hardlink = makeHardlink()
      const sourcePage = makePage({ published: false })
      mockFindHardlinkById.mockResolvedValue(hardlink)
      mockFindPageById.mockResolvedValue(sourcePage)

      const result = await fetchPageData(SITE_PREFIX, LOCALE, makeRouteInfo('Hardlink', 99))

      expect(result).toBeNull()
    })

    it('returns null when hardlink is unpublished', async () => {
      const hardlink = makeHardlink({ published: false })
      mockFindHardlinkById.mockResolvedValue(hardlink)

      const result = await fetchPageData(SITE_PREFIX, LOCALE, makeRouteInfo('Hardlink', 99))

      expect(result).toBeNull()
      expect(mockFindPageById).not.toHaveBeenCalled()
    })

    it('uses only hardlink properties when propertiesFromSource is false', async () => {
      const hardlinkProps: TextProperty[] = [{ type: 'text', name: 'color', value: 'red' }]
      const sourceProps: TextProperty[] = [{ type: 'text', name: 'font', value: 'Arial' }]

      const hardlink = makeHardlink({
        properties: hardlinkProps,
        sourceData: {
          sourceId: 42,
          sourceType: 'document',
          sourcePath: '/source',
          propertiesFromSource: false,
          childrenFromSource: false,
        },
      })
      const sourcePage = makePage({ properties: sourceProps })
      mockFindHardlinkById.mockResolvedValue(hardlink)
      mockFindPageById.mockResolvedValue(sourcePage)

      const result = await fetchPageData(SITE_PREFIX, LOCALE, makeRouteInfo('Hardlink', 99))

      const page = result as Page
      // Only hardlink properties — source properties not included
      expect(page.properties).toEqual(hardlinkProps)
    })

    it('merges source and hardlink properties when propertiesFromSource is true, hardlink overrides', async () => {
      const hardlinkProps: TextProperty[] = [{ type: 'text', name: 'color', value: 'red' }]
      const sourceProps: TextProperty[] = [
        { type: 'text', name: 'font', value: 'Arial' },
        // Same name as hardlink prop — should be overridden by hardlink
        { type: 'text', name: 'color', value: 'blue' },
      ]

      const hardlink = makeHardlink({
        properties: hardlinkProps,
        sourceData: {
          sourceId: 42,
          sourceType: 'document',
          sourcePath: '/source',
          propertiesFromSource: true,
          childrenFromSource: false,
        },
      })
      const sourcePage = makePage({ properties: sourceProps })
      mockFindHardlinkById.mockResolvedValue(hardlink)
      mockFindPageById.mockResolvedValue(sourcePage)

      const result = await fetchPageData(SITE_PREFIX, LOCALE, makeRouteInfo('Hardlink', 99))

      const page = result as Page
      // 'font' from source (not overridden) + 'color' from hardlink (overrides source)
      expect(page.properties).toHaveLength(2)
      expect(page.properties).toContainEqual({ type: 'text', name: 'font', value: 'Arial' })
      expect(page.properties).toContainEqual({ type: 'text', name: 'color', value: 'red' })
      // Specifically, the hardlink value wins for 'color'
      const colorProp = page.properties.find((p) => p.name === 'color') as TextProperty
      expect(colorProp.value).toBe('red')
    })

    it('handles null hardlink properties when propertiesFromSource is true', async () => {
      const sourceProps: TextProperty[] = [{ type: 'text', name: 'font', value: 'Arial' }]

      const hardlink = makeHardlink({
        properties: null,
        sourceData: {
          sourceId: 42,
          sourceType: 'document',
          sourcePath: '/source',
          propertiesFromSource: true,
          childrenFromSource: false,
        },
      })
      const sourcePage = makePage({ properties: sourceProps })
      mockFindHardlinkById.mockResolvedValue(hardlink)
      mockFindPageById.mockResolvedValue(sourcePage)

      const result = await fetchPageData(SITE_PREFIX, LOCALE, makeRouteInfo('Hardlink', 99))

      const page = result as Page
      // All source properties included, no hardlink props to override
      expect(page.properties).toEqual(sourceProps)
    })
  })
})
