import Link from 'next/link'
import type { NavigationNode } from '@skeleton-fe/sdk-elastic'

import { buildNavigationUrl } from '@/lib/url'

export interface NavigationProps {
  nodes: NavigationNode[]
  currentLocale: string
  defaultLocale: string
}

interface NavigationNodeItemProps {
  node: NavigationNode
  currentLocale: string
  defaultLocale: string
}

function NavigationNodeItem({ node, currentLocale, defaultLocale }: NavigationNodeItemProps) {
  const label = node.label ?? node.id

  const href = node.href ? buildNavigationUrl(node.href, currentLocale, defaultLocale) : undefined

  return (
    <li>
      {href ? (
        <Link href={href} className="block px-3 py-2 text-sm hover:text-primary transition-colors">
          {label}
        </Link>
      ) : (
        <span className="block px-3 py-2 text-sm text-muted-foreground">{label}</span>
      )}
      {node.children.length > 0 && (
        <ul className="pl-4">
          {node.children.map((child) => (
            <NavigationNodeItem
              key={child.id}
              node={child}
              currentLocale={currentLocale}
              defaultLocale={defaultLocale}
            />
          ))}
        </ul>
      )}
    </li>
  )
}

export function Navigation({ nodes, currentLocale, defaultLocale }: NavigationProps) {
  if (nodes.length === 0) {
    return null
  }

  return (
    <nav aria-label="Main navigation">
      <ul className="flex items-center gap-1">
        {nodes.map((node) => (
          <NavigationNodeItem
            key={node.id}
            node={node}
            currentLocale={currentLocale}
            defaultLocale={defaultLocale}
          />
        ))}
      </ul>
    </nav>
  )
}
