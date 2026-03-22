import type { TemplateProps } from '@/lib/types'

export default function Homepage({ locale, sitePrefix }: TemplateProps) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold">Homepage</h1>
      <p className="mt-4 text-muted-foreground">
        site: {sitePrefix} · locale: {locale}
      </p>
    </main>
  )
}
