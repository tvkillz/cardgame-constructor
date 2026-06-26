#!/usr/bin/env node
/**
 * Compile a content pack (projects/{id}/) into engine artifacts:
 *   - .build/{PROJECT}/generated/project-bundle.json
 *   - .build/{PROJECT}/generated/game-config.json
 *   - .build/{PROJECT}/assets/** (brand, domains, cities — not card catalog PNGs)
 *   - .build/{PROJECT}/data/cards-catalog.json (+ optional local showcase thumbs)
 *
 * Usage:
 *   node scripts/compile-project.mjs
 *   PROJECT=voidborn node scripts/compile-project.mjs
 *   node scripts/compile-project.mjs --project=voidborn --upload
 */
import {
  copyFile,
  mkdir,
  readdir,
  readFile,
  stat,
  unlink,
  writeFile,
} from 'node:fs/promises'
import path from 'node:path'

import {
  formatAdminEnvHint,
  loadProjectEnv,
  resolveSupabaseAdminEnv,
} from './load-project-env.mjs'
import {
  ensureFullArtStorage,
  ensureStorageObject,
  legacyFullStoragePath,
  legacyThumbStoragePath,
  upsertCardRow,
  upsertFeaturedCard,
} from './card-upload.mjs'
import { createAdminClient } from './supabase-admin.mjs'
import { loadProjectMetadata, siteStoragePaths } from './load-project-metadata.mjs'
import {
  buildPaths,
  FRONTEND_ROOT,
  projectPaths,
  resolveProjectId,
} from './project-paths.mjs'

const THUMB_WIDTH = 320
const WEBP_QUALITY = 82
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

const RASTER_EXT = /\.(png|jpe?g)$/i

function isConvertibleRaster(relativePath) {
  return Boolean(relativePath && RASTER_EXT.test(relativePath))
}

/** Published site path — raster PNG/JPEG are served as WebP from compile output. */
function toWebpRelativePath(relativePath) {
  if (!relativePath || !isConvertibleRaster(relativePath)) return relativePath
  return relativePath.replace(RASTER_EXT, '.webp')
}

async function writeCompiledAsset(sharp, sourcePath, rel, assetsRoot) {
  const destRel = toWebpRelativePath(rel)
  const dest = path.join(assetsRoot, destRel)
  await mkdir(path.dirname(dest), { recursive: true })

  if (isConvertibleRaster(rel) && sharp) {
    await sharp(sourcePath).webp({ quality: WEBP_QUALITY }).toFile(dest)
    return destRel
  }

  await copyFile(sourcePath, dest)
  return destRel
}

function rarityFromMana(mana) {
  if (mana <= 2) return 'common'
  if (mana <= 4) return 'uncommon'
  if (mana <= 6) return 'rare'
  return 'epic'
}

/** Shop price in cents — optional in game/cards.json (`priceCents` or `priceEur`). */
function resolvePriceCents(asset) {
  if (typeof asset.priceCents === 'number' && asset.priceCents >= 0) return asset.priceCents
  if (typeof asset.price_cents === 'number' && asset.price_cents >= 0) return asset.price_cents
  if (typeof asset.priceEur === 'number' && asset.priceEur >= 0) {
    return Math.round(asset.priceEur * 100)
  }
  return null
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
      .webp({ quality: WEBP_QUALITY })
      .toFile(destPath)
    return
  }
  const pngDest = destPath.replace(/\.webp$/, '.png')
  await copyFile(sourcePath, pngDest)
}

async function buildFullArt(sharp, sourcePath, destPath) {
  await mkdir(path.dirname(destPath), { recursive: true })
  if (!sharp) {
    throw new Error('sharp is required to compile card full art as WebP (npm install in frontend/)')
  }
  await sharp(sourcePath).webp({ quality: WEBP_QUALITY }).toFile(destPath)
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

async function copyProjectAssets(paths, manifest, out, sharp) {
  const publicBase = manifest.assets?.publicBase ?? '/assets'
  let copied = 0
  let converted = 0
  let skipped = 0

  const metadata = await loadProjectMetadata(paths)
  const assetEntries = metadata.assets ?? []

  for (const entry of assetEntries) {
    const rel = entry.path
    if (!rel) continue
    if (entry.kind === 'card') continue
    const source = await resolveAssetFile(paths, rel)
    if (!source) {
      skipped++
      continue
    }
    const destRel = await writeCompiledAsset(sharp, source, rel, out.assets)
    copied++
    if (destRel !== rel) converted++
  }

  const brandFiles = [
    manifest.brand?.logo,
    manifest.brand?.introVideo,
  ].filter(Boolean)

  for (const rel of brandFiles) {
    if (rel.startsWith('/') || rel.startsWith('http')) continue
    const source = await resolveAssetFile(paths, rel)
    if (!source) {
      skipped++
      continue
    }
    const destRel = await writeCompiledAsset(sharp, source, rel, out.assets)
    copied++
    if (destRel !== rel) converted++
  }

  const convertNote = converted > 0 ? `, ${converted} raster→webp` : ''
  const sharpNote = sharp ? '' : ' (sharp missing — rasters copied as-is)'
  console.log(`Assets: copied ${copied}, skipped ${skipped}${convertNote}${sharpNote}`)
  return { publicBase, metadata }
}

async function copyPathwaysAssets(paths, pathwaysJson, out, sharp) {
  let copied = 0
  let skipped = 0

  for (const feature of pathwaysJson?.features ?? []) {
    const rel = feature.image
    if (!rel || rel.startsWith('/') || rel.startsWith('http')) continue
    const source = await resolveAssetFile(paths, rel)
    if (!source) {
      skipped++
      continue
    }
    await writeCompiledAsset(sharp, source, rel, out.assets)
    copied++
  }

  if (copied > 0 || skipped > 0) {
    console.log(`Pathways: copied ${copied}, skipped ${skipped} (missing on disk)`)
  }
}

async function copyGamemodelAssets(paths, gamemodelJson, out, sharp) {
  let copied = 0
  let skipped = 0

  for (const pillar of gamemodelJson?.pillars ?? []) {
    const rel = pillar.image
    if (!rel || rel.startsWith('/') || rel.startsWith('http')) continue
    const source = await resolveAssetFile(paths, rel)
    if (!source) {
      skipped++
      continue
    }
    await writeCompiledAsset(sharp, source, rel, out.assets)
    copied++
  }

  if (copied > 0 || skipped > 0) {
    console.log(`Gamemodel: copied ${copied}, skipped ${skipped} (missing on disk)`)
  }
}

/** Baked frontend JSON — served from `.build/{id}/data/` via site-static (not Storage CDN). */
function showcaseLocalArtUrls(card) {
  const fullExt = card.storage_path.endsWith('.webp') ? 'webp' : 'png'
  const thumbExt = card.thumb_storage_path.endsWith('.webp') ? 'webp' : 'png'
  return {
    artUrl: `/data/card-full/${card.slug}.${fullExt}`,
    thumbUrl: `/data/card-thumbs/${card.slug}.${thumbExt}`,
  }
}

function applyShowcaseLocalArt(card) {
  Object.assign(card, showcaseLocalArtUrls(card))
}

function syncLandingCardsFromCatalog(landingCards, bySlug) {
  for (let i = 0; i < landingCards.length; i++) {
    const { locationId, fanIndex, slug } = landingCards[i]
    const fresh = bySlug.get(slug)
    if (!fresh) continue
    landingCards[i] = { ...fresh, locationId, fanIndex }
  }
}

function cardToCollectionDisplay(card, fanIndex) {
  return {
    id: card.id,
    slug: card.slug,
    title: card.title,
    domain: card.domain,
    rarity: card.rarity,
    stats: card.stats,
    keywords: card.keywords ?? [],
    ability: card.ability,
    glowColor: card.glowColor,
    thumbUrl: card.thumbUrl,
    artUrl: card.artUrl,
    fanIndex,
  }
}

function buildCollectionCopy(collectionJson, publicBase, bySlug) {
  const fallback = {
    title: 'Collection',
    description: '',
    backgroundImage: '',
    stats: [],
    cardSlugs: [],
    cards: [],
  }
  const source = collectionJson ?? fallback

  const cards = (source.cardSlugs ?? []).map((slug, fanIndex) => {
    const card = bySlug?.get?.(slug) ?? bySlug?.[slug]
    if (!card) {
      console.warn(`Collection: card slug not found: ${slug}`)
      return null
    }
    return cardToCollectionDisplay(card, fanIndex)
  }).filter(Boolean)

  const backgroundImage = source.backgroundImage
    ? source.backgroundImage.startsWith('http') || source.backgroundImage.startsWith('/')
      ? source.backgroundImage
      : assetUrl(publicBase, toWebpRelativePath(source.backgroundImage))
    : ''

  return {
    title: source.title ?? fallback.title,
    description: source.description ?? fallback.description,
    backgroundImage,
    stats: (source.stats ?? []).map((stat) => ({
      id: stat.id,
      value: stat.value,
      label: stat.label,
    })),
    cards,
  }
}

async function copyCollectionAssets(paths, collectionJson, out, sharp) {
  const rel = collectionJson?.backgroundImage
  if (!rel || rel.startsWith('/') || rel.startsWith('http')) return

  const source = await resolveAssetFile(paths, rel)
  if (!source) {
    console.warn(`Collection: missing background asset: ${rel}`)
    return
  }

  await writeCompiledAsset(sharp, source, rel, out.assets)
  console.log('Collection: background asset copied')
}

function buildFaqCopy(faqJson) {
  const fallback = { title: 'FAQ', items: [] }
  const source = faqJson ?? fallback
  return {
    title: source.title ?? fallback.title,
    items: (source.items ?? []).map((item) => ({
      id: item.id,
      question: item.question,
      answer: item.answer,
    })),
  }
}

function buildFinalCtaCopy(finalctaJson, publicBase) {
  const fallback = {
    title: '',
    subtitle: '',
    description: '',
    buttonLabel: 'Play Now',
    route: 'play',
    backgroundImage: '',
    siege: { title: '', stats: [] },
  }
  const source = finalctaJson ?? fallback

  const backgroundImage = source.backgroundImage
    ? source.backgroundImage.startsWith('http') || source.backgroundImage.startsWith('/')
      ? source.backgroundImage
      : assetUrl(publicBase, toWebpRelativePath(source.backgroundImage))
    : ''

  return {
    title: source.title ?? fallback.title,
    subtitle: source.subtitle ?? fallback.subtitle,
    description: source.description ?? fallback.description,
    buttonLabel: source.buttonLabel ?? fallback.buttonLabel,
    route: source.route ?? fallback.route,
    backgroundImage,
    siege: {
      title: source.siege?.title ?? '',
      stats: (source.siege?.stats ?? []).map((stat) => ({
        id: stat.id,
        value: stat.value,
        label: stat.label,
      })),
    },
  }
}

async function copyFinalCtaAssets(paths, finalctaJson, out, sharp) {
  const rel = finalctaJson?.backgroundImage
  if (!rel || rel.startsWith('/') || rel.startsWith('http')) return

  const source = await resolveAssetFile(paths, rel)
  if (!source) {
    console.warn(`Final CTA: missing background asset: ${rel}`)
    return
  }

  await writeCompiledAsset(sharp, source, rel, out.assets)
  console.log('Final CTA: background asset copied')
}

function buildFooterCopy(footerJson) {
  const fallback = {
    brand: { name: '', tagline: '' },
    legal: [],
    contact: { companyName: '', companyNumber: '', address: '', email: '' },
    copyright: '',
    subCopyright: '',
    crafted: '',
    cookieSettingsLabel: 'Cookie Settings',
    cookies: null,
  }
  const source = footerJson ?? fallback

  return {
    brand: {
      name: source.brand?.name ?? fallback.brand.name,
      tagline: source.brand?.tagline ?? fallback.brand.tagline,
    },
    legal: (source.legal ?? []).map((link) => ({
      id: link.id,
      label: link.label,
      href: link.href,
    })),
    contact: {
      companyName: source.contact?.companyName ?? '',
      companyNumber: source.contact?.companyNumber ?? '',
      address: source.contact?.address ?? '',
      email: source.contact?.email ?? '',
    },
    copyright: source.copyright ?? fallback.copyright,
    subCopyright: source.subCopyright ?? fallback.subCopyright,
    crafted: source.crafted ?? fallback.crafted,
    cookieSettingsLabel: source.cookieSettingsLabel ?? fallback.cookieSettingsLabel,
    cookies: source.cookies
      ? {
          title: source.cookies.title,
          intro: source.cookies.intro,
          policyNote: source.cookies.policyNote,
          consentNote: source.cookies.consentNote,
          manageIntro: source.cookies.manageIntro,
          categories: (source.cookies.categories ?? []).map((cat) => ({
            id: cat.id,
            label: cat.label,
            description: cat.description,
            required: Boolean(cat.required),
          })),
          acceptAll: source.cookies.acceptAll,
          rejectNonEssential: source.cookies.rejectNonEssential,
          managePreferences: source.cookies.managePreferences,
          savePreferences: source.cookies.savePreferences,
          closeLabel: source.cookies.closeLabel,
        }
      : null,
  }
}

function buildPathwaysCopy(pathwaysJson, publicBase) {
  const fallback = {
    title: 'Collect. Trade. Conquer.',
    description: '',
    features: [],
    tiers: [],
    marketCta: null,
  }
  const source = pathwaysJson ?? fallback

  return {
    title: source.title ?? fallback.title,
    description: source.description ?? fallback.description,
    features: (source.features ?? []).map((feature) => ({
      id: feature.id,
      title: feature.title,
      description: feature.description,
      image: feature.image?.startsWith('http') || feature.image?.startsWith('/')
        ? feature.image
        : assetUrl(publicBase, feature.image),
      glowColor: feature.glowColor ?? '#a855f7',
    })),
    tiers: (source.tiers ?? []).map((tier) => ({
      id: tier.id,
      rarityLabel: tier.rarityLabel,
      title: tier.title,
      description: tier.description,
      glowColor: tier.glowColor ?? '#a855f7',
    })),
    marketCta: source.marketCta
      ? {
          description: source.marketCta.description ?? '',
          buttonLabel: source.marketCta.buttonLabel ?? 'Enter The Market',
          route: source.marketCta.route ?? 'portalMarket',
        }
      : null,
  }
}

function buildGameModelCopy(gamemodelJson, publicBase) {
  const fallback = {
    title: 'Game Model',
    description: '',
    pillars: [],
    tags: [],
  }
  const source = gamemodelJson ?? fallback

  return {
    title: source.title ?? fallback.title,
    description: source.description ?? fallback.description,
    pillars: (source.pillars ?? []).map((pillar) => ({
      id: pillar.id,
      title: pillar.title,
      description: pillar.description,
      image: pillar.image?.startsWith('http') || pillar.image?.startsWith('/')
        ? pillar.image
        : assetUrl(publicBase, pillar.image),
      glowColor: pillar.glowColor ?? '#4ec8ff',
    })),
    tags: (source.tags ?? []).map((tag) => ({
      id: tag.id,
      label: tag.label,
    })),
  }
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

/** Slugs baked into the frontend bundle (hero + collection section). Full catalog lives in DB. */
function buildFrontendShowcaseSlugs(featuredByLocation, collectionJson) {
  const slugs = new Set()
  for (const slug of Object.values(featuredByLocation)) {
    if (slug) slugs.add(slug)
  }
  for (const slug of collectionJson?.cardSlugs ?? []) {
    if (slug) slugs.add(slug)
  }
  return slugs
}

function writeCardsCatalogJson(out, payload) {
  return writeFile(path.join(out.data, 'cards-catalog.json'), JSON.stringify(payload, null, 2))
}

function writeLandingCardsJson(out, payload) {
  return writeFile(path.join(out.data, 'landing-cards.json'), JSON.stringify(payload, null, 2))
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
      image: assetUrl(publicBase, toWebpRelativePath(asset.path)),
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
  gamemodelJson,
  pathwaysJson,
  faqJson,
  finalctaJson,
  footerJson,
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
              image: assetUrl(publicBase, toWebpRelativePath(loc.imageAsset)),
              name: loc.name,
              description: loc.short,
            },
          ]

    const primaryImage = loc.imageAsset
      ? assetUrl(publicBase, toWebpRelativePath(loc.imageAsset))
      : cities[0]?.image ?? ''

    const backgroundImage = loc.backgroundImageAsset
      ? assetUrl(publicBase, toWebpRelativePath(loc.backgroundImageAsset))
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

  const gameModelCopy = buildGameModelCopy(gamemodelJson, publicBase)
  const pathwaysCopy = buildPathwaysCopy(pathwaysJson, publicBase)
  const faqCopy = buildFaqCopy(faqJson)
  const finalCtaCopy = buildFinalCtaCopy(finalctaJson, publicBase)
  const footerCopy = buildFooterCopy(footerJson)

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
      src: assetUrl(publicBase, toWebpRelativePath(manifest.brand.logo)),
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
      gameModel: gameModelCopy,
      pathways: pathwaysCopy,
      faq: faqCopy,
      finalCta: finalCtaCopy,
      footer: footerCopy,
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

/** Map game/domains.json id → game/locations.json location id (via location.domainId). */
function buildLocationByDomain(locationsJson) {
  const locationByDomain = {}
  for (const loc of locationsJson.locations) {
    locationByDomain[loc.domainId] = loc.id
  }
  return locationByDomain
}

async function ensureCardThumb(sharp, fullPath, thumbDest) {
  if (await pathExists(thumbDest)) return
  await mkdir(path.dirname(thumbDest), { recursive: true })
  await buildThumb(sharp, fullPath, thumbDest)
}

async function writeFrontendCardCatalog(out, generatedAt, totalCards, frontendCards) {
  await writeCardsCatalogJson(out, {
    generatedAt,
    scope: 'frontend_showcase',
    totalCards,
    cards: frontendCards,
  })
}

/** Drop stale local card art — only showcase slugs ship to the frontend VPS. */
async function pruneLocalCardArt(out, showcaseSlugs) {
  for (const dir of [out.dataThumbs, out.dataFull]) {
    let entries = []
    try {
      entries = await readdir(dir)
    } catch {
      continue
    }
    for (const name of entries) {
      const slug = name.replace(/\.(webp|png)$/i, '')
      if (!showcaseSlugs.has(slug)) {
        await unlink(path.join(dir, name)).catch(() => {})
        continue
      }
      if (dir === out.dataFull && /\.png$/i.test(name)) {
        await unlink(path.join(dir, name)).catch(() => {})
      }
    }
  }
}

async function compileCards({
  metadata,
  paths,
  out,
  projectId,
  manifest,
  locationsJson,
  featuredByLocation,
  collectionJson,
  domainIds,
  domainGlow,
  domainToCategory,
  supabaseUrl,
  shouldUpload,
  forceUpload,
}) {
  const cardSlugMigration = manifest?.cardSlugMigration ?? null
  const locationByDomain = buildLocationByDomain(locationsJson)
  const showcaseSlugs = buildFrontendShowcaseSlugs(featuredByLocation, collectionJson)
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
    if (!domain) {
      throw new Error(`cards.json: "${slug}" missing domain (must match game/domains.json id)`)
    }
    if (!domainIds.has(domain)) {
      throw new Error(
        `cards.json: "${slug}" domain "${domain}" not in game/domains.json — registered: ${[...domainIds].join(', ')}`,
      )
    }

    const localPath = await resolveAssetFile(paths, asset.path)
    const isShowcase = showcaseSlugs.has(slug)
    const priceCents = resolvePriceCents(asset)

    const useWebp = Boolean(sharp)
    const thumbExt = useWebp ? 'webp' : 'png'
    const artStorageRel = useWebp ? toWebpRelativePath(asset.path) : asset.path
    const { storagePath, thumbStoragePath } = siteStoragePaths(
      projectId,
      artStorageRel,
      domain,
      slug,
      thumbExt,
    )
    const thumbLocalRel = `/data/card-thumbs/${slug}.${thumbExt}`
    const thumbDest = path.join(out.dataThumbs, `${slug}.${thumbExt}`)
    const fullExt = useWebp ? 'webp' : 'png'
    const fullDest = path.join(out.dataFull, `${slug}.${fullExt}`)

    if (localPath && isShowcase) {
      await buildThumb(sharp, localPath, thumbDest)
      if (useWebp) {
        await buildFullArt(sharp, localPath, fullDest)
      } else {
        await copyFile(localPath, fullDest)
      }
    }

    const fullLocalRel = `/data/card-full/${slug}.${fullExt}`

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
      priceCents,
      sourceAssetPath: asset.path,
      storage_bucket: BUCKET,
      storage_path: storagePath,
      thumb_storage_path: thumbStoragePath,
      thumbUrl: isShowcase ? thumbLocalRel : '',
      artUrl: isShowcase ? fullLocalRel : '',
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
  const frontendCatalog = catalog.filter((card) => showcaseSlugs.has(card.slug))

  await writeFrontendCardCatalog(out, generatedAt, catalog.length, frontendCatalog)
  await writeLandingCardsJson(out, { generatedAt, cards: landingCards })
  await pruneLocalCardArt(out, showcaseSlugs)

  console.log(
    `Cards: ${catalog.length} total, ${frontendCatalog.length} frontend showcase, ${landingCards.length} landing featured`,
  )

  if (!shouldUpload) return { catalog, bySlug, generatedAt, landingCards, frontendCatalog }

  const { supabaseUrl: url, serviceKey } = resolveSupabaseAdminEnv()
  if (!url || !serviceKey) {
    throw new Error(formatAdminEnvHint())
  }

  const supabase = createAdminClient(url, serviceKey)
  const uploadStats = { skip: 0, move: 0, upload: 0, removedRaster: 0 }

  for (const card of catalog) {
    const fullPath = await resolveAssetFile(paths, card.sourceAssetPath)
    if (!fullPath) {
      console.warn(`Skip upload (no file): ${card.slug}`)
      continue
    }

    const thumbExt = card.thumb_storage_path.endsWith('.webp') ? 'webp' : 'png'
    const thumbPath = path.join(out.dataThumbs, `${card.slug}.${thumbExt}`)
    await ensureCardThumb(sharp, fullPath, thumbPath)

    const fullArtExt = card.storage_path.endsWith('.webp') ? 'webp' : 'png'
    const fullArtPath = path.join(out.dataFull, `${card.slug}.${fullArtExt}`)
    if (fullArtExt === 'webp') {
      await buildFullArt(sharp, fullPath, fullArtPath)
    } else {
      await mkdir(path.dirname(fullArtPath), { recursive: true })
      await copyFile(fullPath, fullArtPath)
    }

    const legacyFull = legacyFullStoragePath(projectId, card.slug, cardSlugMigration)
    const legacyRasterPaths = legacyFull ? [legacyFull] : []
    const fullResult =
      fullArtExt === 'webp'
        ? await ensureFullArtStorage(supabase, {
            bucket: BUCKET,
            targetWebpPath: card.storage_path,
            legacyRasterPaths,
            webpLocalPath: fullArtPath,
            force: forceUpload,
          })
        : await ensureStorageObject(supabase, {
            bucket: BUCKET,
            targetPath: card.storage_path,
            legacyPath: legacyFull,
            localPath: fullArtPath,
            contentType: 'image/png',
            force: forceUpload,
          })
    card.storage_path = fullResult.storagePath
    uploadStats[fullResult.action] += 1
    uploadStats.removedRaster += fullResult.removedRaster ?? 0

    const legacyThumb = legacyThumbStoragePath(
      projectId,
      card.slug,
      card.domain,
      thumbExt,
      cardSlugMigration,
    )
    const thumbResult = await ensureStorageObject(supabase, {
      bucket: BUCKET,
      targetPath: card.thumb_storage_path,
      legacyPath: legacyThumb,
      localPath: thumbPath,
      contentType: thumbExt === 'webp' ? 'image/webp' : 'image/png',
      force: forceUpload,
    })
    card.thumb_storage_path = thumbResult.storagePath
    uploadStats[thumbResult.action] += 1

    if (showcaseSlugs.has(card.slug)) {
      applyShowcaseLocalArt(card)
    } else {
      card.artUrl = storagePublicUrl(url, BUCKET, card.storage_path)
      card.thumbUrl = storagePublicUrl(url, BUCKET, card.thumb_storage_path)
    }
  }

  syncLandingCardsFromCatalog(landingCards, bySlug)

  const frontendAfterUpload = catalog.filter((card) => showcaseSlugs.has(card.slug))
  await writeFrontendCardCatalog(out, generatedAt, catalog.length, frontendAfterUpload)
  await writeLandingCardsJson(out, { generatedAt, cards: landingCards })

  let dbMigrated = 0
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
      price_cents: card.priceCents,
      published: true,
      updated_at: new Date().toISOString(),
    }

    const { id, migrated } = await upsertCardRow(supabase, projectId, row, cardSlugMigration)
    if (migrated) dbMigrated += 1
    card.dbId = id
    bySlug.set(card.slug, { ...card, dbId: id })
  }

  for (const [locationId, slug] of Object.entries(featuredByLocation)) {
    const card = bySlug.get(slug)
    if (!card?.dbId) continue
    await upsertFeaturedCard(supabase, projectId, locationId, card.dbId)
  }

  console.log(
    `Storage: ${uploadStats.upload} uploaded, ${uploadStats.skip} skipped, ${uploadStats.move} moved, ${uploadStats.removedRaster} legacy raster removed. DB: ${dbMigrated} slug migrations.`,
  )
  console.log('Synced Postgres (cards, location_featured_cards).')
  return { catalog, bySlug, generatedAt, landingCards, frontendCatalog: frontendAfterUpload }
}

function validateProject(manifest, domainsJson, locationsJson, categories, portal) {
  if (!manifest.id) throw new Error('manifest.json: missing id')
  if (!manifest.name?.display) throw new Error('manifest.json: missing name.display')
  if (!manifest.routes?.home) throw new Error('manifest.json: missing routes')

  const requiredPortalSections = [
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
  const legacyElementalDomainIds = new Set(['terra', 'aqua', 'ignis', 'zephyr'])
  const realmDomainIds = new Set(['kronos', 'thalassa', 'infernus', 'anemos'])
  const usesRealmDomains = domainsJson.domains.some((d) => realmDomainIds.has(d.id))
  const locationIds = new Set()

  for (const loc of locationsJson.locations) {
    if (!loc.id || !loc.name) {
      throw new Error(`locations.json: each location needs id and name`)
    }
    if (usesRealmDomains) {
      if (legacyElementalDomainIds.has(loc.id)) {
        throw new Error(
          `locations.json: location id "${loc.id}" is a legacy elemental id — use realm ids (kronos, thalassa, infernus, anemos)`,
        )
      }
      if (legacyElementalDomainIds.has(loc.domainId)) {
        throw new Error(
          `locations.json: location "${loc.id}" references legacy elemental domain "${loc.domainId}" — use realm domain ids (kronos, thalassa, infernus, anemos)`,
        )
      }
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
      if (usesRealmDomains && legacyElementalDomainIds.has(locId)) {
        throw new Error(
          `categories.json: locationIds must use realm ids (kronos, thalassa, infernus, anemos), not legacy elemental ids (terra, aqua, ignis, zephyr)`,
        )
      }
    }
  }
}

async function main() {
  const projectId = resolveProjectId()
  const shouldUpload = process.argv.includes('--upload')
  const forceUpload = process.argv.includes('--force-upload')
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
  const gamemodelJson = await readJsonOptional(paths.gamemodel)
  const collectionJson = await readJsonOptional(paths.collection)
  const pathwaysJson = await readJsonOptional(paths.pathways)
  const faqJson = await readJsonOptional(paths.faq)
  const finalctaJson = await readJsonOptional(paths.finalcta)
  const footerJson = await readJsonOptional(paths.footer)
  const seoJson = await readJsonOptional(paths.seo)
  const portal = await readJson(paths.portal, 'portal/sections')
  const credits = await readJson(paths.credits, 'credits')
  const auth = await readJson(paths.auth, 'auth')
  const domainsJson = await readJson(paths.domains, 'game/domains')
  const categories = await readJson(paths.categories, 'game/categories')
  const locationsJson = await readJson(paths.locations, 'game/locations')
  const scenesJson = await readJson(paths.gameScenes, 'game/scenes')
  const citiesJson = await readJsonOptional(paths.gameCities)
  const botNicknamesJson = await readJsonOptional(path.join(paths.root, 'game/bot-nicknames.json'))

  const out = buildPaths(projectId)

  validateProject(manifest, domainsJson, locationsJson, categories, portal)

  const featuredByLocation = buildFeaturedByLocation(locationsJson)

  const { domainToCategory, domainGlow, domainLabels } = buildDomainMaps(domainsJson)
  const domainIds = new Set(domainsJson.domains.map((d) => d.id))
  const sharp = await loadSharp()
  const { publicBase, metadata } = await copyProjectAssets(paths, manifest, out, sharp)
  await copyGamemodelAssets(paths, gamemodelJson, out, sharp)
  await copyCollectionAssets(paths, collectionJson, out, sharp)
  await copyPathwaysAssets(paths, pathwaysJson, out, sharp)
  await copyFinalCtaAssets(paths, finalctaJson, out, sharp)
  await buildBrandSeoAssets({ sharp, paths, manifest, seoJson, out })
  if (metadata.source === 'split') {
    console.log('Metadata: split (game/cards.json + game/scenes.json + game/keywords.json)')
  } else {
    console.log('Metadata: legacy assets_metadata.json (run npm run metadata:split to split)')
  }

  const cdnBase = manifest.assets?.cdnBase ?? null
  const { supabaseUrl } = shouldUpload ? resolveSupabaseAdminEnv() : { supabaseUrl: '' }

  const appConfig = buildAppConfig({
    manifest,
    colors,
    ui,
    descriptions,
    dominionsJson,
    gamemodelJson,
    pathwaysJson,
    faqJson,
    finalctaJson,
    footerJson,
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

  const { bySlug } = await compileCards({
    metadata,
    paths,
    out,
    projectId,
    manifest,
    locationsJson,
    featuredByLocation,
    collectionJson,
    domainIds,
    domainGlow,
    domainToCategory,
    supabaseUrl,
    shouldUpload,
    forceUpload,
  })

  appConfig.descriptions.collection = buildCollectionCopy(collectionJson, publicBase, bySlug)

  const gameConfig = {
    projectId,
    domains: domainsJson.domains,
    domainToCategory,
    domainGlow,
    domainLabels,
    featuredByLocation,
    keywords: metadata.keywords_glossary ?? {},
    locationOrder: locationsJson.locations.map((l) => l.id),
    botNicknames: Array.isArray(botNicknamesJson) ? botNicknamesJson : [],
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
