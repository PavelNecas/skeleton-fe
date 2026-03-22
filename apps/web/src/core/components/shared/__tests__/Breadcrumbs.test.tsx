import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'

vi.mock('@skeleton-fe/ui', () => ({
  Breadcrumb: ({ children }: { children: React.ReactNode }) => <nav>{children}</nav>,
  BreadcrumbList: ({ children }: { children: React.ReactNode }) => <ol>{children}</ol>,
  BreadcrumbItem: ({ children }: { children: React.ReactNode }) => <li>{children}</li>,
  BreadcrumbLink: ({
    children,
    asChild,
  }: {
    children: React.ReactNode
    asChild?: boolean
  }) => (asChild ? <>{children}</> : <a>{children}</a>),
  BreadcrumbPage: ({ children }: { children: React.ReactNode }) => <span>{children}</span>,
  BreadcrumbSeparator: () => <li aria-hidden="true">/</li>,
  BreadcrumbEllipsis: () => <span>...</span>,
}))

vi.mock('next/link', () => ({
  default: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}))

import { Breadcrumbs, buildBreadcrumbsFromPath } from '../Breadcrumbs'

describe('buildBreadcrumbsFromPath', () => {
  it('generates home entry for root path', () => {
    const entries = buildBreadcrumbsFromPath('/')

    expect(entries).toHaveLength(1)
    expect(entries[0].label).toBe('Home')
    expect(entries[0].href).toBe('/')
  })

  it('generates entries for multi-segment path', () => {
    const entries = buildBreadcrumbsFromPath('/en/products/shoes')

    expect(entries).toHaveLength(4)
    expect(entries[0].label).toBe('Home')
    expect(entries[1].label).toBe('En')
    expect(entries[2].label).toBe('Products')
    expect(entries[3].label).toBe('Shoes')
  })

  it('generates correct hrefs for each segment', () => {
    const entries = buildBreadcrumbsFromPath('/en/products')

    expect(entries[0].href).toBe('/')
    expect(entries[1].href).toBe('/en')
    expect(entries[2].href).toBe('/en/products')
  })

  it('capitalises first letter and replaces hyphens with spaces', () => {
    const entries = buildBreadcrumbsFromPath('/my-category')

    expect(entries[1].label).toBe('My category')
  })

  it('uses a custom home label', () => {
    const entries = buildBreadcrumbsFromPath('/page', 'Start')

    expect(entries[0].label).toBe('Start')
  })
})

describe('Breadcrumbs', () => {
  it('renders nothing when items are empty', () => {
    const { container } = render(<Breadcrumbs items={[]} />)
    expect(container.firstChild).toBeNull()
  })

  it('renders all items', () => {
    render(
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Products', href: '/products' },
          { label: 'Shoes' },
        ]}
      />,
    )

    expect(screen.getByText('Home')).toBeInTheDocument()
    expect(screen.getByText('Products')).toBeInTheDocument()
    expect(screen.getByText('Shoes')).toBeInTheDocument()
  })

  it('renders last item without a link', () => {
    render(
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Current Page' },
        ]}
      />,
    )

    const currentPage = screen.getByText('Current Page')
    expect(currentPage.tagName).toBe('SPAN')
    expect(currentPage.closest('a')).toBeNull()
  })

  it('renders non-last items as links', () => {
    render(
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Last' },
        ]}
      />,
    )

    const homeLink = screen.getByText('Home').closest('a')
    expect(homeLink).toHaveAttribute('href', '/')
  })
})
