import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import type { Article } from '@skeleton-fe/sdk-elastic'

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

import ContentArticles from '../ContentArticles'

const mockRoute: RouteInfo = {
  sourceId: 10,
  sourceType: 'object',
  controllerTemplate: 'CmsModule:ContentArticles',
  translationLinks: [],
}

const mockArticle: Article = {
  id: '10',
  name: 'My First Article',
  metaDescription: 'SEO description',
  description: '<p>Article body content</p>',
  perex: 'Short introduction to the article.',
  summary: null,
  locale: 'en',
  published: true,
  path: '/en/articles/my-first-article',
  slug: 'my-first-article',
  frontendTemplate: null,
  modificationDate: 1700000000,
  creationDate: 1700000000,
  properties: [],
  contentBlocks: [],
}

const defaultProps: TemplateProps = {
  data: mockArticle,
  route: mockRoute,
  locale: 'en',
  sitePrefix: 'default',
}

describe('ContentArticles', () => {
  it('renders the article name as h1', () => {
    render(<ContentArticles {...defaultProps} />)
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('My First Article')
  })

  it('renders the article perex', () => {
    render(<ContentArticles {...defaultProps} />)
    expect(screen.getByText('Short introduction to the article.')).toBeInTheDocument()
  })

  it('renders a publication date', () => {
    render(<ContentArticles {...defaultProps} />)
    expect(screen.getByRole('article').querySelector('time')).toBeInTheDocument()
  })

  it('renders breadcrumb navigation', () => {
    render(<ContentArticles {...defaultProps} />)
    expect(screen.getByRole('navigation', { name: /breadcrumb/i })).toBeInTheDocument()
  })

  it('renders BlockRenderer when contentBlocks are present', () => {
    const articleWithBlocks: Article = {
      ...mockArticle,
      contentBlocks: [{ type: 'image', order: 1, imageId: 42 }],
    }

    render(<ContentArticles {...defaultProps} data={articleWithBlocks} />)
    expect(screen.getByTestId('block-renderer')).toBeInTheDocument()
  })

  it('does not render BlockRenderer when contentBlocks are empty', () => {
    render(<ContentArticles {...defaultProps} />)
    expect(screen.queryByTestId('block-renderer')).not.toBeInTheDocument()
  })

  it('renders description HTML', () => {
    render(<ContentArticles {...defaultProps} />)
    expect(screen.getByText('Article body content')).toBeInTheDocument()
  })

  it('renders inside an article element', () => {
    render(<ContentArticles {...defaultProps} />)
    expect(screen.getByRole('article')).toBeInTheDocument()
  })

  it('does not render h1 when name is null', () => {
    const articleWithoutName: Article = { ...mockArticle, name: null }

    render(<ContentArticles {...defaultProps} data={articleWithoutName} />)
    expect(screen.queryByRole('heading', { level: 1 })).not.toBeInTheDocument()
  })
})
