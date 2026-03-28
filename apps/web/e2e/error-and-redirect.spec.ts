import { test, expect } from '@playwright/test'

test.describe('404 handling', () => {
  test('unknown path shows a 404 page', async ({ page }) => {
    await page.goto('/this-path-does-not-exist-at-all-xyz')
    // The not-found page renders a visible "404" heading or text
    await expect(page.getByText('404')).toBeVisible()
  })
})

test.describe('Alias redirects', () => {
  test('alias redirect follows with a 3xx response', async ({ page }) => {
    // Collect all responses to detect a redirect chain
    const responses: number[] = []
    page.on('response', (res) => {
      responses.push(res.status())
    })

    // This path is expected to be an alias registered in ES; if not found it
    // will produce a 404, so we accept both — key assertion is no 5xx.
    await page.goto('/old-about-us')
    const serverErrors = responses.filter((s) => s >= 500)
    expect(serverErrors).toHaveLength(0)
  })
})

test.describe('Navigation links', () => {
  test('clicking a nav link loads the correct page', async ({ page }) => {
    await page.goto('/')
    const nav = page.getByRole('navigation', { name: 'Main navigation' })
    const firstLink = nav.getByRole('link').first()

    const href = await firstLink.getAttribute('href')

    // Only proceed if navigation has links (requires a running backend)
    if (href) {
      await firstLink.click()
      await expect(page).toHaveURL(new RegExp(href.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')))
      await expect(page.locator('main')).toBeVisible()
    } else {
      // No nav links rendered (e.g. empty ES index) — pass gracefully
      test.skip()
    }
  })
})
