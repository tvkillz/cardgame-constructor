#!/usr/bin/env node
/**
 * Print backend env + SQL hints for all registered site URLs.
 *
 * Usage:
 *   node projects/scripts/site-sync-hints.mjs
 */
import { readFile } from 'node:fs/promises'

import { loadRegistry } from '../../frontend/scripts/project-ports.mjs'
import {
  BACKEND_SITES_SQL,
  collectRedirectUrls,
  hostnameFromUrl,
  readManifest,
  resolveSiteUrl,
} from './site-utils.mjs'

async function main() {
  const registry = loadRegistry()
  const redirects = await collectRedirectUrls()

  console.log('# Backend multi-site sync hints\n')
  console.log('## ADDITIONAL_REDIRECT_URLS (backend/.env)\n')
  console.log(`ADDITIONAL_REDIRECT_URLS=${redirects.join(',')}\n`)

  console.log('## CORS origins (frontend/deploy/output/cors-origins.txt)\n')
  console.log('  cd frontend && npm run deploy:nginx -- --cors-origins\n')

  console.log('## sites table rows (backend/volumes/db/sites.sql)\n')
  console.log('insert into public.sites (id, name, domain, status) values')

  const rows = []
  for (let i = 0; i < registry.length; i++) {
    const site = registry[i]
    const url = await resolveSiteUrl(site, i)
    const manifest = await readManifest(site.id)
    const domain = hostnameFromUrl(url)
    const name = (manifest.name?.display ?? site.id).replace(/'/g, "''")
    const status = site.status ?? 'live'
    rows.push(`  ('${site.id}', '${name}', '${domain}', '${status}')`)
  }

  console.log(rows.join(',\n'))
  console.log('on conflict (id) do update set')
  console.log('  name = excluded.name,')
  console.log('  domain = excluded.domain,')
  console.log('  status = excluded.status,')
  console.log('  updated_at = now();')
  console.log(`\n(source: ${BACKEND_SITES_SQL})\n`)

  try {
    const sql = await readFile(BACKEND_SITES_SQL, 'utf8')
    const missing = registry.filter((s) => !sql.includes(`'${s.id}'`))
    if (missing.length) {
      console.log('⚠ Not yet in sites.sql:', missing.map((s) => s.id).join(', '))
    } else {
      console.log('✓ All registry sites appear in sites.sql')
    }
  } catch {
    console.log('(could not read sites.sql)')
  }
}

main().catch((err) => {
  console.error('[site-sync-hints]', err.message ?? err)
  process.exit(1)
})
