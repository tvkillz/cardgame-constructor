#!/usr/bin/env node
/**
 * HTTP API smoke test (health, smtp-health, test send).
 *
 *   npm run test:api
 *   SENDMAIL_URL=https://voidborn.fun/api/sendmail npm run test:api
 */
import 'dotenv/config';

const baseUrl = (process.env.SENDMAIL_URL || `http://127.0.0.1:${process.env.PORT || 6001}`).replace(
  /\/$/,
  '',
);
const basePath = (process.env.BASE_PATH || '').replace(/\/$/, '');
const root = `${baseUrl}${basePath}`;
const apiKey = process.env.MAIL_API_KEY;

if (!apiKey) {
  console.error('Set MAIL_API_KEY in sendmail/.env');
  process.exit(1);
}

const auth = { Authorization: `Bearer ${apiKey}` };

async function request(path, options = {}) {
  const url = `${root}${path}`;
  const res = await fetch(url, options);
  const text = await res.text();
  let body;
  try {
    body = JSON.parse(text);
  } catch {
    body = text;
  }
  return { url, status: res.status, body };
}

console.log(`[test:api] base=${root}`);

let health;
try {
  health = await request('/health');
} catch (err) {
  if (err?.cause?.code === 'ECONNREFUSED') {
    console.error('[test:api] Server not running — start it in another terminal: npm run dev');
  }
  throw err;
}
console.log('[test:api] GET /health', health.status, health.body);

const smtp = await request('/smtp-health', { headers: auth });
console.log('[test:api] GET /smtp-health', smtp.status, smtp.body);
if (smtp.status !== 200) {
  process.exit(1);
}

const recipients = (process.env.TEST_EMAIL_RECIPIENTS || '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

const test = await request('/test', {
  method: 'POST',
  headers: { ...auth, 'Content-Type': 'application/json' },
  body: JSON.stringify(recipients.length ? { recipients } : {}),
});
console.log('[test:api] POST /test', test.status, test.body);
if (test.status !== 200) {
  process.exit(1);
}

console.log('[test:api] OK');
