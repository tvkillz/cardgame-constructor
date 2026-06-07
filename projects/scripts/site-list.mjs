#!/usr/bin/env node
/**
 * List registered sites with URLs, ports, and metadata source.
 *
 * Usage:
 *   node projects/scripts/site-list.mjs
 */
import { readFile } from 'node:fs/promises'
import path from 'node:path'

import { prodPort } from '../../frontend/scripts/project-ports.mjs'
import {
  FRONTEND_ROOT,
  PROJECTS_ROOT,
  readManifest,
  readRegistry,
  resolveSiteUrl,
} from './site-utils.mjs'

async function metadataSource(projectId) {
  const cardsPath = path.join(PROJECTS_ROOT, projectId, 'game/cards.json')
  try {
    await readFile(cardsPath)
    return 'split (game/*.json)'
  } catch {
    return 'legacy (assets_metadata.json)'
  }
}

async function main() {
  const registry = await readRegistry()
  console.log('Registered sites:\n')

  for (let index = 0; index < registry.length; index++) {
    const site = registry[index]
    const url = await resolveSiteUrl(site, index)
    const manifest = await readManifest(site.id)
    const meta = await metadataSource(site.id)

    console.log(`  ${site.id}`)
    console.log(`    status:   ${site.status ?? 'live'}`)
    console.log(`    siteUrl:  ${url}`)
    console.log(`    name:     ${manifest.name?.display ?? '—'}`)
    const port = prodPort(site.id, index)
    console.log(`    port:     ${port} (dev and prod)`)
    console.log(`    metadata: ${meta}`)
    console.log(`    path:     projects/${site.id}/`)
    console.log('')
  }

  console.log(`Registry: ${path.relative(FRONTEND_ROOT, path.join(PROJECTS_ROOT, 'registry.json'))}`)
}

main().catch((err) => {
  console.error('[site-list]', err.message ?? err)
  process.exit(1)
})
