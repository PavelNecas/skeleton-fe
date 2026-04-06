interface PaginationProps {
  page: number
  totalPages: number
  buildUrl: (page: number) => string
}

export function Pagination({ page, totalPages, buildUrl }: PaginationProps) {
  if (totalPages <= 1) {
    return null
  }

  const pages = generatePageNumbers(page, totalPages)

  return (
    <nav aria-label="Pagination" className="flex items-center justify-center gap-1">
      {page > 1 && (
        <a
          href={buildUrl(page - 1)}
          aria-label="Previous page"
          className="rounded-md px-3 py-2 text-sm text-gray-600 hover:bg-gray-100"
        >
          &laquo;
        </a>
      )}

      {pages.map((p, i) =>
        p === null ? (
          <span key={`ellipsis-${i}`} className="px-2 py-2 text-sm text-gray-400">
            &hellip;
          </span>
        ) : p === page ? (
          <span
            key={p}
            aria-current="page"
            className="rounded-md bg-gray-900 px-3 py-2 text-sm font-medium text-white"
          >
            {p}
          </span>
        ) : (
          <a
            key={p}
            href={buildUrl(p)}
            className="rounded-md px-3 py-2 text-sm text-gray-600 hover:bg-gray-100"
          >
            {p}
          </a>
        ),
      )}

      {page < totalPages && (
        <a
          href={buildUrl(page + 1)}
          aria-label="Next page"
          className="rounded-md px-3 py-2 text-sm text-gray-600 hover:bg-gray-100"
        >
          &raquo;
        </a>
      )}
    </nav>
  )
}

function generatePageNumbers(current: number, total: number): (number | null)[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1)
  }

  const pages: (number | null)[] = [1]

  if (current > 3) {
    pages.push(null)
  }

  const start = Math.max(2, current - 1)
  const end = Math.min(total - 1, current + 1)

  for (let i = start; i <= end; i++) {
    pages.push(i)
  }

  if (current < total - 2) {
    pages.push(null)
  }

  pages.push(total)

  return pages
}
