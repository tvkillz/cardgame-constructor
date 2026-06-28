#!/usr/bin/env node
/**
 * Next.js static export (output: 'export') for cPanel public_html deploy.
 * Stages compile artifacts into public/, then exports to frontend/out/.
 */
import { execSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { hybridBuildEnv } from './site-hybrid.mjs'
import { buildPaths, resolveProjectId } from './project-paths.mjs'
import { projectDistDir, staticExportDir } from './project-next.mjs'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const projectId = resolveProjectId()
const out = buildPaths(projectId)
const cacheDir = path.join(root, '.cache/cpanel-static-build')

const playPagePath = path.join(root, 'src/app/play/page.tsx')
const playPageBackup = path.join(cacheDir, 'play-page.dev-backup.tsx')
const middlewarePath = path.join(root, 'src/middleware.ts')
const middlewareBackup = path.join(cacheDir, 'middleware.ts.bak')
const apiStaticDir = path.join(root, 'src/app/api/site-static')
const apiStaticBackup = path.join(cacheDir, 'api-site-static.bak')
const publicDir = path.join(root, 'public')
const publicBackup = path.join(cacheDir, 'public.bak')
const exportDir = staticExportDir(projectId, root)

function rmrf(dir) {
  if (fs.existsSync(dir)) fs.rmSync(dir, { recursive: true, force: true })
}

function copyTree(src, dest) {
  fs.mkdirSync(path.dirname(dest), { recursive: true })
  fs.cpSync(src, dest, { recursive: true })
}

function backupPath(src, backup) {
  if (!fs.existsSync(src)) return
  fs.mkdirSync(path.dirname(backup), { recursive: true })
  rmrf(backup)
  fs.renameSync(src, backup)
}

function restorePath(src, backup) {
  if (!fs.existsSync(backup)) return
  if (fs.existsSync(src)) rmrf(src)
  fs.mkdirSync(path.dirname(src), { recursive: true })
  fs.renameSync(backup, src)
}

function removePlayPageForHybridBuild() {
  if (!fs.existsSync(playPagePath)) return
  backupPath(playPagePath, playPageBackup)
  console.log('[build:web-static] Removed src/app/play/page.tsx (Vite bundle served from /play/)')
}

function restorePlayPage() {
  restorePath(playPagePath, playPageBackup)
  if (fs.existsSync(playPagePath)) {
    console.log('[build:web-static] Restored src/app/play/page.tsx')
  }
}

function removeStaticExportBlockers() {
  backupPath(middlewarePath, middlewareBackup)
  backupPath(apiStaticDir, apiStaticBackup)
  if (fs.existsSync(middlewareBackup)) {
    console.log('[build:web-static] Removed src/middleware.ts (not supported with static export)')
  }
  if (fs.existsSync(apiStaticBackup)) {
    console.log('[build:web-static] Removed src/app/api/site-static (assets staged in public/)')
  }
}

function restoreStaticExportBlockers() {
  restorePath(middlewarePath, middlewareBackup)
  restorePath(apiStaticDir, apiStaticBackup)
}

function cleanNextOutput() {
  const nextDir = path.join(root, out.next)
  if (fs.existsSync(nextDir)) {
    fs.rmSync(nextDir, { recursive: true, force: true })
    console.log(`[build:web-static] Cleared ${projectDistDir(projectId)}/.next`)
  }

  const webpackCacheDir = path.join(root, '.build', projectId, '.webpack-cache')
  if (fs.existsSync(webpackCacheDir)) {
    fs.rmSync(webpackCacheDir, { recursive: true, force: true })
  }
}

function pruneStagedPublicAssets() {
  const targets = [
    path.join(publicDir, 'assets', 'cards'),
    path.join(publicDir, 'data', 'cards-catalog.json'),
    path.join(publicDir, 'data', 'landing-cards.json'),
  ]

  for (const target of targets) {
    if (!fs.existsSync(target)) continue
    rmrf(target)
    console.log(`[build:web-static] Pruned public/${path.relative(publicDir, target)}`)
  }
}

function stagePublicAssets() {
  if (fs.existsSync(publicDir)) {
    backupPath(publicDir, publicBackup)
  } else {
    fs.mkdirSync(publicDir, { recursive: true })
  }

  copyTree(out.assets, path.join(publicDir, 'assets'))
  copyTree(out.data, path.join(publicDir, 'data'))

  for (const name of [
    'favicon.png',
    'favicon.ico',
    'favicon.svg',
    'apple-touch-icon.png',
    'og-image.jpg',
  ]) {
    const src = path.join(out.root, name)
    if (fs.existsSync(src)) {
      fs.copyFileSync(src, path.join(publicDir, name))
    }
  }

  pruneStagedPublicAssets()
  console.log('[build:web-static] Staged compile artifacts into public/')
}

function restorePublicDir() {
  if (fs.existsSync(publicBackup)) {
    rmrf(publicDir)
    restorePath(publicDir, publicBackup)
    console.log('[build:web-static] Restored public/')
    return
  }
  if (fs.existsSync(publicDir)) {
    rmrf(publicDir)
    console.log('[build:web-static] Removed staged public/')
  }
}

function verifyExportOutput() {
  const indexHtml = path.join(exportDir, 'index.html')
  if (!fs.existsSync(indexHtml)) {
    throw new Error(`[build:web-static] Missing ${indexHtml} — static export failed`)
  }

  const portalMarket = path.join(exportDir, 'portal/market/index.html')
  if (!fs.existsSync(portalMarket)) {
    throw new Error(`[build:web-static] Missing ${portalMarket}`)
  }

  const authCallback = path.join(exportDir, 'auth/callback/index.html')
  if (!fs.existsSync(authCallback)) {
    throw new Error(`[build:web-static] Missing ${authCallback}`)
  }

  console.log('[build:web-static] Verified index.html, portal/market, auth/callback')
}

function verifyPlayBundle() {
  const indexHtml = path.join(out.play, 'index.html')
  if (!fs.existsSync(indexHtml)) {
    throw new Error(`[build:web-static] ${indexHtml} missing — run build:game first`)
  }
  console.log(`[build:web-static] Verified .build/${projectId}/play/index.html`)
}

console.log(`[build:web-static] Project: ${projectId}`)

cleanNextOutput()
removePlayPageForHybridBuild()
removeStaticExportBlockers()
stagePublicAssets()

try {
  execSync('npx next build', {
    cwd: root,
    stdio: 'inherit',
    env: hybridBuildEnv({
      ...process.env,
      PROJECT: projectId,
      CPANEL_STATIC: '1',
      SITE_AUTH_DISABLED: '1',
    }),
  })
  verifyExportOutput()
  verifyPlayBundle()
} finally {
  restorePublicDir()
  restoreStaticExportBlockers()
  restorePlayPage()
}

console.log(`[build:web-static] Export ready: ${exportDir}`)
