import path from 'node:path'

export type UiTestSite = {
  /** Label in test titles + snapshot filenames (e.g. komorebi) */
  name: string
  /** Local start:prod URL — ports are typically 3100 + projects/registry index */
  url: string
  /**
   * Auth email plus-tag (siteId / authEmailSuffix).
   * Display email `you@x.com` becomes `you+voidborn@x.com` / `you+iyashikei@x.com`.
   */
  authSuffix: string
  /** Playwright storageState path (Supabase session in localStorage) */
  authFile: string
}

const authDir = path.join(__dirname, '..', '.auth')

/**
 * Single registry for landing + portal UI tests.
 * Add a new site here — both suites pick it up.
 */
export const UI_TEST_SITES: UiTestSite[] = [
  {
    name: 'voidborn',
    url: 'http://127.0.0.1:3100',
    authSuffix: 'voidborn',
    authFile: path.join(authDir, 'voidborn.json'),
  },
  {
    name: 'komorebi',
    url: 'http://127.0.0.1:3102',
    authSuffix: 'iyashikei',
    authFile: path.join(authDir, 'iyashikei.json'),
  },
]

/** @deprecated Prefer UI_TEST_SITES — kept for existing portal imports */
export const PORTAL_SITES = UI_TEST_SITES

export type PortalSite = UiTestSite
