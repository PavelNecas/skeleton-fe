import type { TemplateProps } from '@/lib/types'

export default function ContentArticles({ locale, sitePrefix, route }: TemplateProps) {
  return (
    <main className="flex min-h-screen flex-col p-24">
      <h1 className="text-4xl font-bold">Articles</h1>
      <p className="mt-4 text-muted-foreground">
        site: {sitePrefix} · locale: {locale} · sourceId: {route.sourceId}
      </p>
    </main>
  )
}
