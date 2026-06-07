import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
export const PROJECTS_ROOT = path.resolve(__dirname, '..')
export const REGISTRY_PATH = path.join(PROJECTS_ROOT, 'registry.json')
export const FRONTEND_ROOT = path.resolve(PROJECTS_ROOT, '../frontend')
export const BACKEND_SITES_SQL = path.resolve(PROJECTS_ROOT, '../backend/volumes/db/sites.sql')

export async function readRegistry() {
  return JSON.parse(await readFile(REGISTRY_PATH, 'utf8'))
}

export async function writeRegistry(entries) {
  await writeFile(REGISTRY_PATH, JSON.stringify(entries, null, 2) + '\n')
}

export async function readManifest(projectId) {
  const p = path.join(PROJECTS_ROOT, projectId, 'manifest.json')
  return JSON.parse(await readFile(p, 'utf8'))
}

export async function writeManifest(projectId, manifest) {
  const p = path.join(PROJECTS_ROOT, projectId, 'manifest.json')
  await writeFile(p, JSON.stringify(manifest, null, 2) + '\n')
}

export function parseArg(name) {
  const flag = process.argv.find((a) => a.startsWith(`--${name}=`))
  return flag?.slice(name.length + 3) ?? process.env[name.toUpperCase()] ?? null
}

export function siteUrlFromManifest(manifest) {
  if (!manifest.siteUrl) throw new Error('manifest.json: missing siteUrl')
  return manifest.siteUrl.replace(/\/$/, '')
}

export function hostnameFromUrl(url) {
  return new URL(url.startsWith('http') ? url : `https://${url}`).hostname
}

export async function resolveSiteUrl(site, index) {
  if (site.domain) {
    const d = site.domain.replace(/^https?:\/\//, '').replace(/\/.*$/, '')
    return `https://${d}`
  }
  const manifest = await readManifest(site.id)
  return siteUrlFromManifest(manifest)
}

export function redirectPattern(url) {
  const base = url.replace(/\/$/, '')
  return `${base}/**`
}

export async function collectRedirectUrls() {
  const registry = await readRegistry()
  const urls = new Set()
  for (let i = 0; i < registry.length; i++) {
    const url = await resolveSiteUrl(registry[i], i)
    urls.add(redirectPattern(url))
    const host = hostnameFromUrl(url)
    if (!host.startsWith('www.')) {
      urls.add(redirectPattern(`https://www.${host}`))
    }
  }
  return [...urls].sort()
}

export function printNextSteps(lines) {
  console.log('\nNext steps:')
  for (const line of lines) {
    console.log(`  • ${line}`)
  }
}
