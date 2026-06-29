const fs = require('fs');
const path = require('path');

const DEFAULT_SITE_URL = 'https://voidborn.fun';
const DEFAULT_BRAND_NAME = 'VOIDBORN';
const DEFAULT_LOGO_PATH = '/assets/brand/header.webp';

/** Portal palette — matches PortalShell.css */
const PORTAL = {
  bg: '#0a0a0c',
  text: '#e8dcc8',
  title: '#f1e6c8',
  muted: 'rgba(232, 220, 200, 0.55)',
  body: 'rgba(232, 220, 200, 0.88)',
  gold: '#c9a227',
  goldBright: '#f3d878',
  purpleBorder: 'rgba(123, 77, 255, 0.2)',
  headerTop: '#0e1018',
  headerBottom: '#0a0a0c',
};

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function siteUrl() {
  return (process.env.SITE_URL || process.env.MAIL_SITE_URL || DEFAULT_SITE_URL).replace(/\/$/, '');
}

function brandName() {
  return process.env.MAIL_BRAND_NAME || process.env.SMTP_FROM_NAME || DEFAULT_BRAND_NAME;
}

function logoUrl() {
  const override = process.env.MAIL_LOGO_URL || process.env.MAIL_HEADER_LOGO_URL;
  if (override) return override.replace(/\/$/, '');

  const configuredPath = process.env.MAIL_LOGO_PATH || DEFAULT_LOGO_PATH;
  const normalizedPath = configuredPath.startsWith('/') ? configuredPath : `/${configuredPath}`;
  return `${siteUrl()}${normalizedPath}`;
}

function bundledLogoFile() {
  const candidates = [
    path.join(__dirname, '../../assets/brand/header.webp'),
    path.join(__dirname, '../../assets/brand/header.png'),
    path.join(__dirname, '../../../frontend/.build/voidborn/assets/brand/header.webp'),
    path.join(__dirname, '../../../frontend/.build/voidborn/assets/brand/header.png'),
  ];

  return candidates.find((file) => fs.existsSync(file)) ?? null;
}

function logoImgHtml() {
  const alt = escapeHtml(brandName());
  const style =
    'display:block;border:0;outline:none;height:62px;width:auto;max-width:200px;margin:0;';

  const bundled = bundledLogoFile();
  if (bundled) {
    const ext = path.extname(bundled).toLowerCase();
    const mime = ext === '.png' ? 'image/png' : 'image/webp';
    const data = fs.readFileSync(bundled).toString('base64');
    return `<img src="data:${mime};base64,${data}" alt="${alt}" height="62" style="${style}" />`;
  }

  const url = escapeHtml(logoUrl());
  return `<img src="${url}" alt="${alt}" height="62" style="${style}" />`;
}

/**
 * Portal-styled HTML email shell — matches /portal header and dark realm palette.
 */
function renderPortalEmail({
  title,
  headline,
  greeting,
  bodyHtml = '',
  ctaLabel,
  ctaUrl,
  secondaryHtml = '',
  footerNote,
}) {
  const safeTitle = escapeHtml(title || headline || brandName());
  const safeHeadline = escapeHtml(headline || title || brandName());
  const safeGreeting = greeting
    ? `<p style="margin:0 0 20px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.65;color:${PORTAL.text};">${escapeHtml(greeting)}</p>`
    : '';
  const safeFooter =
    footerNote ||
    `If you did not request this email, you can safely ignore it. This message was sent by ${brandName()}.`;

  const ctaBlock =
    ctaLabel && ctaUrl
      ? `
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:28px 0 0;">
            <tr>
              <td align="left" style="border-radius:6px;border:1px solid rgba(201,162,39,0.45);background:rgba(201,162,39,0.15);">
                <a href="${escapeHtml(ctaUrl)}" target="_blank" rel="noopener noreferrer" style="display:inline-block;padding:12px 28px;font-family:Arial,Helvetica,sans-serif;font-size:13px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;text-decoration:none;color:${PORTAL.goldBright};">
                  ${escapeHtml(ctaLabel)}
                </a>
              </td>
            </tr>
          </table>
          <p style="margin:20px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.55;color:${PORTAL.muted};word-break:break-all;">
            Or copy this link:<br>
            <a href="${escapeHtml(ctaUrl)}" style="color:${PORTAL.gold};text-decoration:underline;">${escapeHtml(ctaUrl)}</a>
          </p>`
      : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="dark">
  <meta name="supported-color-schemes" content="dark">
  <title>${safeTitle}</title>
</head>
<body style="margin:0;padding:0;background-color:${PORTAL.bg};-webkit-text-size-adjust:100%;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">
    ${safeHeadline}
  </div>
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:${PORTAL.bg};">
    <tr>
      <td align="center" style="padding:0;">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="width:100%;max-width:600px;border-collapse:collapse;background-color:${PORTAL.bg};">
          <tr>
            <td style="padding:16px 24px;border-bottom:1px solid ${PORTAL.purpleBorder};background:linear-gradient(180deg,${PORTAL.headerTop} 0%,${PORTAL.headerBottom} 100%);">
              <a href="${escapeHtml(siteUrl())}" target="_blank" rel="noopener noreferrer" style="text-decoration:none;">
                ${logoImgHtml()}
              </a>
            </td>
          </tr>
          <tr>
            <td style="padding:32px 24px 28px;background-color:${PORTAL.bg};">
              <h1 style="margin:0 0 20px;font-family:Georgia,'Times New Roman',serif;font-size:26px;line-height:1.25;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:${PORTAL.title};">
                ${safeHeadline}
              </h1>
              ${safeGreeting}
              <div style="font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.7;color:${PORTAL.body};">
                ${bodyHtml}
              </div>
              ${ctaBlock}
              ${secondaryHtml}
            </td>
          </tr>
          <tr>
            <td style="padding:0 24px 32px;background-color:${PORTAL.bg};">
              <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.6;color:${PORTAL.muted};">
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

function renderOtpBlock(token) {
  if (!token) return '';
  return `
    <p style="margin:24px 0 0;font-size:14px;line-height:1.6;color:${PORTAL.body};">
      Prefer a code? Enter this one-time passcode:
    </p>
    <p style="margin:10px 0 0;font-family:'Courier New',Courier,monospace;font-size:22px;font-weight:700;letter-spacing:0.28em;color:${PORTAL.gold};">
      ${escapeHtml(token)}
    </p>`;
}

module.exports = {
  escapeHtml,
  siteUrl,
  logoUrl,
  brandName,
  renderPortalEmail,
  renderOtpBlock,
};
