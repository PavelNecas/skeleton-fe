import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'

import { Pagination } from '../Pagination'

describe('Pagination', () => {
  it('renders nothing when totalPages is 1', () => {
    const { container } = render(
      <Pagination page={1} totalPages={1} buildUrl={(p) => `?page=${p}`} />,
    )
    expect(container.innerHTML).toBe('')
  })

  it('renders page links for multiple pages', () => {
    const { container } = render(
      <Pagination page={1} totalPages={3} buildUrl={(p) => `?page=${p}`} />,
    )
    const links = container.querySelectorAll('a')
    expect(links.length).toBeGreaterThanOrEqual(3)
  })

  it('marks the current page as active (not a link)', () => {
    const { getByText } = render(
      <Pagination page={2} totalPages={3} buildUrl={(p) => `?page=${p}`} />,
    )
    const currentPage = getByText('2')
    expect(currentPage.tagName).not.toBe('A')
  })

  it('renders previous link when not on first page', () => {
    const { container } = render(
      <Pagination page={2} totalPages={3} buildUrl={(p) => `?page=${p}`} />,
    )
    const prevLink = container.querySelector('a[aria-label="Previous page"]')
    expect(prevLink).not.toBeNull()
    expect(prevLink?.getAttribute('href')).toBe('?page=1')
  })

  it('does not render previous link on first page', () => {
    const { container } = render(
      <Pagination page={1} totalPages={3} buildUrl={(p) => `?page=${p}`} />,
    )
    const prevLink = container.querySelector('a[aria-label="Previous page"]')
    expect(prevLink).toBeNull()
  })

  it('renders next link when not on last page', () => {
    const { container } = render(
      <Pagination page={1} totalPages={3} buildUrl={(p) => `?page=${p}`} />,
    )
    const nextLink = container.querySelector('a[aria-label="Next page"]')
    expect(nextLink).not.toBeNull()
    expect(nextLink?.getAttribute('href')).toBe('?page=2')
  })

  it('does not render next link on last page', () => {
    const { container } = render(
      <Pagination page={3} totalPages={3} buildUrl={(p) => `?page=${p}`} />,
    )
    const nextLink = container.querySelector('a[aria-label="Next page"]')
    expect(nextLink).toBeNull()
  })
})
