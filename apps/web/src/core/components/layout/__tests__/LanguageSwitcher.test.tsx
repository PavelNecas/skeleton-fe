import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'

// Mock @skeleton-fe/ui DropdownMenu components
vi.mock('@skeleton-fe/ui', () => ({
  DropdownMenu: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DropdownMenuTrigger: ({ children }: { children: React.ReactNode }) => <button>{children}</button>,
  DropdownMenuContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DropdownMenuItem: ({ children, asChild }: { children: React.ReactNode; asChild?: boolean }) =>
    asChild ? <>{children}</> : <div>{children}</div>,
}))

vi.mock('next/link', () => ({
  default: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}))

import { LanguageSwitcher } from '../LanguageSwitcher'

describe('LanguageSwitcher', () => {
  it('renders current locale as trigger text', () => {
    render(<LanguageSwitcher currentLocale="en" links={[{ locale: 'cs', href: '/cs' }]} />)

    expect(screen.getByText('en')).toBeInTheDocument()
  })

  it('renders translation links', () => {
    render(
      <LanguageSwitcher
        currentLocale="en"
        links={[
          { locale: 'cs', href: '/cs' },
          { locale: 'de', href: '/de' },
        ]}
      />,
    )

    expect(screen.getByText('cs')).toBeInTheDocument()
    expect(screen.getByText('de')).toBeInTheDocument()
  })

  it('renders correct hrefs for translation links', () => {
    render(<LanguageSwitcher currentLocale="en" links={[{ locale: 'cs', href: '/cs/home' }]} />)

    const link = screen.getByText('cs').closest('a')
    expect(link).toHaveAttribute('href', '/cs/home')
  })

  it('renders a static span when no links are provided', () => {
    render(<LanguageSwitcher currentLocale="en" links={[]} />)

    const span = screen.getByText('en')
    expect(span.tagName).toBe('SPAN')
  })
})
