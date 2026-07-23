#!/usr/bin/env node
/**
 * Local landing gate (repo root):
 *   1) BUILD_SCOPE=landing for voidborn + iyashikei
 *   2) start production servers on registry ports
 *   3) playwright tests/landing
 *   4) stop servers
 *
 *   node scripts/test-landing.mjs
 *   npm run test:landing   (if root package.json present)
 */
import { spawn, spawnSync } from 'node:child_process'
import http from 'node:http'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const frontendDir = path.join(root, 'frontend')
const uiTestsDir = path.join(root, 'ui-tests')

/** Sites under test — project2 excluded. Ports = 3100 + registry index. */
const SITES = [
  { id: 'voidborn', port: 3100 },
  { id: 'iyashikei', port: 3102 },
]

const children = []

function log(msg) {
  console.log(`[test:landing] ${msg}`)
}

function run(cmd, args, opts = {}) {
  const result = spawnSync(cmd, args, {
    stdio: 'inherit',
    ...opts,
  })
  if (result.status !== 0) {
    throw new Error(`${cmd} ${args.join(' ')} exited ${result.status ?? 'signal'}`)
  }
}

function waitForHttp(port, { timeoutMs = 120_000, intervalMs = 500 } = {}) {
  const deadline = Date.now() + timeoutMs
  return new Promise((resolve, reject) => {
    const tryOnce = () => {
      const req = http.get({ host: '127.0.0.1', port, path: '/', timeout: 3000 }, (res) => {
        res.resume()
        // 200 OK, or anything that means Next is up (not connection refused)
        if (res.statusCode && res.statusCode < 500) {
          resolve(res.statusCode)
          return
        }
        if (Date.now() > deadline) {
          reject(new Error(`http://127.0.0.1:${port}/ still ${res.statusCode}`))
          return
        }
        setTimeout(tryOnce, intervalMs)
      })
      req.on('error', () => {
        if (Date.now() > deadline) {
          reject(new Error(`Timed out waiting for http://127.0.0.1:${port}/`))
          return
        }
        setTimeout(tryOnce, intervalMs)
      })
    }
    tryOnce()
  })
}

function startProd(site) {
  log(`Starting ${site.id}-prod on :${site.port}`)
  const child = spawn('node', ['scripts/start-prod.mjs'], {
    cwd: frontendDir,
    stdio: ['ignore', 'inherit', 'inherit'],
    env: {
      ...process.env,
      PROJECT: site.id,
      PORT: String(site.port),
      HOSTNAME: '127.0.0.1',
      NODE_ENV: 'production',
      SITE_AUTH_DISABLED: '1',
      SITE_HYBRID: '1',
      NEXT_PUBLIC_SITE_HYBRID: '1',
    },
  })
  children.push({ site, child })
  child.on('exit', (code, signal) => {
    if (code || signal) {
      log(`${site.id}-prod exited code=${code} signal=${signal}`)
    }
  })
}

function stopAll() {
  for (const { site, child } of children.splice(0)) {
    if (child.killed || child.exitCode != null) continue
    log(`Stopping ${site.id}-prod`)
    try {
      child.kill('SIGTERM')
    } catch {
      /* already gone */
    }
    setTimeout(() => {
      if (child.exitCode == null && !child.killed) {
        try {
          child.kill('SIGKILL')
        } catch {
          /* ignore */
        }
      }
    }, 3000).unref?.()
  }
}

async function main() {
  process.on('SIGINT', () => {
    stopAll()
    process.exit(130)
  })
  process.on('SIGTERM', () => {
    stopAll()
    process.exit(143)
  })

  try {
    for (const site of SITES) {
      log(`Building landing: ${site.id}`)
      run('npm', ['run', 'build', '--', '--only-landing'], {
        cwd: frontendDir,
        env: {
          ...process.env,
          PROJECT: site.id,
          BUILD_SCOPE: 'landing',
        },
      })
    }

    for (const site of SITES) {
      startProd(site)
    }

    for (const site of SITES) {
      log(`Waiting for http://127.0.0.1:${site.port}/`)
      const status = await waitForHttp(site.port)
      log(`${site.id} ready (HTTP ${status})`)
    }

    log('Running Playwright: tests/landing')
    run('npx', ['playwright', 'test', 'tests/landing'], {
      cwd: uiTestsDir,
    })

    log('OK')
  } finally {
    stopAll()
  }
}

main().catch((err) => {
  console.error(`[test:landing] ${err.message || err}`)
  stopAll()
  process.exit(1)
})
