import Link from 'next/link'
import type { NavigationNode } from '@skeleton-fe/sdk-elastic'

import { Navigation } from './Navigation'
import { LanguageSwitcher, type TranslationLink } from './LanguageSwitcher'

export interface HeaderProps {
  siteName: string
  navigationNodes: NavigationNode[]
  currentLocale: string
  defaultLocale?: string
  translationLinks: TranslationLink[]
}

export function Header({
  siteName,
  navigationNodes,
  currentLocale,
  defaultLocale = 'cs',
  translationLinks,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background">
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="text-lg font-semibold hover:text-primary transition-colors">
            {siteName}
          </Link>
          <Navigation
            nodes={navigationNodes}
            currentLocale={currentLocale}
            defaultLocale={defaultLocale}
          />
        </div>
        <LanguageSwitcher currentLocale={currentLocale} links={translationLinks} />
      </div>
    </header>
  )
}
