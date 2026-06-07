#!/usr/bin/env node
/**
 * Add a new site: registry entry + scaffold from an existing project.
 *
 * Usage:
 *   node projects/scripts/site-add.mjs --id=site3 --url=https://site3.example.com
 *   node projects/scripts/site-add.mjs --id=site3 --url=https://site3.example.com --from=project2 --name="Site Three"
 */
import { cp, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'

import {
  PROJECTS_ROOT,
  hostnameFromUrl,
  parseArg,
  printNextSteps,
  readRegistry,
  writeManifest,
  writeRegistry,
} from './site-utils.mjs'

async function main() {
  const id = parseArg('id')
  const urlArg = parseArg('url')
  const fromId = parseArg('from') || 'project2'
  const displayName = parseArg('name') || id
  const status = parseArg('status') || 'demo'

  if (!id || !urlArg) {
    console.error(
      'Usage: node projects/scripts/site-add.mjs --id=NEW_ID --url=https://domain.com [--from=project2] [--name="Display Name"] [--status=demo]',
    )
    process.exit(1)
  }

  if (!/^[a-z][a-z0-9_-]*$/i.test(id)) {
    console.error('[site-add] id must be alphanumeric (e.g. site3, my-game)')
    process.exit(1)
  }

  const registry = await readRegistry()
  if (registry.some((s) => s.id === id)) {
    console.error(`[site-add] "${id}" already in registry.json`)
    process.exit(1)
  }

  const destRoot = path.join(PROJECTS_ROOT, id)
  const srcRoot = path.join(PROJECTS_ROOT, fromId)

  try {
    await readFile(path.join(srcRoot, 'manifest.json'))
  } catch {
    console.error(`[site-add] Template project not found: projects/${fromId}/`)
    process.exit(1)
  }

  try {
    await readFile(path.join(destRoot, 'manifest.json'))
    console.error(`[site-add] projects/${id}/ already exists`)
    process.exit(1)
  } catch {
    // ok — destination free
  }

  await cp(srcRoot, destRoot, { recursive: true })

  const normalized = urlArg.startsWith('http') ? urlArg.replace(/\/$/, '') : `https://${urlArg.replace(/\/$/, '')}`
  const short = displayName.replace(/\s+/g, ' ').trim()

  const manifest = JSON.parse(await readFile(path.join(destRoot, 'manifest.json'), 'utf8'))
  manifest.id = id
  manifest.siteUrl = normalized
  manifest.name = {
    display: short.toUpperCase(),
    short: short,
    documentTitle: short,
  }
  if (manifest.brand) {
    manifest.brand.logoAlt = `${short} logo`
  }
  await writeManifest(id, manifest)

  registry.push({ id, path: `./${id}`, status })
  await writeRegistry(registry)

  console.log(`[site-add] Created projects/${id}/ from ${fromId}`)
  console.log(`[site-add] Added registry entry (status=${status})`)

  printNextSteps([
    `Edit projects/${id}/ copy (descriptions.json, seo.json), theme, game/*.json as needed`,
    `npm run metadata:split --project=${id}  (if still using assets_metadata.json)`,
    'npm run compile:all  (from frontend/)',
    `PROJECT=${id} npm run build  (from frontend/)`,
    'pm2 start ecosystem.config.cjs --only {id}-dev,{id}-prod',
    'npm run deploy:nginx && sudo bash deploy/scripts/setup-vps.sh reload',
    'node projects/scripts/site-sync-hints.mjs  (backend redirects + sites.sql)',
    `npm run upload:site with PROJECT=${id}  (card art → Supabase storage)`,
  ])
}

main().catch((err) => {
  console.error('[site-add]', err.message ?? err)
  process.exit(1)
})
