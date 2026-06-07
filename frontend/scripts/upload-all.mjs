#!/usr/bin/env node
/**
 * Seed every site in registry over the Supabase API (storage + Postgres via REST).
 *
 * Usage (from frontend/):
 *   npm run upload:all
 */
import { spawnSync } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { loadRegistry } from './project-ports.mjs'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const registry = loadRegistry()
let failed = false

for (const site of registry) {
  console.log(`\n[upload:all] === ${site.id} ===`)
  const result = spawnSync('node', ['scripts/compile-project.mjs', '--upload'], {
    cwd: root,
    stdio: 'inherit',
    env: { ...process.env, PROJECT: site.id },
  })
  if (result.status !== 0) failed = true
}

process.exit(failed ? 1 : 0)
