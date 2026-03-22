import Link from 'next/link'

import type { NavigationNode } from '@skeleton-fe/sdk-elastic'

export interface NavigationProps {
  nodes: NavigationNode[]
}

interface NavigationNodeItemProps {
  node: NavigationNode
}

function NavigationNodeItem({ node }: NavigationNodeItemProps) {
  const label = node.label ?? node.id

  return (
    <li>
      {node.href ? (
        <Link href={node.href} className="block px-3 py-2 text-sm hover:text-primary transition-colors">
          {label}
        </Link>
      ) : (
        <span className="block px-3 py-2 text-sm text-muted-foreground">{label}</span>
      )}
      {node.children.length > 0 && (
        <ul className="pl-4">
          {node.children.map((child) => (
            <NavigationNodeItem key={child.id} node={child} />
          ))}
        </ul>
      )}
    </li>
  )
}

export function Navigation({ nodes }: NavigationProps) {
  if (nodes.length === 0) {
    return null
  }

  return (
    <nav aria-label="Main navigation">
      <ul className="flex items-center gap-1">
        {nodes.map((node) => (
          <NavigationNodeItem key={node.id} node={node} />
        ))}
      </ul>
    </nav>
  )
}
