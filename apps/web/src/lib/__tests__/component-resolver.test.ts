import { describe, it, expect, vi } from 'vitest'

// We test the resolution logic by controlling which dynamic imports succeed.
// Vitest doesn't support dynamic import path mocking easily, so we test
// the public contract via module factory patterns.

describe('resolveComponent', () => {
  it('returns null for empty controllerTemplate', async () => {
    const { resolveComponent } = await import('../component-resolver')
    const result = await resolveComponent('', 'skeleton_localhost')
    expect(result).toBeNull()
  })

  it('returns null when neither site override nor core template exists', async () => {
    // Both dynamic imports will naturally throw (module not found)
    const { resolveComponent } = await import('../component-resolver')
    const result = await resolveComponent('Cms:NonExistent:default', 'unknown_site')
    expect(result).toBeNull()
  })

  it('falls back to core template when site override does not exist', async () => {
    vi.mock('@/core/templates/Cms/Page/Default', () => ({ default: () => null }))
    const { resolveComponent } = await import('../component-resolver')
    const result = await resolveComponent('Cms:Page:default', 'skeleton_localhost')
    // Core template exists (mocked) → should not be null
    expect(result).not.toBeNull()
  })
})

describe('resolveLayoutComponent', () => {
  it('returns null when neither site override nor core layout exists', async () => {
    const { resolveLayoutComponent } = await import('../component-resolver')
    const result = await resolveLayoutComponent('NonExistentLayout', 'unknown_site')
    expect(result).toBeNull()
  })

  it('falls back to core layout when site override does not exist', async () => {
    vi.mock('@/core/layouts/MainLayout', () => ({ default: () => null }))
    const { resolveLayoutComponent } = await import('../component-resolver')
    const result = await resolveLayoutComponent('MainLayout', 'skeleton_localhost')
    expect(result).not.toBeNull()
  })
})

describe('resolveSiteComponent', () => {
  it('returns null when neither site override nor core component exists', async () => {
    const { resolveSiteComponent } = await import('../component-resolver')
    const result = await resolveSiteComponent('layout/NonExistent', 'unknown_site')
    expect(result).toBeNull()
  })

  it('falls back to core component when site override does not exist', async () => {
    vi.mock('@/core/components/layout/Header', () => ({ default: () => null }))
    const { resolveSiteComponent } = await import('../component-resolver')
    const result = await resolveSiteComponent('layout/Header', 'skeleton_localhost')
    expect(result).not.toBeNull()
  })
})
