#!/usr/bin/env node
/**
 * Compile a content pack (projects/{id}/) into engine artifacts:
 *   - .build/{PROJECT}/generated/project-bundle.json
 *   - .build/{PROJECT}/generated/game-config.json
 *   - .build/{PROJECT}/data/cards-catalog.json
 *   - .build/{PROJECT}/assets/**
 *
 * Usage:
 *   node scripts/compile-project.mjs
 *   PROJECT=voidborn node scripts/compile-project.mjs
 *   node scripts/compile-project.mjs --project=voidborn --upload
 */
import {
  copyFile,
  mkdir,
  readFile,
  stat,
  writeFile,
} from 'node:fs/promises'
import path from 'node:path'

import {
  formatAdminEnvHint,
  loadProjectEnv,
  resolveSupabaseAdminEnv,
} from './load-project-env.mjs'
import { createAdminClient } from './supabase-admin.mjs'
import { loadProjectMetadata, siteStoragePaths } from './load-project-metadata.mjs'
import {
  buildPaths,
  FRONTEND_ROOT,
  projectPaths,
  resolveProjectId,
} from './project-paths.mjs'

const THUMB_WIDTH = 320
const BUCKET = 'cards'
const OG_WIDTH = 1200
const OG_HEIGHT = 630
const FAVICON_SIZE = 32
const APPLE_TOUCH_SIZE = 180

async function readJson(filePath, label) {
  let raw
  try {
    raw = await readFile(filePath, 'utf8')
  } catch (err) {
    throw new Error(`Missing ${label}: ${filePath} (${err.message})`)
  }
  return JSON.parse(raw)
}

async function pathExists(p) {
  try {
    await stat(p)
    return true
  } catch {
    return false
  }
}

function assetUrl(publicBase, relativePath) {
  if (!relativePath) return ''
  if (relativePath.startsWith('/') || relativePath.startsWith('http')) return relativePath
  return `${publicBase.replace(/\/$/, '')}/${relativePath.replace(/^\//, '')}`
}

function rarityFromMana(mana) {
  if (mana <= 2) return 'common'
  if (mana <= 4) return 'uncommon'
  if (mana <= 6) return 'rare'
  return 'epic'
}

function storagePublicUrl(baseUrl, bucket, objectPath) {
  const encoded = objectPath.split('/').map(encodeURIComponent).join('/')
  return `${baseUrl.replace(/\/$/, '')}/storage/v1/object/public/${bucket}/${encoded}`
}

async function readJsonOptional(filePath) {
  try {
    return await readJson(filePath, 'seo')
  } catch {
    return {}
  }
}

function buildSeoConfig(seoJson, manifest, descriptions) {
  const image = seoJson.image
  const imagePath =
    image && (image.startsWith('http') || image.startsWith('/')) ? image : '/og-image.jpg'

  return {
    title: seoJson.title ?? manifest.name.documentTitle,
    description: seoJson.description ?? descriptions.hero.subheadline,
    siteName: seoJson.siteName ?? manifest.name.display,
    imageAlt: seoJson.imageAlt ?? manifest.brand?.logoAlt ?? manifest.name.short,
    image: imagePath,
  }
}

async function generateOgFromLogo(sharp, logoPath, destPath) {
  const logoBuf = await sharp(logoPath)
    .resize(480, 480, { fit: 'inside', withoutEnlargement: false })
    .toBuffer()

  await sharp({
    create: {
      width: OG_WIDTH,
      height: OG_HEIGHT,
      channels: 3,
      background: { r: 10, g: 10, b: 12 },
    },
  })
    .composite([{ input: logoBuf, gravity: 'centre' }])
    .jpeg({ quality: 86 })
    .toFile(destPath)
}

async function buildBrandSeoAssets({ sharp, paths, manifest, seoJson, out }) {
  const logoRel = manifest.brand?.logo
  const logoPath = logoRel && !logoRel.startsWith('http') && !logoRel.startsWith('/')
    ? await resolveAssetFile(paths, logoRel)
    : null

  const customOgRel =
    seoJson.image &&
    !seoJson.image.startsWith('http') &&
    !seoJson.image.startsWith('/')
      ? seoJson.image
      : null
  const customOgPath = customOgRel ? await resolveAssetFile(paths, customOgRel) : null

  if (customOgPath) {
    const ext = path.extname(customOgPath).toLowerCase()
    if (ext === '.jpg' || ext === '.jpeg') {
      await copyFile(customOgPath, out.ogImage)
    } else if (sharp) {
      await sharp(customOgPath).resize(OG_WIDTH, OG_HEIGHT, { fit: 'cover' }).jpeg({ quality: 86 }).toFile(out.ogImage)
    } else {
      await copyFile(customOgPath, out.ogImage)
    }
  } else if (sharp && logoPath) {
    await generateOgFromLogo(sharp, logoPath, out.ogImage)
  } else if (logoPath) {
    console.warn('Brand: skipped og-image (install sharp or add copy/seo.json image path)')
  }

  if (sharp && logoPath) {
    await sharp(logoPath)
      .resize(FAVICON_SIZE, FAVICON_SIZE, { fit: 'cover' })
      .png()
      .toFile(out.faviconPng)
    await sharp(logoPath)
      .resize(APPLE_TOUCH_SIZE, APPLE_TOUCH_SIZE, { fit: 'cover' })
      .png()
      .toFile(out.appleTouchIcon)
    console.log('Brand: favicon + apple-touch-icon generated from logo')
  } else if (logoPath) {
    console.warn('Brand: skipped favicon (install sharp to generate from logo.jpg)')
  }
}

async function loadSharp() {
  try {
    return (await import('sharp')).default
  } catch {
    return null
  }
}

async function buildThumb(sharp, sourcePath, destPath) {
  await mkdir(path.dirname(destPath), { recursive: true })
  if (sharp) {
    await sharp(sourcePath)
      .resize(THUMB_WIDTH, null, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 82 })
      .toFile(destPath)
    return
  }
  const pngDest = destPath.replace(/\.webp$/, '.png')
  await copyFile(sourcePath, pngDest)
}

/** Resolve asset file on disk: projects/{id}/assets first, then cursor_assets/{id}. */
async function resolveAssetFile(paths, relativePath) {
  const candidates = [
    path.join(paths.assets, relativePath),
    path.join(paths.legacyAssets, relativePath),
  ]
  for (const candidate of candidates) {
    if (await pathExists(candidate)) return candidate
  }
  return null
}

async function copyProjectAssets(paths, manifest, out) {
  const publicBase = manifest.assets?.publicBase ?? '/assets'
  let copied = 0
  let skipped = 0

  const metadata = await loadProjectMetadata(paths)
  const assetEntries = metadata.assets ?? []

  for (const entry of assetEntries) {
    const rel = entry.path
    if (!rel) continue
    const source = await resolveAssetFile(paths, rel)
    const dest = path.join(out.assets, rel)
    if (!source) {
      skipped++
      continue
    }
    await mkdir(path.dirname(dest), { recursive: true })
    await copyFile(source, dest)
    copied++
  }

  const brandFiles = [
    manifest.brand?.logo,
    manifest.brand?.introVideo,
  ].filter(Boolean)

  for (const rel of brandFiles) {
    if (rel.startsWith('/') || rel.startsWith('http')) continue
    const source = await resolveAssetFile(paths, rel)
    const dest = path.join(out.assets, rel)
    if (!source) {
      skipped++
      continue
    }
    await mkdir(path.dirname(dest), { recursive: true })
    await copyFile(source, dest)
    copied++
  }

  console.log(`Assets: copied ${copied}, skipped ${skipped} (missing on disk)`)
  return { publicBase, metadata }
}

function buildDomainMaps(domainsJson) {
  const domainToCategory = {}
  const domainGlow = {}
  const domainLabels = {}

  for (const d of domainsJson.domains) {
    domainToCategory[d.id] = d.categoryId
    domainGlow[d.id] = d.glowColor
    domainLabels[d.id] = d.label
  }

  return { domainToCategory, domainGlow, domainLabels }
}

/** Realm ids + featured slugs from game/locations.json (source of truth). */
function buildFeaturedByLocation(locationsJson) {
  const featuredByLocation = {}
  for (const loc of locationsJson.locations) {
    featuredByLocation[loc.id] = loc.featuredCardSlug
  }
  return featuredByLocation
}

function buildCityDescriptionIndex(citiesJson) {
  const byPath = {}
  const bySlug = {}
  for (const city of citiesJson?.cities ?? []) {
    if (city.path) byPath[city.path] = city
    if (city.slug) bySlug[city.slug] = city
  }
  return { byPath, bySlug }
}

function buildCitySlidesByDomain(scenesJson, citiesJson, publicBase) {
  const { byPath, bySlug } = buildCityDescriptionIndex(citiesJson)
  const byDomain = {}

  for (const asset of scenesJson.assets ?? []) {
    if (asset.kind !== 'city' || !asset.domain || !asset.path) continue
    const override = byPath[asset.path] ?? bySlug[asset.slug] ?? {}

    const slide = {
      image: assetUrl(publicBase, asset.path),
      name: override.name ?? asset.title ?? 'Unknown City',
      description: override.description ?? asset.notes ?? '',
    }

    if (!byDomain[asset.domain]) byDomain[asset.domain] = []
    byDomain[asset.domain].push(slide)
  }

  for (const domainId of Object.keys(byDomain)) {
    byDomain[domainId].sort((a, b) => a.image.localeCompare(b.image))
  }

  return byDomain
}

function buildAppConfig({
  manifest,
  colors,
  ui,
  descriptions,
  dominionsJson,
  seoJson,
  portal,
  credits,
  auth,
  categories,
  locationsJson,
  scenesJson,
  citiesJson,
  domainGlow,
  publicBase,
  cdnBase,
}) {
  const loreLocations = {}
  for (const loc of locationsJson.locations) {
    loreLocations[loc.id] = { epithet: loc.epithet, short: loc.short.split(' — ')[0] ?? loc.short }
  }

  const categoryById = Object.fromEntries(
    categories.categories.map((cat) => [cat.id, cat.label]),
  )
  const citySlidesByDomain = buildCitySlidesByDomain(scenesJson, citiesJson, publicBase)

  const themeLocations = locationsJson.locations.map((loc) => {
    const cities =
      citySlidesByDomain[loc.domainId]?.length > 0
        ? citySlidesByDomain[loc.domainId]
        : [
            {
              image: assetUrl(publicBase, loc.imageAsset),
              name: loc.name,
              description: loc.short,
            },
          ]

    const primaryImage = loc.imageAsset
      ? assetUrl(publicBase, loc.imageAsset)
      : cities[0]?.image ?? ''

    const backgroundImage = loc.backgroundImageAsset
      ? assetUrl(publicBase, loc.backgroundImageAsset)
      : cities.find((city) => city.image !== primaryImage)?.image ??
        cities[1]?.image ??
        primaryImage

    return {
      id: loc.id,
      name: loc.name,
      categoryId: loc.categoryId,
      categoryLabel: categoryById[loc.categoryId] ?? loc.categoryId,
      domainId: loc.domainId,
      glowColor: loc.glowColor ?? domainGlow[loc.domainId] ?? '#a855f7',
      epithet: loc.epithet,
      short: loc.short,
      image: primaryImage,
      backgroundImage,
      images: cities.map((city) => city.image),
      cities,
    }
  })

  const dominionsCopy = {
    title: dominionsJson.title ?? 'The Dominions',
    description: dominionsJson.description ?? descriptions.hero.subheadline,
  }

  return {
    siteId: manifest.id,
    name: manifest.name,
    domain: {
      siteUrl: manifest.siteUrl,
      routes: manifest.routes,
      legal: manifest.legal,
      anchors: manifest.anchors,
    },
    logo: {
      src: assetUrl(publicBase, manifest.brand.logo),
      alt: manifest.brand.logoAlt ?? manifest.name.short,
      favicon: '/favicon.png',
    },
    seo: buildSeoConfig(seoJson, manifest, descriptions),
    colors,
    arts: {
      introVideo: assetUrl(publicBase, manifest.brand.introVideo),
      defaultArenaLocationId: locationsJson.defaults.arenaLocationId,
      defaultLobbyLocationId: locationsJson.defaults.lobbyLocationId,
      cardsDir: `${publicBase}/cards`,
      locationsDir: `${publicBase}/locations`,
      cdnBase: cdnBase ?? null,
    },
    descriptions: {
      ...descriptions,
      dominions: dominionsCopy,
    },
    portal,
    credits,
    auth: {
      requireSignInForPlay: auth.requireSignInForPlay ?? manifest.features?.requireSignInForPlay ?? true,
      passwordMinLength: auth.passwordMinLength ?? 8,
      usernameMinLength: auth.usernameMinLength ?? 3,
      usernameMaxLength: auth.usernameMaxLength ?? 24,
    },
    categories: categories.categories,
    theme: {
      fonts: ui.fonts,
      lore: {
        locations: loreLocations,
        global: locationsJson.lore?.global ?? {},
      },
      navigation: ui.navigation,
      accountMenu: ui.accountMenu,
      heroCtas: ui.heroCtas,
      playModes: ui.playModes,
      player: ui.player,
      particles: {
        colors: ui.particles.colors.length >= 2
          ? [ui.particles.colors[0], ui.particles.colors[1]]
          : ['#a855f7', '#ff3366'],
      },
      locations: themeLocations,
    },
  }
}

/** Map elemental domain → realm location id from game/locations.json. */
function buildLocationByDomain(locationsJson) {
  const locationByDomain = {}
  for (const loc of locationsJson.locations) {
    locationByDomain[loc.domainId] = loc.id
  }
  return locationByDomain
}

async function compileCards({
  metadata,
  paths,
  out,
  projectId,
  locationsJson,
  featuredByLocation,
  domainGlow,
  domainToCategory,
  supabaseUrl,
  shouldUpload,
}) {
  const locationByDomain = buildLocationByDomain(locationsJson)
  const cardAssets = (metadata.assets ?? []).filter(
    (a) => a.kind === 'card' && a.stats && a.ability,
  )

  const sharp = await loadSharp()
  await mkdir(out.dataThumbs, { recursive: true })
  await mkdir(out.dataFull, { recursive: true })
  await mkdir(out.data, { recursive: true })

  const catalog = []
  const bySlug = new Map()

  for (const asset of cardAssets) {
    const slug = asset.slug
    const domain = asset.domain
    const localPath = await resolveAssetFile(paths, asset.path)

    const useWebp = Boolean(sharp)
    const thumbExt = useWebp ? 'webp' : 'png'
    const { storagePath, thumbStoragePath } = siteStoragePaths(
      projectId,
      asset.path,
      domain,
      slug,
      thumbExt,
    )
    const thumbLocalRel = `/data/card-thumbs/${slug}.${thumbExt}`
    const thumbDest = path.join(out.dataThumbs, `${slug}.${thumbExt}`)

    if (localPath) {
      await buildThumb(sharp, localPath, thumbDest)
      await copyFile(localPath, path.join(out.dataFull, `${slug}.png`))
    }

    const fullLocalRel = `/data/card-full/${slug}.png`

    const record = {
      id: slug,
      slug,
      title: asset.title,
      domain,
      categoryId: domainToCategory[domain],
      role: asset.role ?? null,
      rarity: rarityFromMana(asset.stats.mana),
      stats: asset.stats,
      keywords: asset.keywords ?? [],
      ability: {
        name: asset.ability.name,
        text: asset.ability.text,
      },
      glowColor: domainGlow[domain],
      storage_bucket: BUCKET,
      storage_path: storagePath,
      thumb_storage_path: thumbStoragePath,
      thumbUrl: thumbLocalRel,
      artUrl: supabaseUrl
        ? storagePublicUrl(supabaseUrl, BUCKET, storagePath)
        : fullLocalRel,
    }

    catalog.push(record)
    bySlug.set(slug, record)
  }

  const landingCards = Object.entries(featuredByLocation).map(([locationId, slug], fanIndex) => {
    const card = bySlug.get(slug)
    if (!card) throw new Error(`Featured slug not found: ${slug} (location ${locationId})`)
    return { ...card, locationId, fanIndex }
  })

  const generatedAt = new Date().toISOString()

  await writeFile(
    path.join(out.data, 'cards-catalog.json'),
    JSON.stringify({ generatedAt, cards: catalog }, null, 2),
  )
  await writeFile(
    path.join(out.data, 'landing-cards.json'),
    JSON.stringify({ generatedAt, cards: landingCards }, null, 2),
  )

  console.log(`Cards: ${catalog.length} catalog, ${landingCards.length} landing featured`)

  if (!shouldUpload) return { catalog, bySlug, generatedAt, landingCards }

  const { supabaseUrl: url, serviceKey } = resolveSupabaseAdminEnv()
  if (!url || !serviceKey) {
    throw new Error(formatAdminEnvHint())
  }

  const supabase = createAdminClient(url, serviceKey)

  for (const card of catalog) {
    const localRel = card.storage_path.startsWith(`${projectId}/`)
      ? card.storage_path.slice(projectId.length + 1)
      : card.storage_path
    const fullPath = await resolveAssetFile(paths, localRel)
    if (!fullPath) {
      console.warn(`Skip upload (no file): ${card.slug}`)
      continue
    }

    const thumbExt = card.thumb_storage_path.endsWith('.webp') ? 'webp' : 'png'
    const thumbPath = path.join(out.dataThumbs, `${card.slug}.${thumbExt}`)

    const fullBuf = await readFile(fullPath)
    const { error: fullErr } = await supabase.storage
      .from(BUCKET)
      .upload(card.storage_path, fullBuf, { contentType: 'image/png', upsert: true })
    if (fullErr) throw new Error(`Upload full ${card.slug}: ${fullErr.message}`)

    if (await pathExists(thumbPath)) {
      const thumbBuf = await readFile(thumbPath)
      const thumbContentType = thumbExt === 'webp' ? 'image/webp' : 'image/png'
      const { error: thumbErr } = await supabase.storage
        .from(BUCKET)
        .upload(card.thumb_storage_path, thumbBuf, {
          contentType: thumbContentType,
          upsert: true,
        })
      if (thumbErr) throw new Error(`Upload thumb ${card.slug}: ${thumbErr.message}`)
    }

    card.artUrl = storagePublicUrl(url, BUCKET, card.storage_path)
    card.thumbUrl = storagePublicUrl(url, BUCKET, card.thumb_storage_path)
  }

  await writeFile(
    path.join(out.data, 'cards-catalog.json'),
    JSON.stringify({ generatedAt, cards: catalog }, null, 2),
  )
  await writeFile(
    path.join(out.data, 'landing-cards.json'),
    JSON.stringify({ generatedAt, cards: landingCards }, null, 2),
  )

  for (const card of catalog) {
    const row = {
      site_id: projectId,
      slug: card.slug,
      title: card.title,
      domain: card.domain,
      location_id: locationByDomain[card.domain] ?? null,
      role: card.role,
      rarity: card.rarity,
      mana: card.stats.mana,
      attack: card.stats.attack,
      health: card.stats.health,
      keywords: card.keywords,
      ability_name: card.ability.name,
      ability_text: card.ability.text,
      storage_bucket: BUCKET,
      storage_path: card.storage_path,
      thumb_storage_path: card.thumb_storage_path,
      glow_color: card.glowColor,
      published: true,
      updated_at: new Date().toISOString(),
    }

    const { data: upserted, error } = await supabase
      .from('cards')
      .upsert(row, { onConflict: 'site_id,slug' })
      .select('id')
      .single()

    if (error) throw new Error(`DB upsert ${card.slug}: ${error.message}`)
    card.dbId = upserted.id
    bySlug.set(card.slug, { ...card, dbId: upserted.id })
  }

  for (const [locationId, slug] of Object.entries(featuredByLocation)) {
    const card = bySlug.get(slug)
    if (!card?.dbId) continue
    const { error } = await supabase.from('location_featured_cards').upsert(
      {
        site_id: projectId,
        location_id: locationId,
        card_id: card.dbId,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'site_id,location_id' },
    )
    if (error) throw new Error(`Featured ${locationId}: ${error.message}`)
  }

  console.log('Uploaded art + synced Postgres (cards, location_featured_cards).')
  return { catalog, bySlug, generatedAt, landingCards }
}

function validateProject(manifest, domainsJson, locationsJson, categories, portal) {
  if (!manifest.id) throw new Error('manifest.json: missing id')
  if (!manifest.name?.display) throw new Error('manifest.json: missing name.display')
  if (!manifest.routes?.home) throw new Error('manifest.json: missing routes')

  const requiredPortalSections = [
    'store',
    'market',
    'vaults',
    'collection',
    'transactions',
    'profile',
  ]
  const portalIds = new Set((portal.sections ?? []).map((s) => s.id))
  for (const id of requiredPortalSections) {
    if (!portalIds.has(id)) {
      throw new Error(`portal/sections.json: missing required section "${id}"`)
    }
  }

  const domainIds = new Set(domainsJson.domains.map((d) => d.id))
  const locationIds = new Set()

  for (const loc of locationsJson.locations) {
    if (!loc.id || !loc.name) {
      throw new Error(`locations.json: each location needs id and name`)
    }
    if (domainIds.has(loc.id)) {
      throw new Error(
        `locations.json: location id "${loc.id}" is a domain id — use realm ids (e.g. kronos, thalassa), not terra/aqua/ignis/zephyr`,
      )
    }
    if (!domainIds.has(loc.domainId)) {
      throw new Error(
        `locations.json: location "${loc.id}" references unknown domain "${loc.domainId}"`,
      )
    }
    if (!loc.featuredCardSlug) {
      throw new Error(`locations.json: location "${loc.id}" missing featuredCardSlug`)
    }
    locationIds.add(loc.id)
  }

  for (const cat of categories?.categories ?? []) {
    for (const locId of cat.locationIds ?? []) {
      if (!locationIds.has(locId)) {
        throw new Error(
          `categories.json: category "${cat.id}" references unknown location "${locId}"`,
        )
      }
      if (domainIds.has(locId)) {
        throw new Error(
          `categories.json: locationIds must use realm ids (kronos, …), not domain ids (terra, …)`,
        )
      }
    }
  }
}

async function main() {
  const projectId = resolveProjectId()
  const shouldUpload = process.argv.includes('--upload')
  const paths = projectPaths(projectId)

  console.log(`[compile] Project: ${projectId}`)
  console.log(`[compile] Source: ${paths.root}`)

  if (shouldUpload) {
    await loadProjectEnv()
  }

  const manifest = await readJson(paths.manifest, 'manifest')
  const colors = await readJson(paths.colors, 'theme/colors')
  const ui = await readJson(paths.ui, 'theme/ui')
  const descriptions = await readJson(paths.descriptions, 'copy/descriptions')
  const dominionsJson = await readJsonOptional(paths.dominions)
  const seoJson = await readJsonOptional(paths.seo)
  const portal = await readJson(paths.portal, 'portal/sections')
  const credits = await readJson(paths.credits, 'credits')
  const auth = await readJson(paths.auth, 'auth')
  const domainsJson = await readJson(paths.domains, 'game/domains')
  const categories = await readJson(paths.categories, 'game/categories')
  const locationsJson = await readJson(paths.locations, 'game/locations')
  const scenesJson = await readJson(paths.gameScenes, 'game/scenes')
  const citiesJson = await readJsonOptional(paths.gameCities)

  const out = buildPaths(projectId)

  validateProject(manifest, domainsJson, locationsJson, categories, portal)

  const featuredByLocation = buildFeaturedByLocation(locationsJson)

  const { domainToCategory, domainGlow } = buildDomainMaps(domainsJson)
  const sharp = await loadSharp()
  const { publicBase, metadata } = await copyProjectAssets(paths, manifest, out)
  await buildBrandSeoAssets({ sharp, paths, manifest, seoJson, out })
  if (metadata.source === 'split') {
    console.log('Metadata: split (game/cards.json + game/scenes.json + game/keywords.json)')
  } else {
    console.log('Metadata: legacy assets_metadata.json (run npm run metadata:split to split)')
  }

  const cdnBase = manifest.assets?.cdnBase ?? null
  const { supabaseUrl } = shouldUpload
    ? resolveSupabaseAdminEnv()
    : { supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_PUBLIC_URL || '' }

  const appConfig = buildAppConfig({
    manifest,
    colors,
    ui,
    descriptions,
    dominionsJson,
    seoJson,
    portal,
    credits,
    auth,
    categories,
    locationsJson,
    scenesJson,
    citiesJson,
    domainGlow,
    publicBase,
    cdnBase,
  })

  await compileCards({
    metadata,
    paths,
    out,
    projectId,
    locationsJson,
    featuredByLocation,
    domainGlow,
    domainToCategory,
    supabaseUrl,
    shouldUpload,
  })

  const gameConfig = {
    projectId,
    domains: domainsJson.domains,
    domainToCategory,
    domainGlow,
    featuredByLocation,
    keywords: metadata.keywords_glossary ?? {},
    locationOrder: locationsJson.locations.map((l) => l.id),
  }

  await mkdir(out.generated, { recursive: true })

  const meta = {
    projectId,
    compiledAt: new Date().toISOString(),
    sourceRoot: path.relative(FRONTEND_ROOT, paths.root),
    buildRoot: path.relative(FRONTEND_ROOT, out.root),
  }

  await writeFile(
    path.join(out.generated, 'project-bundle.json'),
    JSON.stringify(appConfig, null, 2),
  )
  await writeFile(
    path.join(out.generated, 'game-config.json'),
    JSON.stringify(gameConfig, null, 2),
  )
  await writeFile(
    path.join(out.generated, 'project-meta.json'),
    JSON.stringify(meta, null, 2),
  )

  console.log(`[compile] Wrote .build/${projectId}/generated/project-bundle.json`)
  console.log(`[compile] Wrote .build/${projectId}/generated/game-config.json`)
  console.log(`[compile] Done.`)
}

main().catch((err) => {
  console.error('[compile]', err.message ?? err)
  process.exit(1)
})
