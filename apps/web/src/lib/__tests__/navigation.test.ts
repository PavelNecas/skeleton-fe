import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { Navigation, NavigationNode } from '@skeleton-fe/sdk-elastic'

// Mock next/cache — pass through without actual caching
vi.mock('next/cache', () => ({
  unstable_cache: (fn: Function) => fn,
}))

// Mock the elastic client module
vi.mock('@/lib/elastic-client', () => ({
  getElasticClient: vi.fn(),
}))

import { getElasticClient } from '@/lib/elastic-client'

import {
  fetchAllNavigations,
  getNavigationNodes,
  MAIN_NAVIGATION,
  FOOTER_NAVIGATION,
} from '../navigation'

const mockGetAll = vi.fn()

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(getElasticClient).mockReturnValue({
    navigations: { getAll: mockGetAll },
  } as unknown as ReturnType<typeof getElasticClient>)
})

const childNodes: NavigationNode[] = [
  { id: '1', path: '/en', label: 'Home', href: '/', documentType: 'page', children: [] },
  {
    id: '2',
    path: '/en/about',
    label: 'About',
    href: '/about',
    documentType: 'page',
    children: [],
  },
]

const mockMainNavigation: Navigation = {
  id: 'nav-1',
  menuDocumentName: MAIN_NAVIGATION,
  modificationDate: 1700000000,
  root: {
    id: 'root',
    path: '/',
    label: null,
    href: null,
    documentType: null,
    children: childNodes,
  },
}

const mockFooterNavigation: Navigation = {
  id: 'nav-2',
  menuDocumentName: FOOTER_NAVIGATION,
  modificationDate: 1700000000,
  root: {
    id: 'root-footer',
    path: '/',
    label: null,
    href: null,
    documentType: null,
    children: [
      { id: '3', path: '/contact', label: 'Contact', href: '/contact', documentType: 'page', children: [] },
    ],
  },
}

describe('constants', () => {
  it('exports MAIN_NAVIGATION', () => {
    expect(MAIN_NAVIGATION).toBe('MAIN')
  })

  it('exports FOOTER_NAVIGATION', () => {
    expect(FOOTER_NAVIGATION).toBe('FOOTER')
  })
})

describe('fetchAllNavigations', () => {
  it('calls getAll with site prefix and locale', async () => {
    const navigations = {
      [MAIN_NAVIGATION]: mockMainNavigation,
      [FOOTER_NAVIGATION]: mockFooterNavigation,
    }
    mockGetAll.mockResolvedValue(navigations)

    const result = await fetchAllNavigations('mysite', 'cs')

    expect(mockGetAll).toHaveBeenCalledWith('mysite', 'cs')
    expect(result).toEqual(navigations)
  })

  it('returns empty record on error', async () => {
    mockGetAll.mockRejectedValue(new Error('ES down'))

    const result = await fetchAllNavigations('mysite', 'cs')

    expect(result).toEqual({})
  })
})

describe('getNavigationNodes', () => {
  const navigations = {
    [MAIN_NAVIGATION]: mockMainNavigation,
    [FOOTER_NAVIGATION]: mockFooterNavigation,
  }

  it('returns root children for an existing navigation', () => {
    const result = getNavigationNodes(navigations, MAIN_NAVIGATION)

    expect(result).toEqual(childNodes)
  })

  it('returns empty array for a missing navigation key', () => {
    const result = getNavigationNodes(navigations, 'nonexistent')

    expect(result).toEqual([])
  })

  it('returns empty array from empty navigations record', () => {
    const result = getNavigationNodes({}, MAIN_NAVIGATION)

    expect(result).toEqual([])
  })
})
