import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import type { CrossroadBlockEditable, CrossroadContentBlock } from '@skeleton-fe/sdk-elastic'

vi.mock('next/link', () => ({
  default: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}))

import { CrossroadBlock } from '../CrossroadBlock'

const mockImage = {
  src: '/images/5/image-thumb__5__CrossRoadBlock/photo.jpg',
  alt: 'Photo',
  sources: [
    {
      type: 'image/webp',
      srcset: '/images/5/image-thumb__5__CrossRoadBlock/photo.webp 1x',
      media: null,
    },
  ],
  width: 750,
  height: 300,
}

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
        image: null,
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
        image: mockImage,
      },
    ],
  }

  it('renders title from content block item', () => {
    render(<CrossroadBlock block={block} />)
    expect(screen.getByText('Article Item')).toBeInTheDocument()
  })

  it('renders picture element for item with image', () => {
    const { container } = render(<CrossroadBlock block={block} />)
    const picture = container.querySelector('picture')
    const img = container.querySelector('img')

    expect(picture).toBeInTheDocument()
    expect(img).toBeInTheDocument()
  })

  it('does not render link when linkHref is null', () => {
    render(<CrossroadBlock block={block} />)
    const links = screen.queryAllByRole('link')
    expect(links).toHaveLength(0)
  })
})
