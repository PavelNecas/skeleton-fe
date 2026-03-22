import type { ComponentType } from 'react'

import type { TemplateProps } from '@/lib/types'

import ContentArticles from './ContentArticles'
import ContentPage from './ContentPage'
import ErrorPage404 from './ErrorPage404'
import ErrorPage500 from './ErrorPage500'
import Homepage from './Homepage'

export { Homepage, ContentPage, ContentArticles, ErrorPage404, ErrorPage500 }

/**
 * Maps controllerTemplate values (from the ES routes index) to template
 * components. Site overrides in sites/{site}/templates/ take precedence
 * over these core templates via the component resolver.
 */
export const templateMap: Record<string, ComponentType<TemplateProps>> = {
  'CmsModule:Homepage': Homepage,
  'CmsModule:ContentPage': ContentPage,
  'CmsModule:ContentArticles': ContentArticles,
  'CmsModule:ErrorPage404': ErrorPage404,
  'CmsModule:ErrorPage500': ErrorPage500,
}
