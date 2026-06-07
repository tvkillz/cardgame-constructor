#!/usr/bin/env bash
# Frontend VPS bootstrap — nginx (systemd) + Let's Encrypt + pm2 site map.
# Run on a fresh Ubuntu/Debian VPS as root (or with sudo).
#
#   cd /path/to/constructor-files/frontend
#   sudo bash deploy/scripts/setup-vps.sh install
#   sudo bash deploy/scripts/setup-vps.sh configure
#   # point DNS A records to this VPS, then:
#   sudo bash deploy/scripts/setup-vps.sh ssl
#   sudo bash deploy/scripts/setup-vps.sh reload
set -euo pipefail

FRONTEND_DIR="$(cd "$(dirname "$0")/../.." && pwd)"
NGINX_AVAILABLE="/etc/nginx/sites-available/constructor-frontend.conf"
NGINX_ENABLED="/etc/nginx/sites-enabled/constructor-frontend.conf"
NGINX_HTPASSWD="/etc/nginx/constructor-htpasswd"
CERTBOT_EMAIL="${CERTBOT_EMAIL:-}"
CERTBOT_STAGING="${CERTBOT_STAGING:-0}"
SITE_AUTH_USERNAME="${SITE_AUTH_USERNAME:-dev}"
SITE_AUTH_PASSWORD="${SITE_AUTH_PASSWORD:-dev}"

log() { echo "[setup-vps] $*"; }
die() { echo "[setup-vps] ERROR: $*" >&2; exit 1; }

require_root() {
  [[ "${EUID:-$(id -u)}" -eq 0 ]] || die "Run as root: sudo bash $0 $*"
}

write_htpasswd() {
  HASH="$(openssl passwd -apr1 "$SITE_AUTH_PASSWORD")"
  printf '%s:%s\n' "$SITE_AUTH_USERNAME" "$HASH" > "$NGINX_HTPASSWD"
  chmod 640 "$NGINX_HTPASSWD"
  chown root:www-data "$NGINX_HTPASSWD" 2>/dev/null || true
  log "HTTP basic auth: $SITE_AUTH_USERNAME (file: $NGINX_HTPASSWD)"
}

cmd_install() {
  require_root
  log "Installing nginx and certbot…"
  export DEBIAN_FRONTEND=noninteractive
  apt-get update -qq
  apt-get install -y nginx certbot python3-certbot-nginx
  mkdir -p /var/www/certbot
  systemctl enable nginx
  systemctl start nginx
  log "nginx enabled (systemd). Version: $(nginx -v 2>&1)"
}

cmd_configure() {
  require_root
  write_htpasswd
  log "Generating nginx config from registry…"
  node "$FRONTEND_DIR/deploy/scripts/generate-nginx.mjs" --http-only --install
  ln -sf "$NGINX_AVAILABLE" "$NGINX_ENABLED"
  rm -f /etc/nginx/sites-enabled/default
  nginx -t
  systemctl reload nginx
  log "Configured. Sites → pm2 prod ports (see deploy/output/cors-origins.txt for backend CORS)."
  log "Next: point DNS here, then: sudo CERTBOT_EMAIL=you@domain.com bash $0 ssl"
}

cmd_ssl() {
  require_root
  [[ -n "$CERTBOT_EMAIL" ]] || die "Set CERTBOT_EMAIL=you@domain.com"

  log "Collecting domains from registry…"
  DOMAINS=()
  while IFS= read -r line; do
    [[ -n "$line" ]] && DOMAINS+=("$line")
  done < <(
    node -e "
      const { loadRegistry } = require('$FRONTEND_DIR/scripts/project-ports.mjs');
      const fs = require('fs');
      const path = require('path');
      const root = path.join('$FRONTEND_DIR', '../projects');
      for (const s of loadRegistry()) {
        let d = s.domain;
        if (!d) {
          const m = JSON.parse(fs.readFileSync(path.join(root, s.id, 'manifest.json'), 'utf8'));
          d = new URL(m.siteUrl).hostname;
        }
        d = d.replace(/^https?:\\/\\//,'').replace(/\\/.*\$/, '');
        console.log(d);
        console.log('www.' + d);
      }
    "
  )

  STAGING_ARG=()
  [[ "$CERTBOT_STAGING" == "1" ]] && STAGING_ARG=(--staging)

  log "Requesting certificates for: ${DOMAINS[*]}"
  certbot --nginx "${STAGING_ARG[@]}" --non-interactive --agree-tos -m "$CERTBOT_EMAIL" \
    $(printf ' -d %s' "${DOMAINS[@]}")

  node "$FRONTEND_DIR/deploy/scripts/generate-nginx.mjs" --install
  nginx -t
  systemctl reload nginx
  log "SSL active. Cert renewal: certbot renew (systemd timer usually installed with certbot)."
}

cmd_reload() {
  require_root
  write_htpasswd
  node "$FRONTEND_DIR/deploy/scripts/generate-nginx.mjs" --install
  nginx -t
  systemctl reload nginx
  log "nginx reloaded."
}

cmd_all() {
  cmd_install
  cmd_configure
  log "Skipping ssl in 'all' — run ssl after DNS: CERTBOT_EMAIL=… bash $0 ssl"
}

case "${1:-}" in
  install)   cmd_install ;;
  configure) cmd_configure ;;
  ssl)       cmd_ssl ;;
  reload)    cmd_reload ;;
  all)       cmd_all ;;
  *)
    cat <<EOF
Usage: sudo bash deploy/scripts/setup-vps.sh <command>

  install    apt install nginx + certbot, enable systemd service
  configure  generate site blocks (HTTP), enable constructor-frontend.conf
  ssl        certbot --nginx for all registry domains (needs DNS + CERTBOT_EMAIL)
  reload     regenerate config (picks up new certs / registry sites) and reload
  all        install + configure

Env:
  CERTBOT_EMAIL   required for ssl
  CERTBOT_STAGING=1   use Let's Encrypt staging (testing)

Before ssl:
  1. npm run compile:all && build each site
  2. pm2 start ecosystem.config.cjs --only voidborn-prod,project2-prod
  3. Copy deploy/env.production.example → .env.production (set BACKEND API URL)
  4. Point each site domain A record to this VPS
EOF
    exit 1
    ;;
esac
