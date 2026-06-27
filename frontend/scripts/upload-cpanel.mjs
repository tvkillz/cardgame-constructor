#!/usr/bin/env node
/**
 * Sync dist-cpanel/{project}-cpanel/ → cPanel via rclone FTP.
 *
 * Config: frontend/deploy/cpanel.local.env (copy from cpanel.local.env.example)
 *
 * Usage (from frontend/):
 *   npm run upload:cpanel
 *   PROJECT=voidborn npm run upload:cpanel
 *   npm run upload:cpanel -- --dry-run
 */
import { createHash } from 'node:crypto'
import { execSync, spawnSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { resolveProjectId } from './project-paths.mjs'

const frontendRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const configPath = path.join(frontendRoot, 'deploy/cpanel.local.env')

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Missing ${filePath} — copy deploy/cpanel.local.env.example`)
  }
  const env = { ...process.env }
  for (const line of fs.readFileSync(filePath, 'utf8').split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eq = trimmed.indexOf('=')
    if (eq < 0) continue
    const key = trimmed.slice(0, eq).trim()
    let val = trimmed.slice(eq + 1).trim()
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1)
    }
    env[key] = val
  }
  return env
}

function obscureFtpPass(password) {
  return execSync(`rclone obscure ${JSON.stringify(password)}`, {
    encoding: 'utf8',
  }).trim()
}

function packageJsonHash(pkgPath) {
  const raw = fs.readFileSync(pkgPath, 'utf8')
  return createHash('sha256').update(raw).digest('hex').slice(0, 16)
}

function ftpRemoteUrl(remoteDir) {
  const raw = (remoteDir ?? '.').trim()
  if (!raw || raw === '.' || raw === './') return ':ftp:'
  const rel = raw.replace(/^\/+/, '').replace(/\/$/, '')
  return rel ? `:ftp:${rel}` : ':ftp:'
}

function rcloneSync({ localDir, env, dryRun }) {
  const host = env.CPANEL_FTP_HOST
  const user = env.CPANEL_FTP_USER
  const pass = env.CPANEL_FTP_PASS
  const remoteDir = env.CPANEL_FTP_REMOTE_DIR ?? '.'
  const tlsMode = (env.CPANEL_FTP_TLS ?? '0').toLowerCase()
  const port = env.CPANEL_FTP_PORT || (tlsMode === 'implicit' ? '990' : '21')

  if (!host || !user || !pass) {
    throw new Error('Set CPANEL_FTP_HOST, CPANEL_FTP_USER, CPANEL_FTP_PASS in cpanel.local.env')
  }

  const obscured = obscureFtpPass(pass)
  const remote = ftpRemoteUrl(remoteDir)

  const args = [
    'sync',
    localDir,
    remote,
    '--ftp-host',
    host,
    '--ftp-port',
    port,
    '--ftp-user',
    user,
    '--ftp-pass',
    obscured,
    '--ftp-concurrency',
    '1',
    '--retries',
    '3',
    '--low-level-retries',
    '10',
    '--exclude',
    'node_modules/**',
    '--exclude',
    '*.zip',
    '--exclude',
    '.cpanel-deps-hash',
    '--exclude',
    '.build/**/.next/cache/**',
    '--exclude',
    '.build/**/.next/diagnostics/**',
    '--exclude',
    '.build/**/.next/types/**',
    '--exclude',
    '.build/**/.next/trace',
    '-P',
  ]

  if (tlsMode === 'explicit' || tlsMode === '1' || tlsMode === 'true') {
    args.push('--ftp-explicit-tls')
    if (env.CPANEL_FTP_TLS_SKIP_VERIFY !== '0') {
      args.push('--ftp-no-check-certificate')
    }
  } else if (tlsMode === 'implicit') {
    args.push('--ftp-tls')
    if (env.CPANEL_FTP_TLS_SKIP_VERIFY !== '0') {
      args.push('--ftp-no-check-certificate')
    }
  }
  // tlsMode 0 / plain — no TLS flags (plain FTP on port 21)

  if (dryRun) {
    args.push('--dry-run')
  }

  const tlsLabel =
    tlsMode === 'implicit' ? 'ftps-implicit' : tlsMode === 'explicit' || tlsMode === '1' ? 'ftps-explicit' : 'plain'
  console.log(`[upload:cpanel] rclone sync → ftp://${host}:${port}/ (${tlsLabel}, remote=${remoteDir || '.'})`)
  const result = spawnSync('rclone', args, { stdio: 'inherit' })
  if (result.status !== 0) {
    throw new Error('rclone sync failed')
  }
}

const projectId = resolveProjectId()
const dryRun = process.argv.includes('--dry-run')
const distName = `${projectId}-cpanel`
const localDir = path.join(frontendRoot, 'dist-cpanel', distName)

if (!fs.existsSync(localDir)) {
  console.error(`[upload:cpanel] Missing ${localDir}`)
  console.error('[upload:cpanel] Run: PROJECT=%s npm run build:cpanel', projectId)
  process.exit(1)
}

const env = loadEnvFile(configPath)
const pkgPath = path.join(localDir, 'package.json')
const depsHash = fs.existsSync(pkgPath) ? packageJsonHash(pkgPath) : null
const hashPath = path.join(localDir, '.cpanel-deps-hash')
const prevHash = fs.existsSync(hashPath) ? fs.readFileSync(hashPath, 'utf8').trim() : null
const depsChanged = depsHash && depsHash !== prevHash

rcloneSync({ localDir, env, dryRun })

if (!dryRun && depsHash) {
  fs.writeFileSync(hashPath, `${depsHash}\n`)
}

console.log('')
console.log('[upload:cpanel] Done.')
if (depsChanged) {
  console.log('[upload:cpanel] package.json changed — on cPanel: Run NPM Install, then Restart')
} else {
  console.log('[upload:cpanel] On cPanel: Restart the Node.js app')
}
