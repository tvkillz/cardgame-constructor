const nodemailer = require('nodemailer');
const { LOGO_CID, logoAttachment, resolveLogoAttachment, logoUrl } = require('../lib/emailTemplate');

function smtpPassword() {
  return process.env.SMTP_PASS || process.env.SMTP_PASSWORD || '';
}

function smtpPort() {
  return Number(process.env.SMTP_PORT || 465);
}

function fromAddress() {
  const name = process.env.SMTP_FROM_NAME || process.env.SMTP_SENDER_NAME || 'VOIDBORN';
  const email = process.env.SMTP_ADMIN_EMAIL || process.env.SMTP_USER;
  return `"${name}" <${email}>`;
}

function createTransport() {
  const port = smtpPort();
  const secure = port === 465;

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure,
    requireTLS: !secure && port === 587,
    auth: {
      user: process.env.SMTP_USER,
      pass: smtpPassword(),
    },
    tls: {
      minVersion: 'TLSv1.2',
    },
  });
}

async function verifySmtp() {
  const transport = createTransport();
  await transport.verify();
  return transport;
}

async function sendMail({ to, cc, subject, html, text, attachments, brand }) {
  const transport = createTransport();

  // Embed the header logo as a Content-ID (multipart/related) attachment when
  // the HTML references it — data: URIs get stripped by many mail clients.
  const finalAttachments = Array.isArray(attachments) ? [...attachments] : [];
  if (html && html.includes(`cid:${LOGO_CID}`)) {
    const logo = brand ? await resolveLogoAttachment(brand) : logoAttachment(brand);
    if (logo && !finalAttachments.some((att) => att && att.cid === logo.cid)) {
      finalAttachments.push(logo);
    } else if (brand && !logo) {
      html = html.replace(`src="cid:${LOGO_CID}"`, `src="${logoUrl(brand)}"`);
    }
  }

  const info = await transport.sendMail({
    from: fromAddress(),
    to,
    cc,
    subject,
    html,
    text,
    attachments: finalAttachments,
  });
  return info;
}

module.exports = {
  createTransport,
  verifySmtp,
  sendMail,
  fromAddress,
  smtpPort,
};
