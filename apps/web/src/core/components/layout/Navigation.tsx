'use client'

import Link from 'next/link'
import type { NavigationNode } from '@skeleton-fe/sdk-elastic'
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuTrigger,
  NavigationMenuContent,
  NavigationMenuLink,
  navigationMenuTriggerStyle,
} from '@skeleton-fe/ui'

import { buildNavigationUrl } from '@/lib/url'

export interface NavigationProps {
  nodes: NavigationNode[]
  currentLocale: string
  defaultLocale: string
}

interface NodeItemProps {
  node: NavigationNode
  currentLocale: string
  defaultLocale: string
}

function NodeLink({ node, currentLocale, defaultLocale }: NodeItemProps) {
  const label = node.label ?? node.id
  const href = node.href ? buildNavigationUrl(node.href, currentLocale, defaultLocale) : undefined

  if (!href) {
    return <span className="block px-3 py-2 text-sm text-muted-foreground">{label}</span>
  }

  return (
    <Link href={href} className="block px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground rounded-md transition-colors">
      {label}
    </Link>
  )
}

function ChildList({ children, currentLocale, defaultLocale }: { children: NavigationNode[]; currentLocale: string; defaultLocale: string }) {
  return (
    <ul className="grid gap-1 p-2 w-[200px]">
      {children.map((child) => (
        <li key={child.id}>
          <NavigationMenuLink asChild>
            <NodeLink node={child} currentLocale={currentLocale} defaultLocale={defaultLocale} />
          </NavigationMenuLink>
          {child.children.length > 0 && (
            <ul className="pl-4 border-l border-border ml-3">
              {child.children.map((grandchild) => (
                <li key={grandchild.id}>
                  <NavigationMenuLink asChild>
                    <NodeLink node={grandchild} currentLocale={currentLocale} defaultLocale={defaultLocale} />
                  </NavigationMenuLink>
                </li>
              ))}
            </ul>
          )}
        </li>
      ))}
    </ul>
  )
}

export function Navigation({ nodes, currentLocale, defaultLocale }: NavigationProps) {
  if (nodes.length === 0) {
    return null
  }

  return (
    <NavigationMenu>
      <NavigationMenuList>
        {nodes.map((node) => {
          const label = node.label ?? node.id
          const href = node.href ? buildNavigationUrl(node.href, currentLocale, defaultLocale) : undefined

          if (node.children.length === 0) {
            return (
              <NavigationMenuItem key={node.id}>
                <NavigationMenuLink asChild>
                  {href ? (
                    <Link href={href} className={navigationMenuTriggerStyle()}>
                      {label}
                    </Link>
                  ) : (
                    <span className={navigationMenuTriggerStyle()}>{label}</span>
                  )}
                </NavigationMenuLink>
              </NavigationMenuItem>
            )
          }

          return (
            <NavigationMenuItem key={node.id}>
              <NavigationMenuTrigger>
                {href ? (
                  <Link href={href} className="hover:text-primary">
                    {label}
                  </Link>
                ) : (
                  label
                )}
              </NavigationMenuTrigger>
              <NavigationMenuContent>
                <ChildList
                  children={node.children}
                  currentLocale={currentLocale}
                  defaultLocale={defaultLocale}
                />
              </NavigationMenuContent>
            </NavigationMenuItem>
          )
        })}
      </NavigationMenuList>
    </NavigationMenu>
  )
}
