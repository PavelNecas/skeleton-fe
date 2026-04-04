import { render } from '@testing-library/react'
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import type { PimcoreImage as PimcoreImageType } from '@skeleton-fe/sdk-elastic'

import { PimcoreImage } from '../PimcoreImage'

const mockImage: PimcoreImageType = {
  src: '/images/42/image-thumb__42__default/photo.jpg',
  alt: 'Test photo',
  title: 'Test photo title',
  sources: [
    {
      type: 'image/avif',
      srcset:
        '/images/42/image-thumb__42__avif/photo.avif 1x, /images/42/image-thumb__42__avif@2x/photo.avif 2x',
      media: null,
    },
    {
      type: 'image/webp',
      srcset:
        '/images/42/image-thumb__42__webp/photo.webp 300w, /images/42/image-thumb__42__webp@600/photo.webp 600w',
      media: '(max-width: 768px)',
    },
  ],
  width: 1200,
  height: 630,
}

describe('PimcoreImage', () => {
  describe('without PIMCORE_BACKEND_URL', () => {
    it('renders a picture element', () => {
      const { container } = render(<PimcoreImage image={mockImage} />)

      expect(container.querySelector('picture')).toBeInTheDocument()
    })

    it('renders an img fallback with correct attributes', () => {
      const { container } = render(<PimcoreImage image={mockImage} />)
      const img = container.querySelector('img')

      expect(img).toBeInTheDocument()
      expect(img?.getAttribute('src')).toBe('/images/42/image-thumb__42__default/photo.jpg')
      expect(img?.getAttribute('alt')).toBe('Test photo')
      expect(img?.getAttribute('width')).toBe('1200')
      expect(img?.getAttribute('height')).toBe('630')
    })

    it('renders source elements for each source', () => {
      const { container } = render(<PimcoreImage image={mockImage} />)
      const sources = container.querySelectorAll('source')

      expect(sources).toHaveLength(2)
    })

    it('sets correct type on source elements', () => {
      const { container } = render(<PimcoreImage image={mockImage} />)
      const sources = container.querySelectorAll('source')

      expect(sources[0]?.getAttribute('type')).toBe('image/avif')
      expect(sources[1]?.getAttribute('type')).toBe('image/webp')
    })

    it('sets media attribute only when source has a media value', () => {
      const { container } = render(<PimcoreImage image={mockImage} />)
      const sources = container.querySelectorAll('source')

      expect(sources[0]?.hasAttribute('media')).toBe(false)
      expect(sources[1]?.getAttribute('media')).toBe('(max-width: 768px)')
    })

    it('passes className to the img element', () => {
      const { container } = render(<PimcoreImage image={mockImage} className="rounded-lg" />)
      const img = container.querySelector('img')

      expect(img?.getAttribute('class')).toBe('rounded-lg')
    })

    it('renders title attribute when title is non-empty', () => {
      const { container } = render(<PimcoreImage image={mockImage} />)
      const img = container.querySelector('img')

      expect(img?.getAttribute('title')).toBe('Test photo title')
    })

    it('omits title attribute when title is empty string', () => {
      const imageNoTitle: PimcoreImageType = { ...mockImage, title: '' }
      const { container } = render(<PimcoreImage image={imageNoTitle} />)
      const img = container.querySelector('img')

      expect(img?.hasAttribute('title')).toBe(false)
    })

    it('filters out sources with empty srcset', () => {
      const imageWithEmptySource: PimcoreImageType = {
        ...mockImage,
        sources: [
          { type: 'image/avif', srcset: '', media: null },
          { type: 'image/webp', srcset: '/photo.webp 1x', media: null },
        ],
      }

      const { container } = render(<PimcoreImage image={imageWithEmptySource} />)
      const sources = container.querySelectorAll('source')

      expect(sources).toHaveLength(1)
      expect(sources[0]?.getAttribute('type')).toBe('image/webp')
    })

    it('renders no source elements when sources array is empty', () => {
      const imageNoSources: PimcoreImageType = { ...mockImage, sources: [] }

      const { container } = render(<PimcoreImage image={imageNoSources} />)
      const sources = container.querySelectorAll('source')

      expect(sources).toHaveLength(0)
    })
  })

  describe('with PIMCORE_BACKEND_URL', () => {
    beforeEach(() => {
      vi.stubEnv('PIMCORE_BACKEND_URL', 'https://pimcore.example.com')
    })

    afterEach(() => {
      vi.unstubAllEnvs()
    })

    it('prefixes img src with the backend URL', () => {
      const { container } = render(<PimcoreImage image={mockImage} />)
      const img = container.querySelector('img')

      expect(img?.getAttribute('src')).toBe(
        'https://pimcore.example.com/images/42/image-thumb__42__default/photo.jpg',
      )
    })

    it('prefixes srcset paths with the backend URL — integer x descriptor', () => {
      const imageWithX: PimcoreImageType = {
        ...mockImage,
        sources: [
          {
            type: 'image/avif',
            srcset: '/photo.avif 1x, /photo@2x.avif 2x',
            media: null,
          },
        ],
      }

      const { container } = render(<PimcoreImage image={imageWithX} />)
      const source = container.querySelector('source')

      expect(source?.getAttribute('srcset')).toBe(
        'https://pimcore.example.com/photo.avif 1x, https://pimcore.example.com/photo@2x.avif 2x',
      )
    })

    it('prefixes srcset paths with the backend URL — integer w descriptor', () => {
      const imageWithW: PimcoreImageType = {
        ...mockImage,
        sources: [
          {
            type: 'image/webp',
            srcset: '/photo.webp 300w, /photo@600.webp 600w',
            media: null,
          },
        ],
      }

      const { container } = render(<PimcoreImage image={imageWithW} />)
      const source = container.querySelector('source')

      expect(source?.getAttribute('srcset')).toBe(
        'https://pimcore.example.com/photo.webp 300w, https://pimcore.example.com/photo@600.webp 600w',
      )
    })

    it('prefixes srcset paths with the backend URL — decimal x descriptor (e.g. 1.5x)', () => {
      // This test documents expected behavior for decimal descriptors.
      // The current regex (\d+[wx]) does NOT match decimals, so this will fail
      // until the regex is updated to (\d+\.?\d*[wx]).
      const imageWithDecimalX: PimcoreImageType = {
        ...mockImage,
        sources: [
          {
            type: 'image/avif',
            srcset: '/photo.avif 1x, /photo@1.5x.avif 1.5x',
            media: null,
          },
        ],
      }

      const { container } = render(<PimcoreImage image={imageWithDecimalX} />)
      const source = container.querySelector('source')

      expect(source?.getAttribute('srcset')).toBe(
        'https://pimcore.example.com/photo.avif 1x, https://pimcore.example.com/photo@1.5x.avif 1.5x',
      )
    })

    it('prefixes srcset paths with the backend URL — decimal w descriptor (e.g. 300.5w)', () => {
      // This test documents expected behavior for decimal descriptors.
      // The current regex (\d+[wx]) does NOT match decimals, so this will fail
      // until the regex is updated to (\d+\.?\d*[wx]).
      const imageWithDecimalW: PimcoreImageType = {
        ...mockImage,
        sources: [
          {
            type: 'image/webp',
            srcset: '/photo.webp 300w, /photo@hd.webp 300.5w',
            media: null,
          },
        ],
      }

      const { container } = render(<PimcoreImage image={imageWithDecimalW} />)
      const source = container.querySelector('source')

      expect(source?.getAttribute('srcset')).toBe(
        'https://pimcore.example.com/photo.webp 300w, https://pimcore.example.com/photo@hd.webp 300.5w',
      )
    })

    it('prefixes all entries in a multi-entry srcset', () => {
      const imageMulti: PimcoreImageType = {
        ...mockImage,
        sources: [
          {
            type: 'image/webp',
            srcset: '/small.webp 480w, /medium.webp 960w, /large.webp 1440w',
            media: null,
          },
        ],
      }

      const { container } = render(<PimcoreImage image={imageMulti} />)
      const source = container.querySelector('source')

      expect(source?.getAttribute('srcset')).toBe(
        'https://pimcore.example.com/small.webp 480w, https://pimcore.example.com/medium.webp 960w, https://pimcore.example.com/large.webp 1440w',
      )
    })
  })
})
