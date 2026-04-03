import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import type { ContentBlock, Editable } from '@skeleton-fe/sdk-elastic'

vi.mock('next/link', () => ({
  default: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}))

import { BlockRenderer } from '../BlockRenderer'

describe('BlockRenderer', () => {
  it('renders nothing for empty blocks array', () => {
    const { container } = render(<BlockRenderer blocks={[]} />)
    expect(container.firstChild).toBeNull()
  })

  it('sorts blocks by order before rendering', () => {
    const blocks: Editable[] = [
      { type: 'rich-text', order: 3, content: '<p>Third</p>' },
      { type: 'rich-text', order: 1, content: '<p>First</p>' },
      { type: 'rich-text', order: 2, content: '<p>Second</p>' },
    ]

    const { container } = render(<BlockRenderer blocks={blocks} />)
    const divs = container.querySelectorAll('div')

    // The inner text order should match sorted order
    expect(divs[0]!.innerHTML).toContain('First')
    expect(divs[1]!.innerHTML).toContain('Second')
    expect(divs[2]!.innerHTML).toContain('Third')
  })

  it('renders a rich-text block', () => {
    const blocks: Editable[] = [{ type: 'rich-text', order: 1, content: '<p>Hello</p>' }]

    render(<BlockRenderer blocks={blocks} />)
    expect(screen.getByText('Hello')).toBeInTheDocument()
  })

  it('renders a highlight block', () => {
    const blocks: ContentBlock[] = [
      {
        type: 'highlight',
        order: 1,
        items: [{ title: 'Highlight title', text: 'Some text', image: null }],
      },
    ]

    render(<BlockRenderer blocks={blocks} />)
    expect(screen.getByText('Highlight title')).toBeInTheDocument()
  })

  it('renders a crossroad-block', () => {
    const blocks: ContentBlock[] = [
      {
        type: 'crossroad-block',
        order: 1,
        items: [
          {
            title: 'Crossroad title',
            text: '',
            reverseContent: false,
            linkHref: null,
            linkText: null,
            image: null,
          },
        ],
      },
    ]

    render(<BlockRenderer blocks={blocks} />)
    expect(screen.getByText('Crossroad title')).toBeInTheDocument()
  })

  it('renders an image block', () => {
    const blocks: ContentBlock[] = [{ type: 'image', order: 1, image: { src: '/images/99/thumb.jpg', alt: 'Test', sources: [], width: 1200, height: 630 } }]

    const { container } = render(<BlockRenderer blocks={blocks} />)
    const picture = container.querySelector('picture')

    expect(picture).toBeInTheDocument()
  })

  it('handles unknown block types gracefully', () => {
    // Simulate an unknown type by casting
    const blocks = [{ type: 'unknown-type', order: 1 }] as unknown as (Editable | ContentBlock)[]

    expect(() => render(<BlockRenderer blocks={blocks} />)).not.toThrow()
  })
})
