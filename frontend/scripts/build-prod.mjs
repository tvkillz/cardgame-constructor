#!/usr/bin/env node
import { execSync } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { resolveProjectId } from './project-paths.mjs'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const projectId = resolveProjectId()
const skipGame =
  process.argv.includes('--skip-game') || process.env.SKIP_GAME === '1'

console.log(
  `[build] Production hybrid: project=${projectId}${skipGame ? ' (skip game)' : ''}`,
)
execSync('node scripts/assert-site-email.mjs', { cwd: root, stdio: 'inherit' })
if (!process.argv.includes('--skip-compile')) {
  execSync('node scripts/compile-project.mjs', {
    cwd: root,
    stdio: 'inherit',
    env: { ...process.env, PROJECT: projectId },
  })
}
if (!skipGame) {
  execSync('node scripts/build-game.mjs', {
    cwd: root,
    stdio: 'inherit',
    env: { ...process.env, PROJECT: projectId },
  })
}
if (!process.argv.includes('--skip-web')) {
  execSync('node scripts/build-web.mjs', {
    cwd: root,
    stdio: 'inherit',
    env: { ...process.env, PROJECT: projectId },
  })
}
console.log('[build] Complete.')
