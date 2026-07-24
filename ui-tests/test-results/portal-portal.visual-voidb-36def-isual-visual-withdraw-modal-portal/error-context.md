# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: portal/portal.visual.spec.ts >> voidborn portal visual >> visual withdraw modal
- Location: tests/portal/portal.visual.spec.ts:51:9

# Error details

```
Error: expect(page).toHaveScreenshot(expected) failed

  95724 pixels (ratio 0.10 of all image pixels) are different.

  Snapshot: voidborn-withdraw-modal.png

Call log:
  - Expect "toHaveScreenshot(voidborn-withdraw-modal.png)" with timeout 80000ms
    - verifying given screenshot expectation
  - taking page screenshot
    - disabled all CSS animations
  - waiting for fonts to load...
  - fonts loaded
  - 95724 pixels (ratio 0.10 of all image pixels) are different.
  - waiting 100ms before taking screenshot
  - taking page screenshot
    - disabled all CSS animations
  - waiting for fonts to load...
  - fonts loaded
  - captured a stable screenshot
  - 95724 pixels (ratio 0.10 of all image pixels) are different.

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
          - generic [ref=e10]: …
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
      - heading "MARKET" [level=1] [ref=e23]
      - generic [ref=e24]:
        - button "+ BUY" [ref=e25] [cursor=pointer]
        - button "WITHDRAW" [active] [ref=e26] [cursor=pointer]
        - button "CART" [ref=e27] [cursor=pointer]:
          - generic [ref=e29]: CART
        - generic [ref=e30]:
          - generic [ref=e31]: Currency
          - combobox "Display currency" [ref=e32] [cursor=pointer]:
            - option "EUR" [selected]
            - option "GBP"
            - option "USD"
    - main [ref=e33]:
      - search [ref=e35]:
        - group "Market filter" [ref=e36]:
          - button "All cards" [pressed] [ref=e37] [cursor=pointer]
          - button "My cards" [ref=e38] [cursor=pointer]
        - generic [ref=e39]:
          - generic [ref=e40]: Search cards by title
          - searchbox "Search cards by title" [ref=e41]
        - generic [ref=e42]:
          - generic [ref=e43]: Filter by domain
          - combobox "Domain" [ref=e44] [cursor=pointer]:
            - option "All domains" [selected]
            - option "Kronos"
            - option "Thalassa"
            - option "Infernus"
            - option "Anemos"
        - generic [ref=e45]:
          - generic [ref=e46]: Filter by type
          - combobox "Card type" [ref=e47] [cursor=pointer]:
            - option "All types" [selected]
            - option "Common"
            - option "Uncommon"
            - option "Rare"
            - option "Epic"
            - option "Legendary"
        - generic [ref=e48]:
          - generic [ref=e49]: Sort cards
          - combobox "Sort by" [ref=e50] [cursor=pointer]:
            - option "Rarity" [selected]
            - 'option "Price: low → high"'
            - 'option "Price: high → low"'
            - 'option "Name: A–Z"'
    - contentinfo "Site footer" [ref=e52]:
      - generic [ref=e53]:
        - generic [ref=e54]:
          - generic [ref=e55]:
            - link [ref=e57] [cursor=pointer]:
              - /url: /
            - paragraph [ref=e58]: Forge your deck. Rule the realm.
          - generic [ref=e59]:
            - heading "Legal" [level=3] [ref=e60]
            - list [ref=e61]:
              - listitem [ref=e62]:
                - link "Terms of Service" [ref=e63] [cursor=pointer]:
                  - /url: /terms
              - listitem [ref=e64]:
                - link "Privacy Notice" [ref=e65] [cursor=pointer]:
                  - /url: /privacy
              - listitem [ref=e66]:
                - link "Cancellation & Refund Policy" [ref=e67] [cursor=pointer]:
                  - /url: /refund-policy
              - listitem [ref=e68]:
                - link "Disclaimer" [ref=e69] [cursor=pointer]:
                  - /url: /disclaimer
              - listitem [ref=e70]:
                - link "Cookie Policy" [ref=e71] [cursor=pointer]:
                  - /url: /cookie-policy
          - generic [ref=e72]:
            - heading "Contact" [level=3] [ref=e73]
            - list [ref=e74]:
              - listitem [ref=e75]: "Company name: Baltius, UAB"
              - listitem [ref=e76]: "Company number: 307485071"
              - listitem [ref=e77]: "Registered address: Klaipėdos g. 4A, Jokūbavo k., LT-97210 Kretingos r., LITHUANIA"
              - listitem [ref=e78]:
                - link "support@voidborn.fun" [ref=e79] [cursor=pointer]:
                  - /url: mailto:support@voidborn.fun
            - list "Social media" [ref=e80]:
              - listitem [ref=e81]:
                - link "Telegram" [ref=e82] [cursor=pointer]:
                  - /url: https://t.me/voidbornfun
              - listitem [ref=e84]:
                - link "Instagram" [ref=e85] [cursor=pointer]:
                  - /url: https://www.instagram.com/voidborn.fun/
              - listitem [ref=e87]:
                - link "Facebook" [ref=e88] [cursor=pointer]:
                  - /url: https://www.facebook.com/profile.php?id=61591572371089
              - listitem [ref=e90]:
                - link "Discord" [ref=e91] [cursor=pointer]:
                  - /url: https://discord.gg/bEnJAMkhk
            - generic "Accepted payment methods" [ref=e93]
        - generic [ref=e94]:
          - paragraph [ref=e95]: © 2026 Voidborn. All rights reserved.
          - button "Cookie Settings" [ref=e96] [cursor=pointer]
  - dialog "Withdraw Credits" [ref=e97]:
    - button "Close withdrawal" [ref=e98] [cursor=pointer]
    - generic [ref=e99]:
      - button "Close" [ref=e100] [cursor=pointer]: ×
      - banner [ref=e101]:
        - heading "Withdraw Credits" [level=2] [ref=e104]
        - paragraph [ref=e105]: Request a payout from your credit balance. Pending requests reserve credits until processed.
      - paragraph [ref=e106]:
        - text: "Available balance:"
        - strong [ref=e107]: …
        - text: credits
      - generic [ref=e108]:
        - generic [ref=e109]: Amount (credits)
        - textbox "Amount (credits)" [ref=e110]:
          - /placeholder: e.g. 500
      - button "Request withdrawal" [disabled] [ref=e112]
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
> 56  |       await expect(page).toHaveScreenshot(`${site.name}-withdraw-modal.png`, shotOpts(page))
      |                          ^ Error: expect(page).toHaveScreenshot(expected) failed
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
  93  |       await expect(page).toHaveScreenshot(`${site.name}-collection-sell.png`, shotOpts(page))
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