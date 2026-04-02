import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import type { Page } from '@skeleton-fe/sdk-elastic'

vi.mock('@/core/components/content/BlockRenderer', () => ({
  BlockRenderer: ({ blocks }: { blocks: unknown[] }) => (
    <div data-testid="block-renderer" data-count={blocks.length} />
  ),
}))

import type { RouteInfo, TemplateProps } from '@/lib/types'

import Homepage from '../Cms/Homepage/Default'

const mockRoute: RouteInfo = {
  sourceId: 1,
  sourceType: 'document',
  objectType: 'Page',
  controllerTemplate: 'Cms:Homepage:default',
  translationLinks: [],
}

const mockPage: Page = {
  id: '1',
  title: 'Welcome Home',
  description: 'Homepage description',
  path: '/',
  key: 'home',
  locale: 'en',
  published: true,
  modificationDate: 1700000000,
  site: 'default',
  parentId: 0,
  index: 0,
  prettyUrl: '/',
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

describe('Homepage', () => {
  it('renders the page title as h1', () => {
    render(<Homepage {...defaultProps} />)
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Welcome Home')
  })

  it('renders BlockRenderer when editables are present', () => {
    const pageWithEditables: Page = {
      ...mockPage,
      editables: [{ type: 'rich-text', order: 1, content: '<p>Hello</p>' }],
    }

    render(<Homepage {...defaultProps} data={pageWithEditables} />)
    expect(screen.getByTestId('block-renderer')).toBeInTheDocument()
  })

  it('does not render BlockRenderer when editables are empty', () => {
    render(<Homepage {...defaultProps} />)
    expect(screen.queryByTestId('block-renderer')).not.toBeInTheDocument()
  })

  it('renders inside a section element', () => {
    const { container } = render(<Homepage {...defaultProps} />)
    expect(container.querySelector('section')).toBeInTheDocument()
  })
})
