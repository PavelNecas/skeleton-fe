import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { Navigation, NavigationNode } from '@skeleton-fe/sdk-elastic'

// Mock the elastic client module
vi.mock('@/lib/elastic-client', () => ({
  getElasticClient: vi.fn(),
}))

import { getElasticClient } from '@/lib/elastic-client'
import { fetchMainNavigation, DEFAULT_MENU_NAME } from '../navigation'

const mockGetByName = vi.fn()

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(getElasticClient).mockReturnValue({
    navigations: { getByName: mockGetByName },
  } as unknown as ReturnType<typeof getElasticClient>)
})

const childNodes: NavigationNode[] = [
  { id: '1', path: '/en', label: 'Home', href: '/', documentType: 'page', children: [] },
  { id: '2', path: '/en/about', label: 'About', href: '/about', documentType: 'page', children: [] },
]

const mockNavigation: Navigation = {
  id: 'nav-1',
  menuDocumentName: DEFAULT_MENU_NAME,
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

describe('DEFAULT_MENU_NAME', () => {
  it('is "main-navigation"', () => {
    expect(DEFAULT_MENU_NAME).toBe('main-navigation')
  })
})

describe('fetchMainNavigation', () => {
  it('calls getByName with the site prefix and default menu name', async () => {
    mockGetByName.mockResolvedValue(mockNavigation)

    await fetchMainNavigation('mysite')

    expect(mockGetByName).toHaveBeenCalledWith('mysite', DEFAULT_MENU_NAME)
  })

  it('returns root children from the navigation', async () => {
    mockGetByName.mockResolvedValue(mockNavigation)

    const result = await fetchMainNavigation('mysite')

    expect(result).toEqual(childNodes)
  })

  it('returns an empty array when navigation is not found', async () => {
    mockGetByName.mockResolvedValue(null)

    const result = await fetchMainNavigation('mysite')

    expect(result).toEqual([])
  })

  it('returns an empty array when root has no children', async () => {
    const navWithNoChildren: Navigation = {
      ...mockNavigation,
      root: { ...mockNavigation.root, children: [] },
    }
    mockGetByName.mockResolvedValue(navWithNoChildren)

    const result = await fetchMainNavigation('mysite')

    expect(result).toEqual([])
  })
})
