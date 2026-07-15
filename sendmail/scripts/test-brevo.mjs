#!/usr/bin/env node
/**
 * Verify Brevo API key (no send).
 *
 *   MAIL_TRANSPORT=brevo BREVO_API_KEY=... npm run test:brevo
 */
import 'dotenv/config';

const apiKey = process.env.BREVO_API_KEY?.trim();
if (!apiKey) {
  console.error('Set BREVO_API_KEY in sendmail/.env');
  process.exit(1);
}

console.log('[test:brevo] Checking account…');

const res = await fetch('https://api.brevo.com/v3/account', {
  headers: { 'api-key': apiKey, accept: 'application/json' },
});

if (!res.ok) {
  console.error('[test:brevo] failed:', res.status, await res.text());
  process.exit(1);
}

const account = await res.json();
console.log('[test:brevo] OK —', account.companyName || account.email || 'account verified');

const to = process.env.SEND_TEST_TO || process.env.TEST_EMAIL_RECIPIENTS?.split(',')[0]?.trim();
if (!to) {
  console.log('[test:brevo] verify only — set SEND_TEST_TO to send a message via HTTP POST /test');
  process.exit(0);
}

console.log('[test:brevo] Use POST /test with MAIL_API_KEY to send a branded preview email.');
