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
  const componentName = controllerTemplate.split(':').pop()
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
