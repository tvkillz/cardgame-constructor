#!/usr/bin/env node
import { execSync } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { resolveProjectId } from './project-paths.mjs'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const projectId = resolveProjectId()

console.log(`[build] Production hybrid: project=${projectId}`)
execSync('node scripts/assert-site-email.mjs', { cwd: root, stdio: 'inherit' })
execSync('node scripts/compile-project.mjs', {
  cwd: root,
  stdio: 'inherit',
  env: { ...process.env, PROJECT: projectId },
})
execSync('node scripts/build-game.mjs', {
  cwd: root,
  stdio: 'inherit',
  env: { ...process.env, PROJECT: projectId },
})
execSync('node scripts/build-web.mjs', {
  cwd: root,
  stdio: 'inherit',
  env: { ...process.env, PROJECT: projectId },
})
console.log('[build] Complete.')
