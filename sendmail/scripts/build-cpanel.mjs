#!/usr/bin/env node
/**
 * Bundle sendmail for cPanel Node.js deploy (no node_modules).
 *
 *   npm run build:cpanel
 *   npm run deploy:cpanel   # build + FTP sync when cpanel.local.env exists
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const sendmailRoot = path.resolve(__dirname, '..');
const outDir = path.join(sendmailRoot, 'dist-cpanel', 'sendmail-cpanel');

const COPY = [
  'server.js',
  'package.json',
  'package-lock.json',
  '.env.example',
  'CPANEL.md',
  'src',
];

function rmrf(target) {
  fs.rmSync(target, { recursive: true, force: true });
}

function copyRecursive(src, dest) {
  const stat = fs.statSync(src);
  if (stat.isDirectory()) {
    fs.mkdirSync(dest, { recursive: true });
    for (const entry of fs.readdirSync(src)) {
      copyRecursive(path.join(src, entry), path.join(dest, entry));
    }
    return;
  }
  fs.copyFileSync(src, dest);
}

rmrf(outDir);
fs.mkdirSync(outDir, { recursive: true });

for (const rel of COPY) {
  const src = path.join(sendmailRoot, rel);
  if (!fs.existsSync(src)) {
    if (rel === 'package-lock.json') continue;
    console.warn(`[build:cpanel] skip missing ${rel}`);
    continue;
  }
  copyRecursive(src, path.join(outDir, rel));
}

const setup = `# cPanel sendmail deploy

1. Upload \`dist-cpanel/sendmail-cpanel/\` to e.g. \`~/sendmail-cpanel/\` (FTP / rclone).
2. cPanel → **Setup Node.js App**:
   - Application root: \`sendmail-cpanel\`
   - Application URL: \`api/sendmail\`
   - Startup file: \`server.js\`
   - Node 20+
3. **Run NPM Install**, then set env vars from \`.env.example\` (see CPANEL.md).
4. **Restart** app.
5. Test: \`curl https://voidborn.fun/api/sendmail/health\`

Generated: ${new Date().toISOString()}
`;
fs.writeFileSync(path.join(outDir, 'SETUP.md'), setup);

console.log(`[build:cpanel] → ${outDir}`);

const upload = process.argv.includes('--upload');
if (!upload) {
  process.exit(0);
}

const configCandidates = [
  path.join(sendmailRoot, 'deploy', 'cpanel.local.env'),
  path.join(sendmailRoot, '..', 'frontend', 'deploy', 'cpanel.local.env'),
];

const configPath = configCandidates.find((p) => fs.existsSync(p));
if (!configPath) {
  console.error('[build:cpanel] --upload needs deploy/cpanel.local.env (copy from .example)');
  process.exit(1);
}

execSync(`node ${path.join(__dirname, 'upload-cpanel.mjs')}`, {
  stdio: 'inherit',
  cwd: sendmailRoot,
});
