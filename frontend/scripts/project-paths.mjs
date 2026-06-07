import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export const FRONTEND_ROOT = path.resolve(__dirname, '..')
export const REPO_ROOT = path.resolve(FRONTEND_ROOT, '..')
export const PROJECTS_ROOT = path.join(REPO_ROOT, 'projects')
export const BUILD_ROOT = path.join(FRONTEND_ROOT, '.build')

/** Resolve active project id from env or CLI (--project=name). */
export function resolveProjectId(argv = process.argv) {
  const flag = argv.find((a) => a.startsWith('--project='))
  if (flag) return flag.slice('--project='.length)
  return process.env.PROJECT || 'voidborn'
}

export function projectRoot(projectId) {
  return path.join(PROJECTS_ROOT, projectId)
}

export function buildDir(projectId = resolveProjectId()) {
  return path.join(BUILD_ROOT, projectId)
}

/** Per-project compile/build artifacts (supports parallel pm2 instances). */
export function buildPaths(projectId = resolveProjectId()) {
  const root = buildDir(projectId)
  return {
    root,
    generated: path.join(root, 'generated'),
    assets: path.join(root, 'assets'),
    data: path.join(root, 'data'),
    dataThumbs: path.join(root, 'data', 'card-thumbs'),
    dataFull: path.join(root, 'data', 'card-full'),
    play: path.join(root, 'play'),
    favicon: path.join(root, 'favicon.svg'),
    next: path.join(root, '.next'),
    siteHybridMarker: path.join(root, '.site-hybrid'),
  }
}

export function projectPaths(projectId) {
  const root = projectRoot(projectId)
  return {
    root,
    manifest: path.join(root, 'manifest.json'),
    colors: path.join(root, 'theme/colors.json'),
    ui: path.join(root, 'theme/ui.json'),
    descriptions: path.join(root, 'copy/descriptions.json'),
    portal: path.join(root, 'portal/sections.json'),
    credits: path.join(root, 'credits.json'),
    auth: path.join(root, 'auth.json'),
    domains: path.join(root, 'game/domains.json'),
    categories: path.join(root, 'game/categories.json'),
    locations: path.join(root, 'game/locations.json'),
    featuredCards: path.join(root, 'game/featured-cards.json'),
    gameKeywords: path.join(root, 'game/keywords.json'),
    gameScenes: path.join(root, 'game/scenes.json'),
    gameCards: path.join(root, 'game/cards.json'),
    metadata: path.join(root, 'assets_metadata.json'),
    assets: path.join(root, 'assets'),
    legacyAssets: path.join(REPO_ROOT, 'cursor_assets', projectId),
  }
}

/** @deprecated Use buildPaths(projectId).generated */
export const GENERATED_DIR = path.join(FRONTEND_ROOT, 'src/generated')
