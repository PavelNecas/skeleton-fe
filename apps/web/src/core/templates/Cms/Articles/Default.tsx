import type { Page } from '@skeleton-fe/sdk-elastic'

import { ArticleCard } from '@/core/components/article/ArticleCard'
import { CategoryFilter } from '@/core/components/article/CategoryFilter'
import { BlockRenderer } from '@/core/components/content/BlockRenderer'
import { Breadcrumbs, buildBreadcrumbsFromPath } from '@/core/components/shared/Breadcrumbs'
import { Pagination } from '@/core/components/shared/Pagination'
import { fetchArticleCategories, fetchArticleListing } from '@/lib/data-fetching'
import type { TemplateProps } from '@/lib/types'

export default async function ContentArticles({
  data,
  locale,
  sitePrefix,
  searchParams,
  pathname,
}: TemplateProps) {
  const page = data as Page
  const breadcrumbs = buildBreadcrumbsFromPath(page.path)

  const currentPage = Math.max(1, Math.floor(Number(searchParams?.page) || 1))
  const categoryId = typeof searchParams?.category === 'string' ? searchParams.category : undefined

  const [listing, categories] = await Promise.all([
    fetchArticleListing(sitePrefix, locale, { page: currentPage, categoryId }),
    fetchArticleCategories(sitePrefix, locale),
  ])

  const basePath = pathname ?? '/'

  function buildPaginationUrl(p: number): string {
    const params = new URLSearchParams()
    if (p > 1) params.set('page', String(p))
    if (categoryId) params.set('category', categoryId)
    const qs = params.toString()
    return qs ? `${basePath}?${qs}` : basePath
  }

  return (
    <section className="min-h-screen">
      <div className="container mx-auto max-w-6xl px-4 py-8">
        <nav aria-label="Breadcrumb" className="mb-6">
          <Breadcrumbs items={breadcrumbs} />
        </nav>

        <h1 className="text-3xl font-bold tracking-tight">{page.title}</h1>

        {page.editables.length > 0 && (
          <div className="mt-8">
            <BlockRenderer blocks={page.editables} />
          </div>
        )}

        {categories.length > 0 && (
          <div className="mt-8">
            <CategoryFilter
              categories={categories}
              activeCategoryId={categoryId}
              basePath={basePath}
            />
          </div>
        )}

        {listing.items.length > 0 ? (
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {listing.items.map((article) => (
              <ArticleCard key={article.id} article={article} locale={locale} />
            ))}
          </div>
        ) : (
          <p className="mt-8 text-gray-500">Žádné články k zobrazení.</p>
        )}

        <div className="mt-8">
          <Pagination
            page={listing.page}
            totalPages={listing.totalPages}
            buildUrl={buildPaginationUrl}
          />
        </div>
      </div>
    </section>
  )
}
