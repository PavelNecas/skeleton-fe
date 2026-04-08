import type { Article } from '@skeleton-fe/sdk-elastic'

import { PimcoreImage } from '@/core/components/PimcoreImage'

interface ArticleCardProps {
  article: Article
  locale: string
}

export function ArticleCard({ article, locale }: ArticleCardProps) {
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

  const text = article.description

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md">
      <a href={article.path} className="flex flex-1 flex-col">
        <div className="aspect-[3/2] w-full bg-gray-100">
          {article.images?.articleCard && (
            <PimcoreImage
              image={article.images.articleCard}
              className="h-full w-full object-cover"
            />
          )}
        </div>
        <div className="flex flex-1 flex-col p-4">
          {formattedDate && (
            <time dateTime={date.toISOString()} className="text-sm text-gray-500">
              {formattedDate}
            </time>
          )}
          {article.name && (
            <h2 className="mt-1 text-lg font-semibold leading-tight text-gray-900 line-clamp-2">
              {article.name}
            </h2>
          )}
          {text && <p className="mt-2 flex-1 text-sm text-gray-600 line-clamp-3">{text}</p>}
        </div>
      </a>
    </article>
  )
}
