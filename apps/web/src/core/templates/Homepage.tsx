import type { Page } from '@skeleton-fe/sdk-elastic'

import { BlockRenderer } from '@/core/components/content/BlockRenderer'
import type { TemplateProps } from '@/lib/types'

export default function Homepage({ data }: TemplateProps) {
  const page = data as Page

  return (
    <section className="min-h-screen">
      <div className="container mx-auto max-w-5xl px-4 py-12">
        <h1 className="text-4xl font-bold tracking-tight">{page.title}</h1>
        {page.editables.length > 0 && (
          <div className="mt-8">
            <BlockRenderer blocks={page.editables} />
          </div>
        )}
      </div>
    </section>
  )
}
