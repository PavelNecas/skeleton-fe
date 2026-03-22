import Link from 'next/link'

import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@skeleton-fe/ui'

export interface BreadcrumbEntry {
  label: string
  href?: string
}

export interface BreadcrumbsProps {
  items: BreadcrumbEntry[]
}

/**
 * Builds breadcrumb entries from a URL path.
 * e.g. /en/products/shoes -> [Home, Products, Shoes]
 */
export function buildBreadcrumbsFromPath(path: string, homeLabel = 'Home'): BreadcrumbEntry[] {
  const segments = path.split('/').filter(Boolean)
  const entries: BreadcrumbEntry[] = [{ label: homeLabel, href: '/' }]

  segments.forEach((segment, index) => {
    const href = '/' + segments.slice(0, index + 1).join('/')
    const label = segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ')
    entries.push({ label, href })
  })

  return entries
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  if (items.length === 0) {
    return null
  }

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {items.map((item, index) => {
          const isLast = index === items.length - 1

          return (
            <BreadcrumbItem key={index}>
              {isLast ? (
                <BreadcrumbPage>{item.label}</BreadcrumbPage>
              ) : (
                <>
                  <BreadcrumbLink asChild>
                    <Link href={item.href ?? '/'}>{item.label}</Link>
                  </BreadcrumbLink>
                  <BreadcrumbSeparator />
                </>
              )}
            </BreadcrumbItem>
          )
        })}
      </BreadcrumbList>
    </Breadcrumb>
  )
}

export { BreadcrumbEllipsis }
