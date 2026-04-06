import type { ArticleCategory } from '@skeleton-fe/sdk-elastic'

interface CategoryFilterProps {
  categories: ArticleCategory[]
  activeCategoryId: string | undefined
  basePath: string
}

export function CategoryFilter({ categories, activeCategoryId, basePath }: CategoryFilterProps) {
  if (categories.length === 0) {
    return null
  }

  const activeClass = 'rounded-full bg-gray-900 px-4 py-2 text-sm font-medium text-white'
  const inactiveClass =
    'rounded-full border border-gray-300 px-4 py-2 text-sm text-gray-600 hover:bg-gray-100'

  return (
    <nav aria-label="Category filter" className="flex flex-wrap gap-2">
      <a href={basePath} className={activeCategoryId === undefined ? activeClass : inactiveClass}>
        Vše
      </a>
      {categories.map((cat) => (
        <a
          key={cat.id}
          href={`${basePath}?category=${cat.id}`}
          className={activeCategoryId === cat.id ? activeClass : inactiveClass}
        >
          {cat.name}
        </a>
      ))}
    </nav>
  )
}
