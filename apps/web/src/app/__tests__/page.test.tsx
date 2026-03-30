import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'

// Mock next/headers — not available in test environment
vi.mock('next/headers', () => ({
  headers: vi.fn(() =>
    Promise.resolve({
      get: (key: string) => {
        const map: Record<string, string> = {
          'x-site-prefix': 'skeleton_localhost',
          'x-locale': 'cs',
          'x-default-locale': 'cs',
          'x-route': JSON.stringify({
            sourceId: 1,
            sourceType: 'document',
            controllerTemplate: 'Cms:Page:default',
            translationLinks: [],
          }),
          'x-template': 'Cms:Page:default',
        }
        return map[key] ?? null
      },
    }),
  ),
}))

// Mock next/navigation
vi.mock('next/navigation', () => ({
  notFound: vi.fn(() => {
    throw new Error('NEXT_NOT_FOUND')
  }),
}))

// Mock shared data-fetching (uses React.cache internally)
vi.mock('@/lib/data-fetching', () => ({
  fetchPageData: vi.fn().mockResolvedValue({
    id: '1',
    title: 'Test Page',
    path: '/test',
    locale: 'cs',
    published: true,
    editables: [],
  }),
}))

// Mock navigation fetching
vi.mock('@/lib/navigation', () => ({
  fetchMainNavigation: vi.fn().mockResolvedValue([]),
}))

// Mock site config to avoid dynamic import side effects
vi.mock('@/lib/site-config', () => ({
  loadSiteConfig: vi.fn().mockResolvedValue({ name: 'Skeleton Localhost' }),
}))

// Mock component resolver to return a simple stub component
vi.mock('@/lib/component-resolver', () => ({
  resolveComponent: vi.fn().mockResolvedValue(function StubTemplate() {
    return <div data-testid="template-stub">Template rendered</div>
  }),
}))

// Mock MainLayout to avoid rendering Header/Footer dependencies
vi.mock('@/core/layouts/MainLayout', () => ({
  MainLayout: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))

import CatchAllPage from '../[[...path]]/page'

describe('CatchAllPage', () => {
  it('renders the resolved template component', async () => {
    const jsx = await CatchAllPage()
    render(jsx)
    expect(screen.getByTestId('template-stub')).toBeInTheDocument()
  })
})
