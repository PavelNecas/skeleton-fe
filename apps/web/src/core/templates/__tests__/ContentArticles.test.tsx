import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import type { Page } from '@skeleton-fe/sdk-elastic'

vi.mock('@/core/components/content/BlockRenderer', () => ({
  BlockRenderer: ({ blocks }: { blocks: unknown[] }) => (
    <div data-testid="block-renderer" data-count={blocks.length} />
  ),
}))

vi.mock('@skeleton-fe/ui', () => ({
  Breadcrumb: ({ children }: { children: React.ReactNode }) => <nav>{children}</nav>,
  BreadcrumbList: ({ children }: { children: React.ReactNode }) => <ol>{children}</ol>,
  BreadcrumbItem: ({ children }: { children: React.ReactNode }) => <li>{children}</li>,
  BreadcrumbLink: ({ children, asChild }: { children: React.ReactNode; asChild?: boolean }) =>
    asChild ? <>{children}</> : <a>{children}</a>,
  BreadcrumbPage: ({ children }: { children: React.ReactNode }) => <span>{children}</span>,
  BreadcrumbSeparator: () => <li aria-hidden="true">/</li>,
  BreadcrumbEllipsis: () => <span>...</span>,
}))

vi.mock('next/link', () => ({
  default: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}))

vi.mock('@/lib/data-fetching', () => ({
  fetchArticleListing: vi.fn().mockResolvedValue({
    items: [],
    total: 0,
    page: 1,
    perPage: 10,
    totalPages: 0,
  }),
  fetchArticleCategories: vi.fn().mockResolvedValue([]),
}))

import type { TemplateProps } from '@/lib/types'

import ContentArticles from '../Cms/Articles/Default'

const mockPage: Page = {
  id: '10',
  title: 'Articles',
  description: 'Article listing page',
  path: '/en/articles',
  key: 'articles',
  locale: 'en',
  published: true,
  modificationDate: 1700000000,
  site: 'default',
  parentId: 1,
  index: 0,
  prettyUrl: '',
  creationDate: 1700000000,
  technicalData: {
    controller: 'Cms',
    template: '',
    contentMainDocumentId: null,
    staticGeneratorEnabled: false,
    staticGeneratorLifetime: null,
  },
  navigationData: {
    name: 'Articles',
    title: null,
    cssClass: null,
    target: null,
    anchor: null,
    parameters: null,
    exclude: false,
    relation: null,
    accesskey: null,
    tabindex: null,
  },
  properties: [],
  editables: [],
}

const mockRoute = {
  sourceId: 10,
  sourceType: 'document',
  objectType: 'Page',
  controllerTemplate: 'Cms:Articles:default',
  translationLinks: [],
}

const defaultProps: TemplateProps = {
  data: mockPage,
  route: mockRoute,
  locale: 'en',
  sitePrefix: 'default',
  searchParams: {},
  pathname: '/en/articles',
}

describe('ContentArticles', () => {
  it('renders the page title as h1', async () => {
    const Component = await ContentArticles(defaultProps)
    render(Component)
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Articles')
  })

  it('renders breadcrumb navigation', async () => {
    const Component = await ContentArticles(defaultProps)
    render(Component)
    expect(screen.getByRole('navigation', { name: /breadcrumb/i })).toBeInTheDocument()
  })

  it('renders BlockRenderer when editables are present', async () => {
    const pageWithEditables: Page = {
      ...mockPage,
      editables: [{ type: 'rich-text', order: 1, content: '<p>Hello</p>' }],
    }

    const Component = await ContentArticles({ ...defaultProps, data: pageWithEditables })
    render(Component)
    expect(screen.getByTestId('block-renderer')).toBeInTheDocument()
  })

  it('does not render BlockRenderer when editables are empty', async () => {
    const Component = await ContentArticles(defaultProps)
    render(Component)
    expect(screen.queryByTestId('block-renderer')).not.toBeInTheDocument()
  })
})
