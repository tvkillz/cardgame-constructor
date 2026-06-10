import { createReadStream, readFileSync } from 'node:fs'
import { stat } from 'node:fs/promises'
import path from 'node:path'

import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'

const MIME: Record<string, string> = {
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.mp4': 'video/mp4',
  '.json': 'application/json',
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.woff2': 'font/woff2',
}

type RegistrySite = { id: string }

function loadRegistry(): RegistrySite[] {
  const registryPath = path.join(process.cwd(), '../projects/registry.json')
  return JSON.parse(readFileSync(registryPath, 'utf8')) as RegistrySite[]
}

/** Resolve site id at request time (parallel pm2 must not bake PROJECT into the bundle). */
function resolveProjectId(request?: NextRequest): string {
  const host = request?.headers.get('host') ?? ''
  const hostPort = Number(host.split(':')[1] || 0)
  const port = hostPort || Number(process.env['PORT'] || 0)

  if (port > 0) {
    try {
      const registry = loadRegistry()
      const devBase = Number(process.env['PM2_DEV_PORT_BASE'] || 3000)
      const prodBase = Number(process.env['PM2_PROD_PORT_BASE'] || 3100)
      const devIdx = port - devBase
      if (devIdx >= 0 && devIdx < registry.length) return registry[devIdx].id
      const prodIdx = port - prodBase
      if (prodIdx >= 0 && prodIdx < registry.length) return registry[prodIdx].id
    } catch {
      /* registry optional in odd setups */
    }
  }

  return process.env['PROJECT'] || 'voidborn'
}

function buildRoot(request?: NextRequest): string {
  return path.join(process.cwd(), '.build', resolveProjectId(request))
}

function contentType(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase()
  return MIME[ext] ?? 'application/octet-stream'
}

async function resolveFile(segments: string[], request?: NextRequest): Promise<string | null> {
  const root = buildRoot(request)
  const rootResolved = path.resolve(root)

  let filePath: string
  if (segments.length === 1 && segments[0] === '__favicon__') {
    for (const name of ['favicon.png', 'favicon.ico', 'favicon.svg']) {
      const candidate = path.join(root, name)
      try {
        const info = await stat(candidate)
        if (info.isFile()) return path.resolve(candidate)
      } catch {
        /* try next */
      }
    }
    return null
  } else if (segments.length === 1 && segments[0] === '__apple-touch-icon__') {
    filePath = path.join(root, 'apple-touch-icon.png')
  } else if (segments.length === 1 && segments[0] === '__og-image__') {
    filePath = path.join(root, 'og-image.jpg')
  } else {
    filePath = path.join(root, ...segments)
  }

  const resolved = path.resolve(filePath)
  if (!resolved.startsWith(rootResolved)) return null

  try {
    const info = await stat(resolved)
    if (!info.isFile()) return null
    return resolved
  } catch {
    if (/\.png$/i.test(resolved)) {
      const webpCandidate = resolved.replace(/\.png$/i, '.webp')
      try {
        const webpInfo = await stat(webpCandidate)
        if (webpInfo.isFile()) return webpCandidate
      } catch {
        /* fall through */
      }
    }
    return null
  }
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ assetPath?: string[] }> },
) {
  const { assetPath = [] } = await context.params
  const file = await resolveFile(assetPath, request)

  if (!file) {
    return new NextResponse('Not found', { status: 404 })
  }

  const body = createReadStream(file)
  const headers = new Headers({
    'Content-Type': contentType(file),
    'Cache-Control': 'public, max-age=604800, stale-while-revalidate=86400',
  })

  return new NextResponse(body as unknown as BodyInit, { status: 200, headers })
}
