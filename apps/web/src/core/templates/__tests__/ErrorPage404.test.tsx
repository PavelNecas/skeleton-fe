import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import type { Page } from '@skeleton-fe/sdk-elastic'

vi.mock('next/link', () => ({
  default: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}))

import type { RouteInfo, TemplateProps } from '@/lib/types'

import ErrorPage404 from '../ErrorPage404'

const mockRoute: RouteInfo = {
  sourceId: 0,
  sourceType: 'document',
  controllerTemplate: 'CmsModule:ErrorPage404',
}

const mockPage = {
  id: '0',
  title: '404',
  description: '',
  path: '/',
  key: '404',
  locale: 'en',
  published: true,
  modificationDate: 0,
  site: 'default',
  parentId: 0,
  index: 0,
  prettyUrl: '/',
  creationDate: 0,
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
} satisfies Page

const defaultProps: TemplateProps = {
  data: mockPage,
  route: mockRoute,
  locale: 'en',
  sitePrefix: 'default',
}

describe('ErrorPage404', () => {
  it('renders the 404 heading', () => {
    render(<ErrorPage404 {...defaultProps} />)
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('404')
  })

  it('renders a "page not found" message', () => {
    render(<ErrorPage404 {...defaultProps} />)
    expect(screen.getByText(/page not found/i)).toBeInTheDocument()
  })

  it('renders a link to the homepage using the locale', () => {
    render(<ErrorPage404 {...defaultProps} />)
    const link = screen.getByRole('link', { name: /go to homepage/i })
    expect(link).toHaveAttribute('href', '/en')
  })

  it('renders inside a section element', () => {
    const { container } = render(<ErrorPage404 {...defaultProps} />)
    expect(container.querySelector('section')).toBeInTheDocument()
  })
})
