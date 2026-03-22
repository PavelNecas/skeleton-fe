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

  const theme = sitePrefix ? (await loadSiteConfig(sitePrefix)).theme ?? 'default' : 'default'

  return (
    <html lang="en" data-theme={theme}>
      <body>{children}</body>
    </html>
  )
}
