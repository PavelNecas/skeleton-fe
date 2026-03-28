import { test, expect } from '@playwright/test'

import { HOMEPAGE } from './fixtures'

test.describe('Homepage', () => {
  test('loads and renders a heading', async ({ page }) => {
    await page.goto(HOMEPAGE)
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  })

  test('displays main navigation', async ({ page }) => {
    await page.goto(HOMEPAGE)
    await expect(page.getByRole('navigation', { name: 'Main navigation' })).toBeVisible()
  })

  test('renders a content area', async ({ page }) => {
    await page.goto(HOMEPAGE)
    await expect(page.locator('main')).toBeVisible()
  })
})
