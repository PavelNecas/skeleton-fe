import type { ComponentType } from 'react'
import type { TemplateProps } from './types'

type TemplateComponent = ComponentType<TemplateProps>

/**
 * Maps controllerTemplate strings (as set by Pimcore) to lazy dynamic imports
 * of the corresponding template React components.
 *
 * Dynamic imports are used so that each template is only bundled when needed.
 */
const templateMap: Record<string, () => Promise<{ default: TemplateComponent }>> = {
  'CmsModule:Homepage': () => import('@/core/templates/Homepage'),
  'CmsModule:ContentPage': () => import('@/core/templates/ContentPage'),
  'CmsModule:ContentArticles': () => import('@/core/templates/ContentArticles'),
  'CmsModule:ErrorPage404': () => import('@/core/templates/ErrorPage404'),
  'CmsModule:ErrorPage500': () => import('@/core/templates/ErrorPage500'),
}

/**
 * Returns the normalised template name for a given controllerTemplate string,
 * or null if no mapping exists.
 */
export function getTemplateName(controllerTemplate: string): string | null {
  return templateMap[controllerTemplate] ? controllerTemplate : null
}

/**
 * Resolves and returns the template component for a given controllerTemplate string.
 * Returns null when no mapping is registered.
 */
export async function resolveTemplate(
  controllerTemplate: string,
): Promise<TemplateComponent | null> {
  const loader = templateMap[controllerTemplate]
  if (!loader) return null

  const mod = await loader()
  return mod.default
}
