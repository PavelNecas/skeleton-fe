import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import type { HighlightContentBlock } from '@skeleton-fe/sdk-elastic'

vi.mock('next/image', () => ({
  default: ({ src, alt }: { src: string; alt: string }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} />
  ),
}))

import { HighlightBlock } from '../HighlightBlock'

describe('HighlightBlock', () => {
  const block: HighlightContentBlock = {
    type: 'highlight',
    order: 1,
    items: [
      { title: 'Feature 1', text: 'Description 1', imageId: null },
      { title: 'Feature 2', text: 'Description 2', imageId: 10 },
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

  it('renders an image for items with imageId', () => {
    const { container } = render(<HighlightBlock block={block} />)
    const images = container.querySelectorAll('img')

    expect(images).toHaveLength(1)
  })

  it('renders empty block without errors', () => {
    const emptyBlock: HighlightContentBlock = { type: 'highlight', order: 1, items: [] }
    const { container } = render(<HighlightBlock block={emptyBlock} />)

    expect(container).toBeInTheDocument()
  })
})
