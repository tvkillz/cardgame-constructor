#!/usr/bin/env node
/**
 * Sync dist-cpanel/sendmail-cpanel/ → cPanel via rclone FTP.
 *
 * Config: sendmail/deploy/cpanel.local.env (or frontend/deploy/cpanel.local.env)
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const sendmailRoot = path.resolve(__dirname, '..');

function loadEnv(filePath) {
  if (!fs.existsSync(filePath)) return {};
  const out = {};
  for (const line of fs.readFileSync(filePath, 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    out[key] = val;
  }
  return out;
}

const configCandidates = [
  path.join(sendmailRoot, 'deploy', 'cpanel.local.env'),
  path.join(sendmailRoot, '..', 'frontend', 'deploy', 'cpanel.local.env'),
];
const configPath = configCandidates.find((p) => fs.existsSync(p));
if (!configPath) {
  throw new Error('Missing deploy/cpanel.local.env — copy deploy/cpanel.local.env.example');
}

const cfg = loadEnv(configPath);
const host = cfg.CPANEL_FTP_HOST;
const user = cfg.CPANEL_FTP_USER;
const pass = cfg.CPANEL_FTP_PASS;
const port = cfg.CPANEL_FTP_PORT || '21';
const tls = cfg.CPANEL_FTP_TLS !== '0';
const remoteDir = cfg.CPANEL_SENDMAIL_FTP_REMOTE_DIR || 'sendmail-cpanel';

if (!host || !user || !pass) {
  throw new Error('Set CPANEL_FTP_HOST, CPANEL_FTP_USER, CPANEL_FTP_PASS in cpanel.local.env');
}

const localDir = path.join(sendmailRoot, 'dist-cpanel', 'sendmail-cpanel');
if (!fs.existsSync(localDir)) {
  throw new Error(`Missing ${localDir} — run npm run build:cpanel first`);
}

const dryRun = process.argv.includes('--dry-run');
const tlsFlag = tls ? '--ftp-tls-implicit=false --ftp-explicit-tls' : '';

const cmd = [
  'rclone',
  'sync',
  localDir,
  `:ftp:${remoteDir}`,
  '--ftp-host',
  host,
  '--ftp-user',
  user,
  '--ftp-pass',
  pass,
  '--ftp-port',
  port,
  tlsFlag,
  '--transfers',
  '4',
  '--checkers',
  '8',
  dryRun ? '--dry-run' : '',
]
  .filter(Boolean)
  .join(' ');

console.log(`[upload:cpanel] ${dryRun ? 'dry-run ' : ''}→ ftp://${host}/${remoteDir}`);
execSync(cmd, { stdio: 'inherit', cwd: sendmailRoot });
console.log('[upload:cpanel] Done — Run NPM Install + Restart on cPanel if package.json changed');
