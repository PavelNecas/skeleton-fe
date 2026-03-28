import { render } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import type { ImageContentBlock } from '@skeleton-fe/sdk-elastic'

// Mock Next.js Image
vi.mock('next/image', () => ({
  default: ({ src, alt }: { src: string; alt: string }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} />
  ),
}))

import { ImageBlock } from '../ImageBlock'

describe('ImageBlock', () => {
  it('renders an image when imageId is set', () => {
    const block: ImageContentBlock = {
      type: 'image',
      order: 1,
      imageId: 42,
    }

    const { container } = render(<ImageBlock block={block} />)
    const img = container.querySelector('img')

    expect(img).toBeInTheDocument()
    expect(img?.src).toContain('42')
  })

  it('renders nothing when imageId is null', () => {
    const block: ImageContentBlock = {
      type: 'image',
      order: 1,
      imageId: null,
    }

    const { container } = render(<ImageBlock block={block} />)
    expect(container.firstChild).toBeNull()
  })
})
