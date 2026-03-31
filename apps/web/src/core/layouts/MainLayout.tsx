import { headers } from 'next/headers'
import type { Navigation } from '@skeleton-fe/sdk-elastic'

import type { HeaderProps } from '@/core/components/layout/Header'
import type { FooterProps, FooterLink } from '@/core/components/layout/Footer'
import type { TranslationLink } from '@/core/components/layout/LanguageSwitcher'
import { resolveSiteComponent } from '@/lib/component-resolver'
import { MAIN_NAVIGATION, FOOTER_NAVIGATION, getNavigationNodes } from '@/lib/navigation'
import { buildNavigationUrl } from '@/lib/url'

export interface MainLayoutProps {
  children: React.ReactNode
  siteName: string
  sitePrefix: string
  navigations: Record<string, Navigation>
  currentLocale: string
  translationLinks: TranslationLink[]
  theme?: string
}

export async function MainLayout({
  children,
  siteName,
  sitePrefix,
  navigations,
  currentLocale,
  translationLinks,
}: MainLayoutProps) {
  const [Header, Footer, headersList] = await Promise.all([
    resolveSiteComponent<HeaderProps>('layout/Header', sitePrefix),
    resolveSiteComponent<FooterProps>('layout/Footer', sitePrefix),
    headers(),
  ])

  const defaultLocale = headersList.get('x-default-locale') ?? currentLocale
  const headerNodes = getNavigationNodes(navigations, MAIN_NAVIGATION)
  const footerNodes = getNavigationNodes(navigations, FOOTER_NAVIGATION)

  const footerLinks: FooterLink[] = footerNodes
    .filter((n) => n.href && n.label)
    .map((n) => ({
      label: n.label!,
      href: buildNavigationUrl(n.href!, currentLocale, defaultLocale),
    }))

  return (
    <div className="flex min-h-screen flex-col">
      {Header && (
        <Header
          siteName={siteName}
          navigationNodes={headerNodes}
          currentLocale={currentLocale}
          defaultLocale={defaultLocale}
          translationLinks={translationLinks}
        />
      )}
      <main className="flex-1">{children}</main>
      {Footer && <Footer siteName={siteName} links={footerLinks} />}
    </div>
  )
}
