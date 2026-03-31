import Link from 'next/link'
import type { NavigationNode } from '@skeleton-fe/sdk-elastic'

import { Navigation } from '@/core/components/layout'
import { LanguageSwitcher, type TranslationLink } from '@/core/components/layout'

/**
 * Example site override for the Header component.
 * Demonstrates how a site can replace core components with custom versions.
 */
export interface ExampleHeaderProps {
  siteName: string
  navigationNodes: NavigationNode[]
  currentLocale: string
  defaultLocale: string
  translationLinks: TranslationLink[]
}

export default function ExampleHeader({
  siteName,
  navigationNodes,
  currentLocale,
  defaultLocale,
  translationLinks,
}: ExampleHeaderProps) {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-primary text-primary-foreground">
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="text-lg font-bold hover:opacity-80 transition-opacity">
            {siteName}
          </Link>
          <Navigation nodes={navigationNodes} currentLocale={currentLocale} defaultLocale={defaultLocale} />
        </div>
        <LanguageSwitcher currentLocale={currentLocale} links={translationLinks} />
      </div>
    </header>
  )
}
