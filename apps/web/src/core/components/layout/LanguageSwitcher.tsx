'use client'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@skeleton-fe/ui'
import Link from 'next/link'

export interface TranslationLink {
  locale: string
  href: string
}

export interface LanguageSwitcherProps {
  currentLocale: string
  links: TranslationLink[]
}

export function LanguageSwitcher({ currentLocale, links }: LanguageSwitcherProps) {
  if (links.length === 0) {
    return (
      <span className="text-sm font-medium uppercase text-muted-foreground">{currentLocale}</span>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-1 text-sm font-medium uppercase hover:text-primary transition-colors focus:outline-none">
        {currentLocale}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {links.map((link) => (
          <DropdownMenuItem key={link.locale} asChild>
            <Link href={link.href} className="cursor-pointer uppercase">
              {link.locale}
            </Link>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
