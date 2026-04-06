import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import type { HighlightContentBlock } from '@skeleton-fe/sdk-elastic'

import { HighlightBlock } from '../HighlightBlock'

const mockImage = {
  src: '/images/10/image-thumb__10__Highlight/photo.jpg',
  alt: 'Feature photo',
  title: 'Test title',
  sources: [
    {
      type: 'image/webp',
      srcset: '/images/10/image-thumb__10__Highlight/photo.webp 1x',
      media: null,
    },
  ],
  width: 400,
  height: 300,
  copyright: '',
}

describe('HighlightBlock', () => {
  const block: HighlightContentBlock = {
    type: 'highlight',
    order: 1,
    items: [
      { title: 'Feature 1', text: 'Description 1', image: null },
      { title: 'Feature 2', text: 'Description 2', image: mockImage },
    ],
  }

  it('renders all item titles', () => {
    render(<HighlightBlock block={block} />)
    expect(screen.getByText('Feature 1')).toBeInTheDocument()
    expect(screen.getByText('Feature 2')).toBeInTheDocument()
  })

  it('renders item text descriptions', () => {
    render(<HighlightBlock block={block} />)
    expect(screen.getByText('Description 1')).toBeInTheDocument()
    expect(screen.getByText('Description 2')).toBeInTheDocument()
  })

  it('renders a picture for items with image', () => {
    const { container } = render(<HighlightBlock block={block} />)
    const pictures = container.querySelectorAll('picture')
    expect(pictures).toHaveLength(1)
  })

  it('renders empty block without errors', () => {
    const emptyBlock: HighlightContentBlock = { type: 'highlight', order: 1, items: [] }
    const { container } = render(<HighlightBlock block={emptyBlock} />)
    expect(container).toBeInTheDocument()
  })
})
