const fs = require('fs');
const path = require('path');

const { getBrand, bundledLogoFile: brandBundledLogo } = require('./siteBrands');
const { LOGO_CID, prepareLogoAttachment } = require('./logoImage');

const DEFAULT_SITE_URL = 'https://voidborn.fun';
const DEFAULT_BRAND_NAME = 'VOIDBORN';
const DEFAULT_LOGO_PATH = '/assets/brand/header.webp';

/** Content-ID for the inline header logo (multipart/related). */
const INLINE_LOGO_EXT = new Set(['.png', '.jpg', '.jpeg', '.webp']);

/** Legacy export — voidborn portal palette. */
const PORTAL = getBrand('voidborn').palette;

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function siteUrl(brand = getBrand('voidborn')) {
  return (
    brand.siteUrl ||
    process.env.SITE_URL ||
    process.env.MAIL_SITE_URL ||
    DEFAULT_SITE_URL
  ).replace(/\/$/, '');
}

function brandName(brand = getBrand('voidborn')) {
  return brand.brandName || process.env.MAIL_BRAND_NAME || process.env.SMTP_FROM_NAME || DEFAULT_BRAND_NAME;
}

function logoUrl(brand = getBrand('voidborn')) {
  const perSiteOverride = process.env[`MAIL_LOGO_URL_${brand.id.toUpperCase()}`];
  if (perSiteOverride) return perSiteOverride.replace(/\/$/, '');

  const override = process.env.MAIL_LOGO_URL || process.env.MAIL_HEADER_LOGO_URL;
  if (override && brand.id === 'voidborn') return override.replace(/\/$/, '');

  const paths = brand.logoPaths || [brand.logoPath || process.env.MAIL_LOGO_PATH || DEFAULT_LOGO_PATH];
  const configuredPath = paths[0];
  const normalizedPath = configuredPath.startsWith('/') ? configuredPath : `/${configuredPath}`;
  return `${siteUrl(brand)}${normalizedPath}`;
}

function logoUrlCandidates(brand = getBrand('voidborn')) {
  const perSiteOverride = process.env[`MAIL_LOGO_URL_${brand.id.toUpperCase()}`];
  if (perSiteOverride) return [perSiteOverride.replace(/\/$/, '')];

  const override = process.env.MAIL_LOGO_URL || process.env.MAIL_HEADER_LOGO_URL;
  if (override && brand.id === 'voidborn') return [override.replace(/\/$/, '')];

  const paths = brand.logoPaths || [brand.logoPath || process.env.MAIL_LOGO_PATH || DEFAULT_LOGO_PATH];
  const base = siteUrl(brand);
  return paths.map((configuredPath) => {
    const normalizedPath = configuredPath.startsWith('/') ? configuredPath : `/${configuredPath}`;
    return `${base}${normalizedPath}`;
  });
}

function attachmentFromLogoFile(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (!INLINE_LOGO_EXT.has(ext)) return null;
  const contentType =
    ext === '.png'
      ? 'image/png'
      : ext === '.webp'
        ? 'image/webp'
        : 'image/jpeg';
  return {
    filename: `logo${ext}`,
    content: fs.readFileSync(filePath),
    cid: LOGO_CID,
    contentType,
  };
}

async function fetchLogoFromSite(brand) {
  return prepareLogoAttachment(brand);
}

function bundledLogoFile(brand = getBrand('voidborn')) {
  return brandBundledLogo(brand);
}

/**
 * Inline logo attachment — local bundle first, then fetch from the site's public URL.
 */
async function resolveLogoAttachment(brand = getBrand('voidborn')) {
  return prepareLogoAttachment(brand);
}

/**
 * @deprecated sync local bundle only — prefer resolveLogoAttachment in sendMail.
 */
function logoAttachment(brand = getBrand('voidborn')) {
  const bundled = bundledLogoFile(brand);
  if (!bundled) return null;
  return attachmentFromLogoFile(bundled);
}

function logoImgHtml(brand = getBrand('voidborn')) {
  const alt = escapeHtml(brandName(brand));
  const style =
    'display:block;border:0;outline:none;height:62px;width:auto;max-width:200px;margin:0;';

  const bundled = bundledLogoFile(brand);
  if (bundled && INLINE_LOGO_EXT.has(path.extname(bundled).toLowerCase())) {
    return `<img src="cid:${LOGO_CID}" alt="${alt}" height="62" style="${style}" />`;
  }

  // Embed via CID after resolveLogoAttachment fetches from the site (e.g. komorebi).
  if (brand.id !== 'voidborn' || process.env.MAIL_LOGO_FETCH === '1') {
    return `<img src="cid:${LOGO_CID}" alt="${alt}" height="62" style="${style}" />`;
  }

  const url = escapeHtml(logoUrl(brand));
  return `<img src="${url}" alt="${alt}" height="62" style="${style}" />`;
}

function emailHeadStyles(brand) {
  const typography = brand.typography;
  if (!typography) return '';

  const rules = [];
  if (typography.googleFontsUrl) {
    rules.push(`@import url('${typography.googleFontsUrl}');`);
  }
  if (typography.customFontFamily && typography.customFontUrl) {
    const fontUrl = `${siteUrl(brand)}${typography.customFontUrl}`;
    rules.push(
      `@font-face{font-family:'${typography.customFontFamily}';src:url('${fontUrl}') format('opentype');font-weight:normal;font-style:normal;}`,
    );
  }
  if (!rules.length) return '';
  return `<style type="text/css">${rules.join('')}</style>`;
}

function headingFontFamily(brand) {
  return (
    brand.typography?.headingFamily ||
    (brand.id === 'iyashikei'
      ? "'Shippori Mincho', 'Hiragino Mincho ProN', 'Yu Mincho', Georgia, serif"
      : "Georgia, 'Times New Roman', serif")
  );
}

/**
 * Site-branded HTML email shell — voidborn dark realm or iyashikei light wards.
 */
function renderBrandedEmail(
  brand,
  {
    title,
    headline,
    greeting,
    bodyHtml = '',
    ctaLabel,
    ctaUrl,
    secondaryHtml = '',
    footerNote,
  },
) {
  const palette = brand.palette;
  const safeTitle = escapeHtml(title || headline || brandName(brand));
  const safeHeadline = escapeHtml(headline || title || brandName(brand));
  const safeGreeting = greeting
    ? `<p style="margin:0 0 20px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.65;color:${palette.text};">${escapeHtml(greeting)}</p>`
    : '';
  const safeFooter =
    footerNote ||
    `If you did not request this email, you can safely ignore it. This message was sent by ${brandName(brand)}.`;

  const headlineFont = headingFontFamily(brand);
  const headStyles = emailHeadStyles(brand);

  const ctaBlock =
    ctaLabel && ctaUrl
      ? `
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:28px 0 0;">
            <tr>
              <td align="left" style="border-radius:8px;border:1px solid ${palette.ctaBorder};background:${palette.ctaBg};">
                <a href="${escapeHtml(ctaUrl)}" target="_blank" rel="noopener noreferrer" style="display:inline-block;padding:12px 28px;font-family:Arial,Helvetica,sans-serif;font-size:13px;font-weight:700;letter-spacing:0.08em;text-decoration:none;color:${palette.accentBright};">
                  ${escapeHtml(ctaLabel)}
                </a>
              </td>
            </tr>
          </table>
          <p style="margin:20px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.55;color:${palette.muted};word-break:break-all;">
            Or copy this link:<br>
            <a href="${escapeHtml(ctaUrl)}" style="color:${palette.accent};text-decoration:underline;">${escapeHtml(ctaUrl)}</a>
          </p>`
      : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="${palette.colorScheme}">
  <meta name="supported-color-schemes" content="${palette.colorScheme}">
  <title>${safeTitle}</title>
  ${headStyles}
</head>
<body style="margin:0;padding:0;background-color:${palette.bg};-webkit-text-size-adjust:100%;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">
    ${safeHeadline}
  </div>
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:${palette.bg};">
    <tr>
      <td align="center" style="padding:0;">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="width:100%;max-width:600px;border-collapse:collapse;background-color:${palette.bg};">
          <tr>
            <td style="padding:16px 24px;border-bottom:1px solid ${palette.border};background:linear-gradient(180deg,${palette.headerTop} 0%,${palette.headerBottom} 100%);">
              <a href="${escapeHtml(siteUrl(brand))}" target="_blank" rel="noopener noreferrer" style="text-decoration:none;">
                ${logoImgHtml(brand)}
              </a>
            </td>
          </tr>
          <tr>
            <td style="padding:32px 24px 28px;background-color:${palette.bg};">
              <h1 style="margin:0 0 20px;font-family:${headlineFont};font-size:26px;line-height:1.25;font-weight:700;letter-spacing:0.06em;color:${palette.title};">
                ${safeHeadline}
              </h1>
              ${safeGreeting}
              <div style="font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.7;color:${palette.body};">
                ${bodyHtml}
              </div>
              ${ctaBlock}
              ${secondaryHtml}
            </td>
          </tr>
          <tr>
            <td style="padding:0 24px 32px;background-color:${palette.bg};">
              <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.6;color:${palette.muted};">
                ${escapeHtml(safeFooter)}
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/** @deprecated Use renderBrandedEmail — kept for invoice and other voidborn-only mail. */
function renderPortalEmail(options) {
  return renderBrandedEmail(getBrand('voidborn'), options);
}

function renderOtpBlock(token, brand = getBrand('voidborn')) {
  if (!token) return '';
  const palette = brand.palette;
  return `
    <p style="margin:24px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.6;color:${palette.body};">
      Prefer a code? Enter this one-time passcode:
    </p>
    <p style="margin:10px 0 0;font-family:'Courier New',Courier,monospace;font-size:22px;font-weight:700;letter-spacing:0.28em;color:${palette.accent};">
      ${escapeHtml(token)}
    </p>`;
}

module.exports = {
  PORTAL,
  LOGO_CID,
  escapeHtml,
  siteUrl,
  logoUrl,
  logoUrlCandidates,
  brandName,
  bundledLogoFile,
  logoAttachment,
  resolveLogoAttachment,
  logoImgHtml,
  renderBrandedEmail,
  renderPortalEmail,
  renderOtpBlock,
};
