import type { Metadata } from 'next'

import './globals.css'

export const metadata: Metadata = {
  title: 'Skeleton FE',
  description: 'Frontend e-commerce skeleton',
}

interface RootLayoutProps {
  children: React.ReactNode
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
