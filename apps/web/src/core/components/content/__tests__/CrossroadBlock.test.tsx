import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import type { CrossroadBlockEditable, CrossroadContentBlock } from '@skeleton-fe/sdk-elastic'

vi.mock('next/image', () => ({
  default: ({ src, alt }: { src: string; alt: string }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} />
  ),
}))

vi.mock('next/link', () => ({
  default: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}))

import { CrossroadBlock } from '../CrossroadBlock'

describe('CrossroadBlock (Editable)', () => {
  const block: CrossroadBlockEditable = {
    type: 'crossroad-block',
    order: 1,
    items: [
      {
        title: 'Item 1',
        text: 'Text 1',
        imagePosition: 'left',
        linkHref: '/page',
        linkText: 'Read more',
        imageId: null,
      },
    ],
  }

  it('renders item title', () => {
    render(<CrossroadBlock block={block} />)
    expect(screen.getByText('Item 1')).toBeInTheDocument()
  })

  it('renders item text', () => {
    render(<CrossroadBlock block={block} />)
    expect(screen.getByText('Text 1')).toBeInTheDocument()
  })

  it('renders the link with correct href', () => {
    render(<CrossroadBlock block={block} />)
    const link = screen.getByText('Read more')

    expect(link.closest('a')).toHaveAttribute('href', '/page')
  })
})

describe('CrossroadBlock (ContentBlock)', () => {
  const block: CrossroadContentBlock = {
    type: 'crossroad-block',
    order: 1,
    items: [
      {
        title: 'Article Item',
        text: 'Article text',
        reverseContent: true,
        linkHref: null,
        linkText: null,
        imageId: 5,
      },
    ],
  }

  it('renders title from content block item', () => {
    render(<CrossroadBlock block={block} />)
    expect(screen.getByText('Article Item')).toBeInTheDocument()
  })

  it('renders image for item with imageId', () => {
    const { container } = render(<CrossroadBlock block={block} />)
    const img = container.querySelector('img')

    expect(img).toBeInTheDocument()
    expect(img?.src).toContain('5')
  })

  it('does not render link when linkHref is null', () => {
    render(<CrossroadBlock block={block} />)
    const links = screen.queryAllByRole('link')

    expect(links).toHaveLength(0)
  })
})
