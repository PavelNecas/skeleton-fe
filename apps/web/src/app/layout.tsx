import type { Metadata } from 'next'
import { headers } from 'next/headers'

import { loadSiteConfig } from '@/lib/site-config'

import './globals.css'

export const metadata: Metadata = {
  title: 'Skeleton FE',
  description: 'Frontend e-commerce skeleton',
}

interface RootLayoutProps {
  children: React.ReactNode
}

export default async function RootLayout({ children }: RootLayoutProps) {
  // Read site prefix set by middleware to determine which theme to apply
  const headersList = await headers()
  const sitePrefix = headersList.get('x-site-prefix')

  let theme = 'default'
  if (sitePrefix) {
    const siteConfig = await loadSiteConfig(sitePrefix)
    theme = siteConfig.theme ?? 'default'
  }

  return (
    <html lang="en" data-theme={theme}>
      <body>{children}</body>
    </html>
  )
}
