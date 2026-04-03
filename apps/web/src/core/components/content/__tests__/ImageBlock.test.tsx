import { render } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import type { ImageContentBlock } from '@skeleton-fe/sdk-elastic'

import { ImageBlock } from '../ImageBlock'

const mockImage = {
  src: '/images/42/image-thumb__42__ImageBlock/photo.jpg',
  alt: 'Test photo',
  sources: [
    {
      type: 'image/avif',
      srcset: '/images/42/image-thumb__42__ImageBlock/photo.avif 1x',
      media: null,
    },
  ],
  width: 1200,
  height: 630,
}

describe('ImageBlock', () => {
  it('renders a picture element when image is set', () => {
    const block: ImageContentBlock = { type: 'image', order: 1, image: mockImage }

    const { container } = render(<ImageBlock block={block} />)
    const picture = container.querySelector('picture')
    const img = container.querySelector('img')

    expect(picture).toBeInTheDocument()
    expect(img).toBeInTheDocument()
    expect(img?.getAttribute('alt')).toBe('Test photo')
  })

  it('renders source elements for responsive formats', () => {
    const block: ImageContentBlock = { type: 'image', order: 1, image: mockImage }

    const { container } = render(<ImageBlock block={block} />)
    const sources = container.querySelectorAll('source')

    expect(sources).toHaveLength(1)
    expect(sources[0]?.getAttribute('type')).toBe('image/avif')
  })

  it('renders nothing when image is null', () => {
    const block: ImageContentBlock = { type: 'image', order: 1, image: null }

    const { container } = render(<ImageBlock block={block} />)
    expect(container.firstChild).toBeNull()
  })
})
