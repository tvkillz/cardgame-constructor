const nodemailer = require('nodemailer');

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

async function sendMail({ to, cc, subject, html, text, attachments }) {
  const transport = createTransport();
  const info = await transport.sendMail({
    from: fromAddress(),
    to,
    cc,
    subject,
    html,
    text,
    attachments,
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
