import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import type { RichTextEditable } from '@skeleton-fe/sdk-elastic'

import { RichTextBlock } from '../RichTextBlock'

describe('RichTextBlock', () => {
  it('renders HTML content via dangerouslySetInnerHTML', () => {
    const block: RichTextEditable = {
      type: 'rich-text',
      order: 1,
      content: '<p>Hello <strong>world</strong></p>',
    }

    render(<RichTextBlock block={block} />)

    expect(screen.getByText('world')).toBeInTheDocument()
    const strong = screen.getByText('world')
    expect(strong.tagName).toBe('STRONG')
  })

  it('applies prose classes to the wrapper div', () => {
    const block: RichTextEditable = {
      type: 'rich-text',
      order: 1,
      content: '<p>Content</p>',
    }

    const { container } = render(<RichTextBlock block={block} />)
    const wrapper = container.firstChild as HTMLElement

    expect(wrapper.className).toContain('prose')
  })

  it('renders empty content without errors', () => {
    const block: RichTextEditable = {
      type: 'rich-text',
      order: 1,
      content: '',
    }

    const { container } = render(<RichTextBlock block={block} />)
    expect(container.firstChild).toBeInTheDocument()
  })
})
