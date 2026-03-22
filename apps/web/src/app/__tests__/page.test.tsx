import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'

import HomePage from '../page'

describe('HomePage', () => {
  it('renders the homepage heading', () => {
    render(<HomePage />)
    expect(screen.getByRole('heading', { name: /skeleton fe/i })).toBeInTheDocument()
  })
})
