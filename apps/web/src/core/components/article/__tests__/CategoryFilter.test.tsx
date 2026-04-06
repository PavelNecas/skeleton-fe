import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'

import { CategoryFilter } from '../CategoryFilter'

const categories = [
  { id: '10', name: 'Tech' },
  { id: '20', name: 'Sport' },
]

describe('CategoryFilter', () => {
  it('renders all categories plus a reset link', () => {
    const { container } = render(
      <CategoryFilter categories={categories} activeCategoryId={undefined} basePath="/articles" />,
    )
    const links = container.querySelectorAll('a')
    expect(links).toHaveLength(3) // "Vše" + 2 categories
  })

  it('highlights the active category', () => {
    const { getByText } = render(
      <CategoryFilter categories={categories} activeCategoryId="10" basePath="/articles" />,
    )
    const techLink = getByText('Tech')
    expect(techLink.className).toContain('bg-gray-900')
  })

  it('highlights "Vše" when no category is active', () => {
    const { getByText } = render(
      <CategoryFilter categories={categories} activeCategoryId={undefined} basePath="/articles" />,
    )
    const allLink = getByText('Vše')
    expect(allLink.className).toContain('bg-gray-900')
  })

  it('links categories with ?category={id}', () => {
    const { getByText } = render(
      <CategoryFilter categories={categories} activeCategoryId={undefined} basePath="/articles" />,
    )
    const techLink = getByText('Tech')
    expect(techLink.getAttribute('href')).toBe('/articles?category=10')
  })

  it('"Vše" links to the base path without query', () => {
    const { getByText } = render(
      <CategoryFilter categories={categories} activeCategoryId="10" basePath="/articles" />,
    )
    const allLink = getByText('Vše')
    expect(allLink.getAttribute('href')).toBe('/articles')
  })

  it('renders nothing when categories is empty', () => {
    const { container } = render(
      <CategoryFilter categories={[]} activeCategoryId={undefined} basePath="/articles" />,
    )
    expect(container.innerHTML).toBe('')
  })
})
