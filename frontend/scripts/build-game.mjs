#!/usr/bin/env node
import { execSync } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { buildPaths, resolveProjectId } from './project-paths.mjs'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const projectId = resolveProjectId()
const out = buildPaths(projectId)

console.log(`[build:game] Project: ${projectId} → .build/${projectId}/play/`)
execSync('npx vite build --config game/vite.config.ts', {
  cwd: root,
  stdio: 'inherit',
  env: { ...process.env, PROJECT: projectId, VITE_PLAY_OUT_DIR: out.play },
})
console.log('[build:game] Done.')
