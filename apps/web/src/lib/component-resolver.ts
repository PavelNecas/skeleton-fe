import type { ComponentType } from 'react'

import type { TemplateProps } from './types'

type TemplateComponent = ComponentType<TemplateProps>

/**
 * Resolves the template component for the given controllerTemplate and sitePrefix.
 *
 * Resolution order:
 * 1. Try site-specific override: `@/sites/{sitePrefix}/templates/{ComponentName}`
 * 2. Fall back to core template: `@/core/templates/{ComponentName}`
 * 3. Return null if neither exists.
 *
 * The ComponentName is derived from the last segment of controllerTemplate,
 * e.g. "CmsModule:ContentPage" → "ContentPage".
 */
export async function resolveComponent(
  controllerTemplate: string,
  sitePrefix: string,
): Promise<TemplateComponent | null> {
  const segments = controllerTemplate.split(':')
  // Pimcore format: "Cms:Homepage:default" → take the action segment (middle)
  // Legacy format: "CmsModule:Homepage" → take the last segment
  const componentName = segments.length >= 3 ? segments[1] : segments.pop()
  if (!componentName) return null

  // 1. Try site override
  try {
    const mod = (await import(`@/sites/${sitePrefix}/templates/${componentName}`)) as {
      default: TemplateComponent
    }
    return mod.default
  } catch {
    // Site override does not exist — fall through
  }

  // 2. Try core template
  try {
    const mod = (await import(`@/core/templates/${componentName}`)) as {
      default: TemplateComponent
    }
    return mod.default
  } catch {
    // Core template does not exist either
  }

  return null
}

/**
 * Resolves a layout component for the given layoutName and sitePrefix.
 *
 * Resolution order:
 * 1. Try site-specific override: `@/sites/{sitePrefix}/layouts/{layoutName}`
 * 2. Fall back to core layout: `@/core/layouts/{layoutName}`
 * 3. Return null if neither exists.
 */
export async function resolveLayoutComponent<T>(
  layoutName: string,
  sitePrefix: string,
): Promise<ComponentType<T> | null> {
  // 1. Try site override
  try {
    const mod = (await import(`@/sites/${sitePrefix}/layouts/${layoutName}`)) as {
      default: ComponentType<T>
    }
    return mod.default
  } catch {
    // Site override does not exist — fall through
  }

  // 2. Try core layout
  try {
    const mod = (await import(`@/core/layouts/${layoutName}`)) as {
      default: ComponentType<T>
    }
    return mod.default
  } catch {
    // Core layout does not exist either
  }

  return null
}

/**
 * Resolves a generic site component by component path (e.g. "layout/Header").
 *
 * Resolution order:
 * 1. Try site-specific override: `@/sites/{sitePrefix}/components/{componentPath}`
 * 2. Fall back to core component: `@/core/components/{componentPath}`
 * 3. Return null if neither exists.
 */
export async function resolveSiteComponent<T>(
  componentPath: string,
  sitePrefix: string,
): Promise<ComponentType<T> | null> {
  // 1. Try site override
  try {
    const mod = (await import(`@/sites/${sitePrefix}/components/${componentPath}`)) as {
      default: ComponentType<T>
    }
    return mod.default
  } catch {
    // Site override does not exist — fall through
  }

  // 2. Try core component
  try {
    const mod = (await import(`@/core/components/${componentPath}`)) as {
      default: ComponentType<T>
    }
    return mod.default
  } catch {
    // Core component does not exist either
  }

  return null
}
