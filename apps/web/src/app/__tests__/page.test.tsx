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
          'x-route': JSON.stringify({
            sourceId: 1,
            sourceType: 'document',
            controllerTemplate: 'CmsModule:ContentPage',
          }),
          'x-template': 'CmsModule:ContentPage',
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

// Mock elastic client
vi.mock('@/lib/elastic-client', () => ({
  getElasticClient: vi.fn(() => ({
    pages: {
      findById: vi.fn().mockResolvedValue({
        id: '1',
        title: 'Test Page',
        path: '/test',
        locale: 'cs',
        published: true,
      }),
    },
    articles: {
      findById: vi.fn().mockResolvedValue(null),
    },
  })),
}))

// Mock component resolver to return a simple stub component
vi.mock('@/lib/component-resolver', () => ({
  resolveComponent: vi.fn().mockResolvedValue(function StubTemplate() {
    return <div data-testid="template-stub">Template rendered</div>
  }),
}))

import CatchAllPage from '../[[...path]]/page'

describe('CatchAllPage', () => {
  it('renders the resolved template component', async () => {
    const jsx = await CatchAllPage()
    render(jsx)
    expect(screen.getByTestId('template-stub')).toBeInTheDocument()
  })
})
