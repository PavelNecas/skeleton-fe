import { describe, it, expect, vi } from 'vitest'

// We test the resolution logic by controlling which dynamic imports succeed.
// Vitest doesn't support dynamic import path mocking easily, so we test
// the public contract via module factory patterns.

describe('resolveComponent', () => {
  it('returns null for controllerTemplate with no component name', async () => {
    // Avoid side-effects from other tests by importing fresh
    const { resolveComponent } = await import('../component-resolver')
    const result = await resolveComponent('', 'skeleton_localhost')
    expect(result).toBeNull()
  })

  it('returns null when neither site override nor core template exists', async () => {
    // Both dynamic imports will naturally throw (module not found)
    const { resolveComponent } = await import('../component-resolver')
    const result = await resolveComponent('CmsModule:NonExistentWidget', 'unknown_site')
    expect(result).toBeNull()
  })

  it('falls back to core template when site override does not exist', async () => {
    vi.mock('@/core/templates/ContentPage', () => ({ default: () => null }))
    const { resolveComponent } = await import('../component-resolver')
    const result = await resolveComponent('CmsModule:ContentPage', 'skeleton_localhost')
    // Core template exists (mocked) → should not be null
    expect(result).not.toBeNull()
  })
})
