import type { TemplateProps } from '@/lib/types'

export default function ErrorPage500({ locale }: TemplateProps) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-6xl font-bold">500</h1>
      <p className="mt-4 text-muted-foreground">Server error · locale: {locale}</p>
    </main>
  )
}
