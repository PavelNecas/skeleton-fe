import { describe, it, expect, vi } from 'vitest'

import { getTemplateName, resolveTemplate } from '../template-registry'

// Mock all template imports
vi.mock('@/core/templates/Homepage', () => ({ default: () => null }))
vi.mock('@/core/templates/ContentPage', () => ({ default: () => null }))
vi.mock('@/core/templates/ContentArticles', () => ({ default: () => null }))
vi.mock('@/core/templates/ErrorPage404', () => ({ default: () => null }))
vi.mock('@/core/templates/ErrorPage500', () => ({ default: () => null }))

describe('getTemplateName', () => {
  it('returns the controllerTemplate string for registered templates', () => {
    expect(getTemplateName('CmsModule:Homepage')).toBe('CmsModule:Homepage')
    expect(getTemplateName('CmsModule:ContentPage')).toBe('CmsModule:ContentPage')
    expect(getTemplateName('CmsModule:ContentArticles')).toBe('CmsModule:ContentArticles')
    expect(getTemplateName('CmsModule:ErrorPage404')).toBe('CmsModule:ErrorPage404')
    expect(getTemplateName('CmsModule:ErrorPage500')).toBe('CmsModule:ErrorPage500')
  })

  it('returns null for unknown templates', () => {
    expect(getTemplateName('CmsModule:Unknown')).toBeNull()
    expect(getTemplateName('')).toBeNull()
  })
})

describe('resolveTemplate', () => {
  it('resolves registered template components', async () => {
    const Component = await resolveTemplate('CmsModule:Homepage')
    expect(Component).not.toBeNull()
    expect(typeof Component).toBe('function')
  })

  it('returns null for unknown controllerTemplate', async () => {
    const Component = await resolveTemplate('CmsModule:DoesNotExist')
    expect(Component).toBeNull()
  })

  it('resolves all registered templates', async () => {
    const keys = [
      'CmsModule:Homepage',
      'CmsModule:ContentPage',
      'CmsModule:ContentArticles',
      'CmsModule:ErrorPage404',
      'CmsModule:ErrorPage500',
    ]
    for (const key of keys) {
      const Component = await resolveTemplate(key)
      expect(Component, `Expected component for ${key}`).not.toBeNull()
    }
  })
})
