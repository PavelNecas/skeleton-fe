import type { Article } from '@skeleton-fe/sdk-elastic'

import { BlockRenderer } from '@/core/components/content/BlockRenderer'
import { Breadcrumbs, buildBreadcrumbsFromPath } from '@/core/components/shared/Breadcrumbs'
import type { TemplateProps } from '@/lib/types'

export default function ContentArticles({ data }: TemplateProps) {
  const article = data as Article

  const breadcrumbs = buildBreadcrumbsFromPath(article.path)
  const publicationDate = new Date(article.creationDate * 1000)

  return (
    <article className="min-h-screen">
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <nav aria-label="Breadcrumb" className="mb-6">
          <Breadcrumbs items={breadcrumbs} />
        </nav>

        <header className="mb-8">
          {article.name && (
            <h1 className="text-3xl font-bold tracking-tight">{article.name}</h1>
          )}
          <p className="mt-2 text-sm text-muted-foreground">
            <time dateTime={publicationDate.toISOString()}>
              {publicationDate.toLocaleDateString()}
            </time>
          </p>
          {article.perex && (
            <p className="mt-4 text-lg text-muted-foreground">{article.perex}</p>
          )}
        </header>

        {article.description && (
          <div
            className="prose max-w-none"
            dangerouslySetInnerHTML={{ __html: article.description }}
          />
        )}

        {article.contentBlocks.length > 0 && (
          <div className="mt-8">
            <BlockRenderer blocks={article.contentBlocks} />
          </div>
        )}
      </div>
    </article>
  )
}
