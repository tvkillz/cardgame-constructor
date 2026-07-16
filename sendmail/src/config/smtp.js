const nodemailer = require('nodemailer');

function envValue(...keys) {
  for (const key of keys) {
    const value = process.env[key];
    if (value != null && String(value).trim() !== '') {
      return String(value);
    }
  }
  return '';
}

function normalizeSiteId(siteId) {
  return String(siteId || '').trim().toLowerCase();
}

function siteSmtpConfig(siteId) {
  const normalized = normalizeSiteId(siteId);
  const isIyashikei = normalized === 'iyashikei';
  const prefix = isIyashikei ? 'SMTP_IYASHIKEI_' : 'SMTP_';

  const host = envValue(`${prefix}HOST`, 'SMTP_HOST');
  const port = Number(envValue(`${prefix}PORT`, 'SMTP_PORT') || 465);
  const user = envValue(`${prefix}USER`, 'SMTP_USER');
  const pass = envValue(`${prefix}PASS`, `${prefix}PASSWORD`, 'SMTP_PASS', 'SMTP_PASSWORD');
  const fromName = envValue(
    `${prefix}FROM_NAME`,
    `${prefix}SENDER_NAME`,
    'SMTP_FROM_NAME',
    'SMTP_SENDER_NAME',
  ) || (isIyashikei ? 'KOMOREBI' : 'VOIDBORN');
  const fromEmail = envValue(`${prefix}ADMIN_EMAIL`, `${prefix}FROM_EMAIL`, 'SMTP_ADMIN_EMAIL', 'SMTP_USER') || user;

  return {
    siteId: normalized || 'voidborn',
    host,
    port,
    user,
    pass,
    fromName,
    fromEmail,
  };
}

function smtpPort(siteId) {
  return siteSmtpConfig(siteId).port;
}

function fromAddress(siteId) {
  const cfg = siteSmtpConfig(siteId);
  const name = cfg.fromName || 'Mail';
  const email = cfg.fromEmail || cfg.user;
  return `"${name}" <${email}>`;
}

function createTransport(siteId) {
  const cfg = siteSmtpConfig(siteId);
  const port = cfg.port;
  const secure = port === 465;

  return nodemailer.createTransport({
    host: cfg.host,
    port,
    secure,
    requireTLS: !secure && port === 587,
    auth: {
      user: cfg.user,
      pass: cfg.pass,
    },
    tls: {
      minVersion: 'TLSv1.2',
    },
  });
}

async function verifySmtp(siteId) {
  const transport = createTransport(siteId);
  await transport.verify();
  return transport;
}

async function sendViaSmtp({ to, cc, subject, html, text, attachments, siteId }) {
  const cfg = siteSmtpConfig(siteId);
  if (!cfg.host || !cfg.user || !cfg.pass) {
    throw new Error(
      `SMTP not configured for site=${cfg.siteId} (need ${
        cfg.siteId === 'iyashikei' ? 'SMTP_IYASHIKEI_*' : 'SMTP_*'
      })`,
    );
  }

  const transport = createTransport(siteId);
  try {
    const info = await transport.sendMail({
      from: fromAddress(siteId),
      to,
      cc,
      subject,
      html,
      text,
      attachments,
    });
    return info;
  } catch (err) {
    err.message = `SMTP send failed site=${cfg.siteId} host=${cfg.host}: ${err.message}`;
    throw err;
  }
}

module.exports = {
  createTransport,
  verifySmtp,
  sendViaSmtp,
  fromAddress,
  smtpPort,
  siteSmtpConfig,
};
