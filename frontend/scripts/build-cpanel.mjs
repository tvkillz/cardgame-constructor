#!/usr/bin/env node
/**
 * Build a self-contained folder for cPanel Node.js (no pm2, no SSH).
 * Output: frontend/dist-cpanel/{project}-cpanel/
 *
 * - Next build lives at .build/{project}/.next (custom distDir)
 * - node_modules omitted — run NPM Install on cPanel after upload
 * - Showcase card webp baked for landing (4 hero + 8 collection); full catalog in Supabase
 * - Zips only `.build/` (upload server.js + package.json + _next-server.js separately)
 *
 * Usage (from frontend/):
 *   npm run build:cpanel
 *   PROJECT=voidborn npm run build:cpanel
 */
import { execSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { buildPaths, resolveProjectId } from './project-paths.mjs'
import { projectDistDir } from './project-next.mjs'

const frontendRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const projectId = resolveProjectId()
const distName = `${projectId}-cpanel`
const deployRoot = path.join(frontendRoot, 'dist-cpanel', distName)

function rmrf(dir) {
  if (fs.existsSync(dir)) fs.rmSync(dir, { recursive: true, force: true })
}

function copyTree(src, dest) {
  fs.mkdirSync(path.dirname(dest), { recursive: true })
  fs.cpSync(src, dest, { recursive: true })
}

function dirSizeBytes(dir) {
  let total = 0
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) total += dirSizeBytes(full)
    else total += fs.statSync(full).size
  }
  return total
}

function formatMb(bytes) {
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function writeCpanelServer(targetRoot, id) {
  const contents = `#!/usr/bin/env node
'use strict';
/**
 * cPanel Node.js startup — ${id}
 * Set NEXT_PUBLIC_* vars in the cPanel Node.js app panel (not in this file).
 */
process.env.NODE_ENV = 'production';
process.env.PROJECT = process.env.PROJECT || '${id}';
process.env.SITE_HYBRID = '1';
process.env.NEXT_PUBLIC_SITE_HYBRID = '1';
process.env.SITE_AUTH_DISABLED = '1';
process.env.HOSTNAME = process.env.HOSTNAME || '0.0.0.0';
require('./_next-server.js');
`
  fs.writeFileSync(path.join(targetRoot, 'server.js'), contents, { mode: 0o755 })
}

function writeCpanelPackage(targetRoot, id, standaloneDir) {
  let dependencies = {}
  const standalonePkgPath = path.join(standaloneDir, 'package.json')
  if (fs.existsSync(standalonePkgPath)) {
    const standalonePkg = JSON.parse(fs.readFileSync(standalonePkgPath, 'utf8'))
    dependencies = standalonePkg.dependencies ?? {}
  }

  const pkg = {
    name: `${id}-cpanel`,
    private: true,
    version: '1.0.0',
    type: 'commonjs',
    engines: { node: '>=20' },
    main: 'server.js',
    scripts: { start: 'node server.js' },
    dependencies,
  }
  fs.writeFileSync(path.join(targetRoot, 'package.json'), `${JSON.stringify(pkg, null, 2)}\n`)
}

function copyNextBuild(srcDir, destDir) {
  const skip = new Set(['standalone', 'cache', 'diagnostics', 'types', 'trace'])
  fs.mkdirSync(destDir, { recursive: true })
  for (const entry of fs.readdirSync(srcDir, { withFileTypes: true })) {
    if (skip.has(entry.name)) continue
    copyTree(path.join(srcDir, entry.name), path.join(destDir, entry.name))
  }
}

function copyBuildArtifacts(buildSrc, buildDest) {
  fs.mkdirSync(buildDest, { recursive: true })
  for (const entry of fs.readdirSync(buildSrc, { withFileTypes: true })) {
    if (entry.name === '.next') continue
    copyTree(path.join(buildSrc, entry.name), path.join(buildDest, entry.name))
  }
}

/** Drop source card PNGs and redundant JSON on disk (already in the JS bundle). Keep showcase webp. */
function pruneCpanelDeployAssets(buildDest, rootForLog) {
  const targets = [
    path.join(buildDest, 'assets', 'cards'),
    path.join(buildDest, 'data', 'cards-catalog.json'),
    path.join(buildDest, 'data', 'landing-cards.json'),
  ]

  for (const target of targets) {
    if (!fs.existsSync(target)) continue
    rmrf(target)
    console.log(`[build:cpanel] Pruned ${path.relative(rootForLog, target)}`)
  }
}

function maybeZipDir(sourceDir, zipPath) {
  if (!fs.existsSync(sourceDir)) return false
  try {
    const parent = path.dirname(sourceDir)
    const base = path.basename(sourceDir)
    execSync(`zip -rq ${JSON.stringify(zipPath)} ${JSON.stringify(base)}`, {
      cwd: parent,
      stdio: 'inherit',
    })
    return true
  } catch {
    console.warn('[build:cpanel] zip not available — upload .build/ manually')
    return false
  }
}

console.log(`[build:cpanel] project=${projectId}`)

execSync('node scripts/build-prod.mjs', {
  cwd: frontendRoot,
  stdio: 'inherit',
  env: { ...process.env, PROJECT: projectId, CPANEL_BUILD: '1' },
})

const nextDir = path.join(frontendRoot, projectDistDir(projectId))
const standaloneDir = path.join(nextDir, 'standalone')
const standaloneServer = path.join(standaloneDir, 'server.js')

if (!fs.existsSync(standaloneServer)) {
  console.error(`[build:cpanel] Missing ${standaloneServer}`)
  console.error('[build:cpanel] Re-run with CPANEL_BUILD=1 (next.config output: standalone)')
  process.exit(1)
}

rmrf(deployRoot)
fs.mkdirSync(deployRoot, { recursive: true })

const cpanelNextDest = path.join(deployRoot, '.build', projectId, '.next')
copyNextBuild(nextDir, cpanelNextDest)

copyTree(standaloneServer, path.join(deployRoot, '_next-server.js'))

const buildSrc = buildPaths(projectId).root
const buildDest = path.join(deployRoot, '.build', projectId)
copyBuildArtifacts(buildSrc, buildDest)
pruneCpanelDeployAssets(buildDest, deployRoot)

const buildIdPath = path.join(cpanelNextDest, 'BUILD_ID')
if (!fs.existsSync(buildIdPath)) {
  console.error(`[build:cpanel] Missing ${buildIdPath}`)
  process.exit(1)
}
console.log(`[build:cpanel] Verified ${projectDistDir(projectId)}/BUILD_ID in deploy bundle`)

writeCpanelServer(deployRoot, projectId)
writeCpanelPackage(deployRoot, projectId, standaloneDir)

const readmeSrc = path.join(frontendRoot, 'deploy/cpanel/README.md')
if (fs.existsSync(readmeSrc)) {
  fs.copyFileSync(readmeSrc, path.join(deployRoot, 'SETUP.md'))
}

const distCpanelRoot = path.dirname(deployRoot)
const buildZipPath = path.join(distCpanelRoot, `${distName}-build.zip`)
rmrf(buildZipPath)
const buildDir = path.join(deployRoot, '.build')
const zipped =
  process.env.CPANEL_NO_ZIP === '1' ? false : maybeZipDir(buildDir, buildZipPath)

console.log('')
console.log('[build:cpanel] Done.')
console.log(`  Folder: ${deployRoot} (${formatMb(dirSizeBytes(deployRoot))})`)
console.log(`  .build: ${buildDir} (${formatMb(dirSizeBytes(buildDir))})`)
if (zipped) {
  console.log(`  Zip:    ${buildZipPath} (.build only — ${formatMb(fs.statSync(buildZipPath).size)})`)
} else {
  console.log('  Zip:    skipped (set CPANEL_NO_ZIP=0 or unset to zip .build/)')
}
console.log('  Upload separately: server.js, package.json, _next-server.js')
console.log(`  Then extract ${distName}-build.zip into the app root (merges .build/)`)
console.log('  node_modules not included — run NPM Install on cPanel after upload.')
console.log('  See SETUP.md in the output folder for cPanel upload steps.')

if (process.argv.includes('--upload')) {
  execSync('node scripts/upload-cpanel.mjs', {
    cwd: frontendRoot,
    stdio: 'inherit',
    env: { ...process.env, PROJECT: projectId },
  })
}
