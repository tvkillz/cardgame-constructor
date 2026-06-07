#!/usr/bin/env node
/**
 * Change a site's public URL (manifest siteUrl + optional registry domain override).
 *
 * Usage:
 *   node projects/scripts/site-url.mjs --project=voidborn --url=https://voidborn.fun
 *   node projects/scripts/site-url.mjs --project=project2 --url=https://demo.example.com --nginx
 */
import { spawnSync } from 'node:child_process'

import {
  FRONTEND_ROOT,
  hostnameFromUrl,
  parseArg,
  printNextSteps,
  readManifest,
  readRegistry,
  writeManifest,
  writeRegistry,
} from './site-utils.mjs'

async function main() {
  const projectId = parseArg('project') || parseArg('id')
  const urlArg = parseArg('url')
  const regenNginx = process.argv.includes('--nginx')
  const setRegistryDomain = process.argv.includes('--registry-domain')

  if (!projectId || !urlArg) {
    console.error('Usage: node projects/scripts/site-url.mjs --project=ID --url=https://domain.com [--nginx] [--registry-domain]')
    process.exit(1)
  }

  const normalized = urlArg.startsWith('http') ? urlArg.replace(/\/$/, '') : `https://${urlArg.replace(/\/$/, '')}`
  const hostname = hostnameFromUrl(normalized)

  const manifest = await readManifest(projectId)
  manifest.siteUrl = normalized
  await writeManifest(projectId, manifest)
  console.log(`[site-url] Updated projects/${projectId}/manifest.json → siteUrl=${normalized}`)

  if (setRegistryDomain) {
    const registry = await readRegistry()
    const entry = registry.find((s) => s.id === projectId)
    if (!entry) {
      console.error(`[site-url] ${projectId} not in registry.json`)
      process.exit(1)
    }
    entry.domain = hostname
    await writeRegistry(registry)
    console.log(`[site-url] Updated registry.json → domain=${hostname}`)
  }

  const steps = [
    `npm run compile --project=${projectId}  (from frontend/)`,
    'Add redirect to backend/.env ADDITIONAL_REDIRECT_URLS (run site-sync-hints.mjs)',
    'pm2 restart ecosystem.config.cjs --only {id}-prod',
  ]

  if (regenNginx) {
    const result = spawnSync('node', ['deploy/scripts/generate-nginx.mjs'], {
      cwd: FRONTEND_ROOT,
      stdio: 'inherit',
    })
    if (result.status !== 0) process.exit(result.status ?? 1)
    steps.unshift('sudo bash deploy/scripts/setup-vps.sh reload')
    steps.push(`sudo CERTBOT_EMAIL=you@example.com bash deploy/scripts/setup-vps.sh ssl  (if domain is new)`)
  } else {
    steps.push('npm run deploy:nginx  (from frontend/) then reload nginx on VPS')
  }

  printNextSteps(steps)
}

main().catch((err) => {
  console.error('[site-url]', err.message ?? err)
  process.exit(1)
})
