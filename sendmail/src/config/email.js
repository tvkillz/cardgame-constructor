const { LOGO_CID, logoAttachment, resolveLogoAttachment, logoUrl } = require('../lib/emailTemplate');
const { sendViaSmtp, verifySmtp, fromAddress: smtpFromAddress, smtpPort } = require('./smtp');
const { sendViaBrevo, verifyBrevo, fromAddress: brevoFromAddress } = require('./brevo');

function mailTransport() {
  return (process.env.MAIL_TRANSPORT || 'smtp').trim().toLowerCase();
}

function fromAddress() {
  if (mailTransport() === 'brevo') {
    const { name, email } = brevoFromAddress();
    return `"${name}" <${email}>`;
  }
  return smtpFromAddress();
}

async function verifyMailTransport() {
  if (mailTransport() === 'brevo') {
    await verifyBrevo();
    return;
  }
  await verifySmtp();
}

/** @deprecated use verifyMailTransport */
async function verifySmtpLegacy() {
  return verifyMailTransport();
}

async function sendMail({ to, cc, subject, html, text, attachments, brand }) {
  const finalAttachments = Array.isArray(attachments) ? [...attachments] : [];
  const siteId = brand?.id || 'voidborn';
  if (html && html.includes(`cid:${LOGO_CID}`)) {
    const logo = brand ? await resolveLogoAttachment(brand) : logoAttachment(brand);
    if (logo && !finalAttachments.some((att) => att && att.cid === logo.cid)) {
      finalAttachments.push(logo);
    } else if (brand && !logo) {
      html = html.replace(`src="cid:${LOGO_CID}"`, `src="${logoUrl(brand)}"`);
    }
  }

  const payload = {
    to,
    cc,
    subject,
    html,
    text,
    attachments: finalAttachments,
    siteId,
  };

  if (mailTransport() === 'brevo') {
    return sendViaBrevo(payload);
  }
  return sendViaSmtp(payload);
}

module.exports = {
  mailTransport,
  verifyMailTransport,
  verifySmtp: verifySmtpLegacy,
  sendMail,
  fromAddress,
  smtpPort,
};
