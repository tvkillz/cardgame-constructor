const fs = require('fs');
const path = require('path');

const { getBrand, bundledLogoFile } = require('./siteBrands');

const LOGO_CID = 'brandlogo';
const IMAGE_EXT = new Set(['.png', '.jpg', '.jpeg', '.webp']);

function loadSharp() {
  try {
    // eslint-disable-next-line import/no-extraneous-dependencies, global-require
    return require('sharp');
  } catch {
    return null;
  }
}

function siteUrl(brand) {
  return (
    brand.siteUrl ||
    process.env.SITE_URL ||
    process.env.MAIL_SITE_URL ||
    'https://voidborn.fun'
  ).replace(/\/$/, '');
}

function logoUrlCandidates(brand = getBrand('voidborn')) {
  const perSiteOverride = process.env[`MAIL_LOGO_URL_${brand.id.toUpperCase()}`];
  if (perSiteOverride) return [perSiteOverride.replace(/\/$/, '')];

  const override = process.env.MAIL_LOGO_URL || process.env.MAIL_HEADER_LOGO_URL;
  if (override && brand.id === 'voidborn') return [override.replace(/\/$/, '')];

  const paths = brand.logoPaths || [brand.logoPath || '/assets/brand/header.webp'];
  const base = siteUrl(brand);
  return paths.map((configuredPath) => {
    const normalizedPath = configuredPath.startsWith('/') ? configuredPath : `/${configuredPath}`;
    return `${base}${normalizedPath}`;
  });
}

function parseHexColor(hex) {
  const normalized = String(hex || '#ffffff').replace('#', '');
  if (normalized.length !== 6) return { r: 255, g: 255, b: 255 };
  return {
    r: parseInt(normalized.slice(0, 2), 16),
    g: parseInt(normalized.slice(2, 4), 16),
    b: parseInt(normalized.slice(4, 6), 16),
  };
}

async function fetchLogoBytes(url) {
  const res = await fetch(url, { signal: AbortSignal.timeout(10_000) });
  if (!res.ok) return null;

  const contentType = (res.headers.get('content-type') || '').toLowerCase();
  if (
    !contentType.includes('image/png') &&
    !contentType.includes('image/jpeg') &&
    !contentType.includes('image/jpg') &&
    !contentType.includes('image/webp')
  ) {
    return null;
  }

  const content = Buffer.from(await res.arrayBuffer());
  return content.length >= 64 ? content : null;
}

async function readLogoBytes(brand) {
  const bundled = bundledLogoFile(brand);
  if (bundled && IMAGE_EXT.has(path.extname(bundled).toLowerCase())) {
    return fs.readFileSync(bundled);
  }

  for (const url of logoUrlCandidates(brand)) {
    try {
      const bytes = await fetchLogoBytes(url);
      if (bytes) return bytes;
    } catch {
      // try next candidate
    }
  }

  return null;
}

/**
 * Replace baked-in black matte with the email/PDF header background on light themes.
 */
async function normalizeLogoBuffer(buffer, brand) {
  const sharp = loadSharp();
  if (!sharp) return buffer;

  const isLight = brand?.palette?.colorScheme === 'light';
  const matteBg = isLight ? brand.palette.headerTop || '#faf6ee' : null;
  if (!matteBg) {
    return sharp(buffer).png().toBuffer();
  }

  const { data, info } = await sharp(buffer).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const bg = parseHexColor(matteBg);
  const threshold = 28;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    if (r <= threshold && g <= threshold && b <= threshold) {
      data[i] = bg.r;
      data[i + 1] = bg.g;
      data[i + 2] = bg.b;
      data[i + 3] = 255;
    }
  }

  return sharp(data, {
    raw: { width: info.width, height: info.height, channels: 4 },
  })
    .png()
    .toBuffer();
}

async function prepareLogoPng(brand) {
  const raw = await readLogoBytes(brand);
  if (!raw) return null;
  return normalizeLogoBuffer(raw, brand);
}

async function prepareLogoAttachment(brand) {
  const png = await prepareLogoPng(brand);
  if (!png) return null;

  return {
    filename: 'logo.png',
    content: png,
    cid: LOGO_CID,
    contentType: 'image/png',
  };
}

async function prepareLogoForPdf(brand) {
  return prepareLogoPng(brand);
}

module.exports = {
  LOGO_CID,
  logoUrlCandidates,
  prepareLogoAttachment,
  prepareLogoForPdf,
  prepareLogoPng,
  readLogoBytes,
};
