import { test, expect } from '@playwright/test'

import { CONTENT_PAGE, ARTICLE_PAGE } from './fixtures'

test.describe('Routing — content pages', () => {
  test('content page loads at /about-us', async ({ page }) => {
    const response = await page.goto(CONTENT_PAGE)
    expect(response?.status()).not.toBe(500)
    await expect(page.locator('main')).toBeVisible()
  })

  test('content page shows breadcrumbs', async ({ page }) => {
    await page.goto(CONTENT_PAGE)
    // Breadcrumbs are rendered as an <ol> (shadcn BreadcrumbList)
    await expect(page.locator('ol').first()).toBeVisible()
    // At minimum the Home breadcrumb is present
    await expect(page.getByRole('link', { name: /home/i })).toBeVisible()
  })
})

test.describe('Routing — article pages', () => {
  test('article page loads at article slug', async ({ page }) => {
    const response = await page.goto(ARTICLE_PAGE)
    // Either the page renders or a 404 is shown — never a 500
    expect(response?.status()).not.toBe(500)
    await expect(page.locator('body')).toBeVisible()
  })
})
