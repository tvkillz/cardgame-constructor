#!/usr/bin/env node
/**
 * Direct SMTP verify + optional send (no HTTP).
 *
 *   npm run test:smtp
 *   SEND_TEST_TO=you@example.com npm run test:smtp
 */
import 'dotenv/config';
import nodemailer from 'nodemailer';

const host = process.env.SMTP_HOST;
const port = Number(process.env.SMTP_PORT || 465);
const user = process.env.SMTP_USER;
const pass = process.env.SMTP_PASS || process.env.SMTP_PASSWORD;

if (!host || !user || !pass) {
  console.error('Set SMTP_HOST, SMTP_USER, SMTP_PASS in sendmail/.env');
  process.exit(1);
}

const secure = port === 465;
const transport = nodemailer.createTransport({
  host,
  port,
  secure,
  requireTLS: !secure && port === 587,
  auth: { user, pass },
  tls: { minVersion: 'TLSv1.2' },
});

console.log(`[test:smtp] ${host}:${port} as ${user} (secure=${secure})`);

try {
  await transport.verify();
  console.log('[test:smtp] SMTP verify OK');
} catch (err) {
  console.error('[test:smtp] verify failed:', err.message);
  process.exit(1);
}

const to = process.env.SEND_TEST_TO || process.env.TEST_EMAIL_RECIPIENTS?.split(',')[0]?.trim();
if (!to) {
  console.log('[test:smtp] verify only — set SEND_TEST_TO to send a message');
  process.exit(0);
}

const fromName = process.env.SMTP_FROM_NAME || process.env.SMTP_SENDER_NAME || 'VOIDBORN';
const fromEmail = process.env.SMTP_ADMIN_EMAIL || user;
const stamp = new Date().toISOString();

const info = await transport.sendMail({
  from: `"${fromName}" <${fromEmail}>`,
  to,
  subject: `VOIDBORN SMTP direct test ${stamp}`,
  text: `Direct nodemailer test at ${stamp}`,
  html: `<p>Direct nodemailer test at <strong>${stamp}</strong></p>`,
});

console.log('[test:smtp] sent:', info.messageId, '→', info.accepted);
