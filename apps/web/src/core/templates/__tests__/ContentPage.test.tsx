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

import type { RouteInfo, TemplateProps } from '@/lib/types'

import ContentPage from '../Cms/Page/Default'

const mockRoute: RouteInfo = {
  sourceId: 2,
  sourceType: 'document',
  controllerTemplate: 'Cms:Page:default',
  translationLinks: [],
}

const mockPage: Page = {
  id: '2',
  title: 'About Us',
  description: 'About page',
  path: '/en/about',
  key: 'about',
  locale: 'en',
  published: true,
  modificationDate: 1700000000,
  site: 'default',
  parentId: 1,
  index: 0,
  prettyUrl: '/en/about',
  creationDate: 1700000000,
  technicalData: {
    controller: null,
    template: null,
    contentMainDocumentId: null,
    staticGeneratorEnabled: false,
    staticGeneratorLifetime: null,
  },
  navigationData: {
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
  },
  editables: [],
  properties: [],
}

const defaultProps: TemplateProps = {
  data: mockPage,
  route: mockRoute,
  locale: 'en',
  sitePrefix: 'default',
}

describe('ContentPage', () => {
  it('renders the page title as h1', () => {
    render(<ContentPage {...defaultProps} />)
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('About Us')
  })

  it('renders breadcrumbs navigation', () => {
    render(<ContentPage {...defaultProps} />)
    expect(screen.getByRole('navigation', { name: /breadcrumb/i })).toBeInTheDocument()
  })

  it('renders breadcrumb entries from path', () => {
    render(<ContentPage {...defaultProps} />)
    expect(screen.getByText('Home')).toBeInTheDocument()
  })

  it('renders BlockRenderer when editables are present', () => {
    const pageWithEditables: Page = {
      ...mockPage,
      editables: [{ type: 'rich-text', order: 1, content: '<p>Content</p>' }],
    }

    render(<ContentPage {...defaultProps} data={pageWithEditables} />)
    expect(screen.getByTestId('block-renderer')).toBeInTheDocument()
  })

  it('does not render BlockRenderer when editables are empty', () => {
    render(<ContentPage {...defaultProps} />)
    expect(screen.queryByTestId('block-renderer')).not.toBeInTheDocument()
  })

  it('renders inside a section element', () => {
    const { container } = render(<ContentPage {...defaultProps} />)
    expect(container.querySelector('section')).toBeInTheDocument()
  })
})
