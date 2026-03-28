import type { NavigationNode } from '@skeleton-fe/sdk-elastic'

import { Footer, Header } from '@/core/components/layout'
import type { TranslationLink } from '@/core/components/layout'

export interface MainLayoutProps {
  children: React.ReactNode
  siteName: string
  navigationNodes: NavigationNode[]
  currentLocale: string
  defaultLocale: string
  translationLinks: TranslationLink[]
  theme?: string
}

export function MainLayout({
  children,
  siteName,
  navigationNodes,
  currentLocale,
  defaultLocale,
  translationLinks,
}: MainLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header
        siteName={siteName}
        navigationNodes={navigationNodes}
        currentLocale={currentLocale}
        defaultLocale={defaultLocale}
        translationLinks={translationLinks}
      />
      <main className="flex-1">{children}</main>
      <Footer siteName={siteName} />
    </div>
  )
}
