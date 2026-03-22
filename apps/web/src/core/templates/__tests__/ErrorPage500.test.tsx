import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'

vi.mock('next/link', () => ({
  default: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}))

import ErrorPage500 from '../ErrorPage500'
import type { TemplateProps } from '@/lib/types'
import type { RouteInfo } from '@/lib/types'
import type { Page } from '@skeleton-fe/sdk-elastic'

const mockRoute: RouteInfo = {
  sourceId: 0,
  sourceType: 'document',
  controllerTemplate: 'CmsModule:ErrorPage500',
}

const mockPage = {
  id: '0',
  title: '500',
  description: '',
  path: '/',
  key: '500',
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

describe('ErrorPage500', () => {
  it('renders the 500 heading', () => {
    render(<ErrorPage500 {...defaultProps} />)
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('500')
  })

  it('renders a server error message', () => {
    render(<ErrorPage500 {...defaultProps} />)
    expect(screen.getByText(/server error/i)).toBeInTheDocument()
  })

  it('renders a link to the homepage using the locale', () => {
    render(<ErrorPage500 {...defaultProps} />)
    const link = screen.getByRole('link', { name: /go to homepage/i })
    expect(link).toHaveAttribute('href', '/en')
  })

  it('renders inside a section element', () => {
    const { container } = render(<ErrorPage500 {...defaultProps} />)
    expect(container.querySelector('section')).toBeInTheDocument()
  })
})
