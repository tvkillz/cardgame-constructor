#!/usr/bin/env node
/**
 * Production server entry — validates hybrid build before next start.
 * Used by pm2 (voidborn-prod) so PROJECT/distDir cannot silently drift.
 */
import { spawn } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { projectDistDir } from './project-next.mjs'
import { resolveProjectId } from './project-paths.mjs'
import { prodPort, projectIndex } from './project-ports.mjs'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const projectId = resolveProjectId()
const distDir = projectDistDir(projectId)
const nextDir = path.join(root, distDir)
const buildIdPath = path.join(nextDir, 'BUILD_ID')
const devManifest = path.join(nextDir, 'static/development/_buildManifest.js')

if (!fs.existsSync(buildIdPath)) {
  console.error(`[start-prod] Missing production build: ${distDir}/BUILD_ID`)
  console.error(`[start-prod] Run: PROJECT=${projectId} npm run build`)
  process.exit(1)
}

if (fs.existsSync(devManifest)) {
  console.error(`[start-prod] Refusing to start: ${distDir} contains dev artifacts.`)
  console.error(`[start-prod] Rebuild locally and redeploy, or rm ${path.relative(root, devManifest)} on the server.`)
  process.exit(1)
}

const port = process.env.PORT || String(prodPort(projectId, projectIndex(projectId)))
const host = process.env.HOSTNAME || '0.0.0.0'

console.log(`[start-prod] project=${projectId} distDir=${distDir} http://${host}:${port}`)

const child = spawn(
  process.platform === 'win32' ? 'npx.cmd' : 'npx',
  ['next', 'start', '-H', host, '-p', port],
  {
    cwd: root,
    stdio: 'inherit',
    env: {
      ...process.env,
      NODE_ENV: 'production',
      PROJECT: projectId,
      SITE_HYBRID: '1',
      NEXT_PUBLIC_SITE_HYBRID: '1',
      PORT: port,
    },
  },
)

child.on('exit', (code, signal) => {
  if (signal) process.kill(process.pid, signal)
  process.exit(code ?? 1)
})
