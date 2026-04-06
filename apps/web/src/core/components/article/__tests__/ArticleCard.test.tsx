import { describe, it, expect, vi } from 'vitest'
import { render } from '@testing-library/react'
import type { Article } from '@skeleton-fe/sdk-elastic'

import { ArticleCard } from '../ArticleCard'

vi.mock('@/core/components/PimcoreImage', () => ({
  PimcoreImage: ({ image }: { image: { alt: string } }) => (
    <img alt={image.alt} data-testid="pimcore-image" />
  ),
}))

const baseArticle: Article = {
  id: '1',
  name: 'Test Article',
  metaDescription: null,
  description: null,
  perex: 'This is a test perex',
  summary: null,
  locale: 'cs',
  published: true,
  path: '/Cms/Articles/test-article',
  slug: '/test-article',
  frontendTemplate: null,
  modificationDate: 1700000000,
  creationDate: 1700000000,
  publishedDate: 1700000000,
  properties: [],
  contentBlocks: [],
  categories: [{ id: '10', name: 'Tech' }],
  authors: [],
  images: {
    articleCard: {
      src: '/img/test.jpg',
      alt: 'Test',
      title: '',
      sources: [],
      width: 600,
      height: 400,
      copyright: '',
    },
    openGraph: null,
    socialSquare: null,
  },
}

describe('ArticleCard', () => {
  it('renders article title', () => {
    const { getByText } = render(<ArticleCard article={baseArticle} locale="cs" />)
    expect(getByText('Test Article')).not.toBeNull()
  })

  it('renders description', () => {
    const article = { ...baseArticle, description: 'Test description' }
    const { getByText } = render(<ArticleCard article={article} locale="cs" />)
    expect(getByText('Test description')).not.toBeNull()
  })

  it('renders article card image when available', () => {
    const { container } = render(<ArticleCard article={baseArticle} locale="cs" />)
    expect(container.querySelector('[data-testid="pimcore-image"]')).not.toBeNull()
  })

  it('does not render image when articleCard is null', () => {
    const article = {
      ...baseArticle,
      images: { articleCard: null, openGraph: null, socialSquare: null },
    }
    const { container } = render(<ArticleCard article={article} locale="cs" />)
    expect(container.querySelector('[data-testid="pimcore-image"]')).toBeNull()
  })

  it('links to the article slug', () => {
    const { container } = render(<ArticleCard article={baseArticle} locale="cs" />)
    const link = container.querySelector('a')
    expect(link?.getAttribute('href')).toBe('/test-article')
  })

  it('renders formatted date', () => {
    const { container } = render(<ArticleCard article={baseArticle} locale="cs" />)
    // publishedDate 1700000000 = 2023-11-14 in UTC
    expect(container.textContent).toContain('2023')
  })
})
