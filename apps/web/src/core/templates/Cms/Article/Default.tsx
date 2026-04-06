import type { Article } from '@skeleton-fe/sdk-elastic'

import { BlockRenderer } from '@/core/components/content/BlockRenderer'
import { Breadcrumbs, buildBreadcrumbsFromPath } from '@/core/components/shared/Breadcrumbs'
import type { TemplateProps } from '@/lib/types'

export default function ContentArticle({ data, locale }: TemplateProps) {
  const article = data as Article

  const breadcrumbs = buildBreadcrumbsFromPath(article.path)

  const timestamp = (article.publishedDate || 0) * 1000
  const date = new Date(timestamp)
  const isValidDate = timestamp > 0 && !isNaN(date.getTime())
  const formattedDate = isValidDate
    ? new Intl.DateTimeFormat(locale, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }).format(date)
    : null

  return (
    <section className="min-h-screen">
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <nav aria-label="Breadcrumb" className="mb-6">
          <Breadcrumbs items={breadcrumbs} />
        </nav>

        {article.categories.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-2">
            {article.categories.map((cat) => (
              <span
                key={cat.id}
                className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700"
              >
                {cat.name}
              </span>
            ))}
          </div>
        )}

        <h1 className="text-3xl font-bold tracking-tight">{article.name}</h1>

        {formattedDate && (
          <time dateTime={date.toISOString()} className="mt-2 block text-sm text-gray-500">
            {formattedDate}
          </time>
        )}

        {article.perex && <p className="mt-4 text-lg text-gray-600">{article.perex}</p>}

        {article.contentBlocks.length > 0 && (
          <div className="mt-8">
            <BlockRenderer blocks={article.contentBlocks} />
          </div>
        )}
      </div>
    </section>
  )
}
