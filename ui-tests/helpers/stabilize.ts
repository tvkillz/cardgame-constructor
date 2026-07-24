import type { Page } from '@playwright/test'

/**
 * Kill animations / hide media for stable screenshots.
 * Do NOT blanket-force opacity/transform — closed cart/modals use those to stay off-screen.
 */
export async function stabilizePage(page: Page): Promise<void> {
  await page.addStyleTag({
    content: `
      *, *::before, *::after {
        animation: none !important;
        transition: none !important;
      }

      /* Closed overlays must stay hidden (drawer uses translateX; modals use opacity) */
      .credits-modal:not(.credits-modal--open),
      .withdrawal-modal:not(.withdrawal-modal--open),
      .auth-modal:not(.auth-modal--open),
      .market-cart:not(.market-cart--open) {
        visibility: hidden !important;
        opacity: 0 !important;
        pointer-events: none !important;
      }

      .market-cart:not(.market-cart--open) .market-cart__backdrop {
        opacity: 0 !important;
      }

      .market-cart:not(.market-cart--open) .market-cart__panel {
        transform: translateX(100%) !important;
      }

      /* Open overlays: snap fully visible */
      .credits-modal--open,
      .credits-modal--open .credits-modal__panel,
      .withdrawal-modal--open,
      .withdrawal-modal--open .withdrawal-modal__panel,
      .auth-modal--open,
      .auth-modal--open .auth-modal__panel,
      .market-cart--open .market-cart__backdrop {
        opacity: 1 !important;
        transform: none !important;
        visibility: visible !important;
      }

      .market-cart--open .market-cart__panel {
        transform: translateX(0) !important;
        visibility: visible !important;
      }

      img, video, canvas {
        visibility: hidden !important;
      }
      [style*="background-image"] {
        background-image: none !important;
      }

      /* Card art — hide without pink-masking whole grids */
      .card__art,
      .market-card__frame img,
      .collection-owned-card__frame img,
      .market-cart__thumb {
        visibility: hidden !important;
        background-image: none !important;
      }

      /* Market / listing cash + credit prices (dynamic) */
      .market-card__price,
      .market-card__price--credits,
      .market-card__price--money,
      .player-listing-card__price-display,
      .market-cart__line-price,
      .market-cart__line-credits {
        visibility: hidden !important;
      }

      /* Counts / inventory stats that churn with catalog */
      .portal-market__count,
      .portal-collection__stats,
      .portal-collection__status,
      .collection-owned-card__owned-badge,
      .collection-owned-card__qty-value {
        visibility: hidden !important;
      }
    `,
  })
}

/** Close cart drawer / credits / withdraw / account menu if left open between steps. */
export async function closePortalOverlays(page: Page): Promise<void> {
  if (await page.locator('.market-cart--open').count()) {
    await page.locator('.market-cart__close').click()
    await page.locator('.market-cart--open').waitFor({ state: 'hidden', timeout: 5_000 }).catch(() => {})
  }

  if (await page.locator('.credits-modal--open').count()) {
    await page.locator('.credits-modal--open .credits-modal__close').click()
    await page.locator('.credits-modal--open').waitFor({ state: 'hidden', timeout: 5_000 }).catch(() => {})
  }

  if (await page.locator('.withdrawal-modal--open').count()) {
    await page.locator('.withdrawal-modal--open .withdrawal-modal__close').click()
    await page.locator('.withdrawal-modal--open').waitFor({ state: 'hidden', timeout: 5_000 }).catch(() => {})
  }

  if (await page.locator('.portal__account-menu').isVisible().catch(() => false)) {
    await page.getByRole('button', { name: 'Account menu' }).click()
    await page.locator('.portal__account-menu').waitFor({ state: 'hidden', timeout: 5_000 }).catch(() => {})
  }
}
