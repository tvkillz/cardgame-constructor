#!/usr/bin/env node
/**
 * Generate MAIL_API_KEY and GoTrue SEND_EMAIL_HOOK_SECRET (v1,whsec_...).
 *
 *   npm run generate-secrets
 */
import crypto from 'node:crypto';

const apiKey = `vb_mail_${crypto.randomBytes(24).toString('hex')}`;
const hookRaw = crypto.randomBytes(32).toString('base64');
const hookSecret = `v1,whsec_${hookRaw}`;

console.log('');
console.log('# Add to sendmail/.env (cPanel Node app env vars)');
console.log('');
console.log(`MAIL_API_KEY=${apiKey}`);
console.log(`SEND_EMAIL_HOOK_SECRET=${hookSecret}`);
console.log('');
console.log('# Add to backend/.env when wiring GoTrue (after cPanel deploy works)');
console.log('');
console.log('GOTRUE_HOOK_SEND_EMAIL_ENABLED=true');
console.log('GOTRUE_HOOK_SEND_EMAIL_URI=https://voidborn.fun/api/sendmail/hook');
console.log(`GOTRUE_HOOK_SEND_EMAIL_SECRETS=${hookSecret}`);
console.log('');
console.log('# Test SMTP from your machine (after .env is filled):');
console.log('npm run test:smtp');
console.log('npm run test:api');
console.log('');
