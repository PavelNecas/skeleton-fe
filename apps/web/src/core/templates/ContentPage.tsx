import type { Page } from '@skeleton-fe/sdk-elastic'

import { BlockRenderer } from '@/core/components/content/BlockRenderer'
import { Breadcrumbs, buildBreadcrumbsFromPath } from '@/core/components/shared/Breadcrumbs'
import type { TemplateProps } from '@/lib/types'

export default function ContentPage({ data }: TemplateProps) {
  const page = data as Page

  const breadcrumbs = buildBreadcrumbsFromPath(page.path)

  return (
    <section className="min-h-screen">
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <nav aria-label="Breadcrumb" className="mb-6">
          <Breadcrumbs items={breadcrumbs} />
        </nav>
        <h1 className="text-3xl font-bold tracking-tight">{page.title}</h1>
        {page.editables.length > 0 && (
          <div className="mt-8">
            <BlockRenderer blocks={page.editables} />
          </div>
        )}
      </div>
    </section>
  )
}
