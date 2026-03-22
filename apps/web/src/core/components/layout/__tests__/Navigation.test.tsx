import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import type { NavigationNode } from '@skeleton-fe/sdk-elastic'

vi.mock('next/link', () => ({
  default: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}))

import { Navigation } from '../Navigation'

const flatNodes: NavigationNode[] = [
  { id: '1', path: '/home', label: 'Home', href: '/', documentType: 'page', children: [] },
  { id: '2', path: '/about', label: 'About', href: '/about', documentType: 'page', children: [] },
]

const nestedNodes: NavigationNode[] = [
  {
    id: '1',
    path: '/products',
    label: 'Products',
    href: '/products',
    documentType: 'page',
    children: [
      {
        id: '1.1',
        path: '/products/shoes',
        label: 'Shoes',
        href: '/products/shoes',
        documentType: 'page',
        children: [],
      },
      {
        id: '1.2',
        path: '/products/bags',
        label: 'Bags',
        href: '/products/bags',
        documentType: 'page',
        children: [],
      },
    ],
  },
]

describe('Navigation', () => {
  it('renders null when nodes are empty', () => {
    const { container } = render(<Navigation nodes={[]} />)
    expect(container.firstChild).toBeNull()
  })

  it('renders flat navigation nodes', () => {
    render(<Navigation nodes={flatNodes} />)

    expect(screen.getByText('Home')).toBeInTheDocument()
    expect(screen.getByText('About')).toBeInTheDocument()
  })

  it('renders links with correct hrefs', () => {
    render(<Navigation nodes={flatNodes} />)

    const homeLink = screen.getByText('Home').closest('a')
    const aboutLink = screen.getByText('About').closest('a')

    expect(homeLink).toHaveAttribute('href', '/')
    expect(aboutLink).toHaveAttribute('href', '/about')
  })

  it('renders nested navigation nodes recursively', () => {
    render(<Navigation nodes={nestedNodes} />)

    expect(screen.getByText('Products')).toBeInTheDocument()
    expect(screen.getByText('Shoes')).toBeInTheDocument()
    expect(screen.getByText('Bags')).toBeInTheDocument()
  })

  it('renders a span for nodes without href', () => {
    const noHrefNodes: NavigationNode[] = [
      { id: '1', path: '/section', label: 'Section', href: null, documentType: null, children: [] },
    ]

    render(<Navigation nodes={noHrefNodes} />)
    const span = screen.getByText('Section')

    expect(span.tagName).toBe('SPAN')
  })

  it('uses id as fallback label when label is null', () => {
    const nullLabelNode: NavigationNode[] = [
      {
        id: 'node-id',
        path: '/path',
        label: null,
        href: '/path',
        documentType: 'page',
        children: [],
      },
    ]

    render(<Navigation nodes={nullLabelNode} />)
    expect(screen.getByText('node-id')).toBeInTheDocument()
  })

  it('has nav with aria-label', () => {
    render(<Navigation nodes={flatNodes} />)
    const nav = screen.getByRole('navigation')

    expect(nav).toHaveAttribute('aria-label', 'Main navigation')
  })
})
