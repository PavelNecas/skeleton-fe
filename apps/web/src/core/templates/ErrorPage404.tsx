import Link from 'next/link'

import type { TemplateProps } from '@/lib/types'

export default function ErrorPage404({ locale }: TemplateProps) {
  return (
    <section className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <h1 className="text-8xl font-bold text-muted-foreground/50">404</h1>
      <h2 className="mt-4 text-2xl font-semibold">Page not found</h2>
      <p className="mt-2 text-muted-foreground">
        The page you are looking for does not exist or has been moved.
      </p>
      <Link
        href={`/${locale}`}
        className="mt-8 inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
      >
        Go to homepage
      </Link>
    </section>
  )
}
