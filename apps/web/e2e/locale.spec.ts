import { test, expect } from '@playwright/test'

import { HOMEPAGE } from './fixtures'

test.describe('Locale handling', () => {
  test('default locale renders without a /locale/ prefix', async ({ page }) => {
    await page.goto(HOMEPAGE)
    // The URL must not contain a locale segment such as /cs/ or /en/
    const url = page.url()
    // Default locale (cs) should NOT appear as a path prefix
    expect(url).not.toMatch(/\/cs\//)
  })

  test('secondary locale uses /locale/ prefix in URL', async ({ page }) => {
    await page.goto('/en')
    const url = page.url()
    // Either redirected to /en or /en/ — the segment must be present
    expect(url).toMatch(/\/en($|\/)/)
  })

  test('language switcher is visible when translation links are available', async ({ page }) => {
    await page.goto(HOMEPAGE)
    // LanguageSwitcher renders either a dropdown trigger or a plain locale span
    const switcher = page.locator('header').getByText(/^(cs|en)$/i)
    await expect(switcher.first()).toBeVisible()
  })
})
