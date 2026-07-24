# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: portal/portal.visual.spec.ts >> helix portal visual >> visual collection sell
- Location: tests/portal/portal.visual.spec.ts:86:9

# Error details

```
Error: expect(page).toHaveScreenshot(expected) failed

  43390 pixels (ratio 0.05 of all image pixels) are different.

  Snapshot: helix-collection-sell.png

Call log:
  - Expect "toHaveScreenshot(helix-collection-sell.png)" with timeout 80000ms
    - verifying given screenshot expectation
  - taking page screenshot
    - disabled all CSS animations
  - waiting for fonts to load...
  - fonts loaded
  - 43390 pixels (ratio 0.05 of all image pixels) are different.
  - waiting 100ms before taking screenshot
  - taking page screenshot
    - disabled all CSS animations
  - waiting for fonts to load...
  - fonts loaded
  - captured a stable screenshot
  - 43390 pixels (ratio 0.05 of all image pixels) are different.

```

# Page snapshot

```yaml
- generic [ref=e1]:
  - alert [ref=e2]
  - generic [ref=e3]:
    - banner [ref=e5]:
      - link [ref=e6] [cursor=pointer]:
        - /url: /portal/market
      - generic [ref=e7]:
        - generic [ref=e8]:
          - generic [ref=e9]: qa
          - generic [ref=e10]: "0"
        - button "Account menu" [ref=e12] [cursor=pointer]
    - navigation "Player portal" [ref=e16]:
      - link "Market" [ref=e17] [cursor=pointer]:
        - /url: /portal/market
      - link "Collection" [ref=e18] [cursor=pointer]:
        - /url: /portal/collection
      - link "Transactions" [ref=e19] [cursor=pointer]:
        - /url: /portal/transactions
      - link "Profile" [ref=e20] [cursor=pointer]:
        - /url: /portal/profile
    - generic [ref=e21]:
      - heading "COLLECTION" [level=1] [ref=e23]
      - generic [ref=e24]:
        - group "Collection mode" [ref=e25]:
          - button "Forge" [ref=e26] [cursor=pointer]
          - button "Sell" [active] [pressed] [ref=e27] [cursor=pointer]
        - button "+ BUY" [ref=e28] [cursor=pointer]
        - button "WITHDRAW" [ref=e29] [cursor=pointer]
        - button "CART" [ref=e30] [cursor=pointer]:
          - generic [ref=e32]: CART
        - generic [ref=e33]:
          - generic [ref=e34]: Currency
          - combobox "Display currency" [ref=e35] [cursor=pointer]:
            - option "EUR" [selected]
            - option "GBP"
            - option "USD"
    - main [ref=e36]:
      - search [ref=e40]:
        - generic [ref=e41]:
          - generic [ref=e42]: Search cards by title
          - searchbox "Search cards by title" [ref=e43]
        - generic [ref=e44]:
          - generic [ref=e45]: Filter by domain
          - combobox "Domain" [ref=e46] [cursor=pointer]:
            - option "All domains" [selected]
            - option "Atrium"
            - option "Reservoir"
            - option "Core"
            - option "Antenna"
        - generic [ref=e47]:
          - generic [ref=e48]: Filter by type
          - combobox "Card type" [ref=e49] [cursor=pointer]:
            - option "All types" [selected]
            - option "Chassis"
            - option "Calibrated"
            - option "Prime"
            - option "Singularity"
            - option "Helix"
        - generic [ref=e50]:
          - generic [ref=e51]: Sort cards
          - combobox "Sort by" [ref=e52] [cursor=pointer]:
            - option "Rarity" [selected]
            - 'option "Price: low → high"'
            - 'option "Price: high → low"'
            - 'option "Name: A–Z"'
    - contentinfo "Site footer" [ref=e55]:
      - generic [ref=e56]:
        - generic [ref=e57]:
          - generic [ref=e58]:
            - link [ref=e60] [cursor=pointer]:
              - /url: /
            - paragraph [ref=e61]: Keep the Signal. Field the Frames.
          - generic [ref=e62]:
            - heading "Legal" [level=3] [ref=e63]
            - list [ref=e64]:
              - listitem [ref=e65]:
                - link "Terms of Service" [ref=e66] [cursor=pointer]:
                  - /url: /terms
              - listitem [ref=e67]:
                - link "Privacy Notice" [ref=e68] [cursor=pointer]:
                  - /url: /privacy
              - listitem [ref=e69]:
                - link "Cancellation & Refund Policy" [ref=e70] [cursor=pointer]:
                  - /url: /refund-policy
              - listitem [ref=e71]:
                - link "Disclaimer" [ref=e72] [cursor=pointer]:
                  - /url: /disclaimer
              - listitem [ref=e73]:
                - link "Cookie Policy" [ref=e74] [cursor=pointer]:
                  - /url: /cookie-policy
          - generic [ref=e75]:
            - heading "Contact" [level=3] [ref=e76]
            - list [ref=e77]:
              - listitem [ref=e78]: "Company name: Test LTD"
              - listitem [ref=e79]: "Company number: 00000000"
              - listitem [ref=e80]: "Registered address: 123 Example Street, Testville, TE1 1ST, United Kingdom"
              - listitem [ref=e81]:
                - link "play@helix.voidborn.fun" [ref=e82] [cursor=pointer]:
                  - /url: mailto:play@helix.voidborn.fun
            - list "Social media" [ref=e83]:
              - listitem [ref=e84]:
                - generic "Telegram" [ref=e85]
              - listitem [ref=e87]:
                - generic "Instagram" [ref=e88]
              - listitem [ref=e90]:
                - generic "Facebook" [ref=e91]
              - listitem [ref=e93]:
                - generic "Discord" [ref=e94]
            - generic "Accepted payment methods" [ref=e96]
        - generic [ref=e97]:
          - paragraph [ref=e98]: © 2026 Helix. All rights reserved.
          - button "Cookie Settings" [ref=e99] [cursor=pointer]
```

# Test source

```ts
  1   | import { test, expect } from '@playwright/test'
  2   | import { PORTAL_SITES } from '../../helpers/sites'
  3   | import {
  4   |   closePortalOverlays,
  5   |   stabilizePage,
  6   |   waitForCollectionReady,
  7   |   waitForMarketReady,
  8   | } from '../../helpers/stabilize'
  9   | import { portalDynamicMasks, portalScreenshotOptions } from '../../helpers/visual'
  10  | 
  11  | test.setTimeout(180_000)
  12  | 
  13  | async function openPortal(page: import('@playwright/test').Page, path: string) {
  14  |   await page.goto(path, { waitUntil: 'domcontentloaded', timeout: 60_000 })
  15  |   await expect(page.locator('.portal')).toBeVisible({ timeout: 90_000 })
  16  |   await stabilizePage(page)
  17  |   await closePortalOverlays(page)
  18  |   await expect(page.locator('.portal__tabs')).toBeVisible()
  19  | }
  20  | 
  21  | function shotOpts(page: import('@playwright/test').Page) {
  22  |   return {
  23  |     ...portalScreenshotOptions,
  24  |     mask: portalDynamicMasks(page),
  25  |   }
  26  | }
  27  | 
  28  | for (const site of PORTAL_SITES) {
  29  |   test.describe(`${site.name} portal visual`, () => {
  30  |     test.use({
  31  |       baseURL: site.url,
  32  |       storageState: site.authFile,
  33  |       viewport: { width: 1280, height: 800 },
  34  |     })
  35  | 
  36  |     test('visual market', async ({ page }) => {
  37  |       await openPortal(page, '/portal/market')
  38  |       await waitForMarketReady(page)
  39  |       await closePortalOverlays(page)
  40  |       await expect(page).toHaveScreenshot(`${site.name}-market.png`, shotOpts(page))
  41  |     })
  42  | 
  43  |     test('visual credits modal', async ({ page }) => {
  44  |       await openPortal(page, '/portal/market')
  45  |       await closePortalOverlays(page)
  46  |       await page.locator('.portal__buy-credits-btn').click()
  47  |       await expect(page.locator('.credits-modal--open .credits-modal__panel')).toBeVisible()
  48  |       await expect(page).toHaveScreenshot(`${site.name}-credits-modal.png`, shotOpts(page))
  49  |     })
  50  | 
  51  |     test('visual withdraw modal', async ({ page }) => {
  52  |       await openPortal(page, '/portal/market')
  53  |       await closePortalOverlays(page)
  54  |       await page.getByRole('button', { name: 'WITHDRAW' }).click()
  55  |       await expect(page.locator('.withdrawal-modal--open .withdrawal-modal__panel')).toBeVisible()
  56  |       await expect(page).toHaveScreenshot(`${site.name}-withdraw-modal.png`, shotOpts(page))
  57  |     })
  58  | 
  59  |     test('visual cart drawer', async ({ page }) => {
  60  |       await openPortal(page, '/portal/market')
  61  |       await closePortalOverlays(page)
  62  |       await page.locator('.portal__cart-btn').click()
  63  |       await expect(page.locator('.market-cart--open .market-cart__panel')).toBeVisible()
  64  |       await expect(page).toHaveScreenshot(`${site.name}-cart-drawer.png`, shotOpts(page))
  65  |       await closePortalOverlays(page)
  66  |     })
  67  | 
  68  |     test('visual account menu', async ({ page }) => {
  69  |       await openPortal(page, '/portal/market')
  70  |       await closePortalOverlays(page)
  71  |       await page.getByRole('button', { name: 'Account menu' }).click()
  72  |       await expect(page.locator('.portal__account-menu')).toBeVisible()
  73  |       await expect(page).toHaveScreenshot(`${site.name}-account-menu.png`, shotOpts(page))
  74  |     })
  75  | 
  76  |     test('visual collection forge', async ({ page }) => {
  77  |       await openPortal(page, '/portal/collection')
  78  |       await waitForCollectionReady(page)
  79  |       const forgeBtn = page.locator('.portal__mode-btn', { hasText: 'Forge' })
  80  |       await forgeBtn.click()
  81  |       await expect(forgeBtn).toHaveAttribute('aria-pressed', 'true')
  82  |       await closePortalOverlays(page)
  83  |       await expect(page).toHaveScreenshot(`${site.name}-collection-forge.png`, shotOpts(page))
  84  |     })
  85  | 
  86  |     test('visual collection sell', async ({ page }) => {
  87  |       await openPortal(page, '/portal/collection')
  88  |       await waitForCollectionReady(page)
  89  |       const sellBtn = page.locator('.portal__mode-btn', { hasText: 'Sell' })
  90  |       await sellBtn.click()
  91  |       await expect(sellBtn).toHaveAttribute('aria-pressed', 'true')
  92  |       await closePortalOverlays(page)
> 93  |       await expect(page).toHaveScreenshot(`${site.name}-collection-sell.png`, shotOpts(page))
      |                          ^ Error: expect(page).toHaveScreenshot(expected) failed
  94  |     })
  95  | 
  96  |     test('visual transactions', async ({ page }) => {
  97  |       await openPortal(page, '/portal/transactions')
  98  |       await expect(page.locator('.portal-transactions')).toBeVisible({ timeout: 60_000 })
  99  |       await closePortalOverlays(page)
  100 |       await expect(page).toHaveScreenshot(`${site.name}-transactions.png`, shotOpts(page))
  101 |     })
  102 | 
  103 |     test('visual profile', async ({ page }) => {
  104 |       await openPortal(page, '/portal/profile')
  105 |       await expect(page.locator('.portal-profile')).toBeVisible({ timeout: 60_000 })
  106 |       await closePortalOverlays(page)
  107 |       await expect(page).toHaveScreenshot(`${site.name}-profile.png`, shotOpts(page))
  108 |     })
  109 |   })
  110 | }
  111 | 
```