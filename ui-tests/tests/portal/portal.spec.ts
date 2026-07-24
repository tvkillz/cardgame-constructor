import { test, expect } from '@playwright/test'
import { PORTAL_SITES } from '../../helpers/sites'
import { stabilizePage } from '../../helpers/stabilize'

test.setTimeout(120_000)

for (const site of PORTAL_SITES) {
  test.describe(`${site.name} portal smoke`, () => {
    test.use({
      baseURL: site.url,
      storageState: site.authFile,
    })

    test('buy credits, collection modes, transactions, profile', async ({ page }) => {
      await page.goto('/portal/market', { waitUntil: 'domcontentloaded', timeout: 60_000 })
      await expect(page.locator('.portal')).toBeVisible({ timeout: 90_000 })
      await stabilizePage(page)
      await expect(page.locator('.portal__tabs')).toBeVisible()

      // 1) Buy credits modal
      await page.locator('.portal__buy-credits-btn').click()
      const creditsModal = page.locator('.credits-modal--open')
      await expect(creditsModal).toBeVisible()
      await expect(creditsModal.locator('.credits-modal__panel')).toBeVisible()
      await creditsModal.locator('.credits-modal__close').click()
      await expect(creditsModal).toHaveCount(0)

      // 2) Collection — Forge / Sell
      await page.locator('nav.portal__tabs').getByRole('link', { name: 'Collection' }).click()
      await expect(page).toHaveURL(/\/portal\/collection/)
      await expect(page.locator('.portal-collection, .portal-collection__status').first()).toBeVisible({
        timeout: 60_000,
      })

      const forgeBtn = page.locator('.portal__mode-btn', { hasText: 'Forge' })
      const sellBtn = page.locator('.portal__mode-btn', { hasText: 'Sell' })
      await expect(forgeBtn).toBeVisible()
      await expect(sellBtn).toBeVisible()

      await sellBtn.click()
      await expect(sellBtn).toHaveAttribute('aria-pressed', 'true')
      await forgeBtn.click()
      await expect(forgeBtn).toHaveAttribute('aria-pressed', 'true')

      // 3) Transactions
      await page.locator('nav.portal__tabs').getByRole('link', { name: 'Transactions' }).click()
      await expect(page).toHaveURL(/\/portal\/transactions/)
      await expect(page.locator('.portal-transactions')).toBeVisible({ timeout: 60_000 })
      await expect(page.getByRole('heading', { name: 'Payment history' })).toBeVisible()

      // 4) Profile
      await page.locator('nav.portal__tabs').getByRole('link', { name: 'Profile' }).click()
      await expect(page).toHaveURL(/\/portal\/profile/)
      await expect(page.locator('.portal-profile')).toBeVisible({ timeout: 60_000 })
      await expect(page.getByRole('heading', { name: 'Billing Profile' })).toBeVisible()
    })
  })
}
