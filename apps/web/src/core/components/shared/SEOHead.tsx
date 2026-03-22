import type { Metadata } from 'next'

export interface HreflangEntry {
  locale: string
  href: string
}

export interface SEOHeadProps {
  title: string
  description?: string
  hreflangLinks?: HreflangEntry[]
}

/**
 * Generates Next.js Metadata from page SEO data.
 * Use this in page components or layout to export metadata.
 */
export function buildMetadata({ title, description, hreflangLinks = [] }: SEOHeadProps): Metadata {
  const alternates: Metadata['alternates'] = {}

  if (hreflangLinks.length > 0) {
    alternates.languages = Object.fromEntries(
      hreflangLinks.map(({ locale, href }) => [locale, href]),
    )
  }

  return {
    title,
    description: description ?? undefined,
    alternates,
  }
}

/**
 * SEOHead renders hreflang link tags inline as a Server Component fragment.
 * Use in layouts where you need to inject tags without generating full Metadata.
 */
export function SEOHead({ title, description, hreflangLinks = [] }: SEOHeadProps) {
  return (
    <>
      <title>{title}</title>
      {description && <meta name="description" content={description} />}
      {hreflangLinks.map(({ locale, href }) => (
        <link key={locale} rel="alternate" hrefLang={locale} href={href} />
      ))}
    </>
  )
}
