#!/usr/bin/env bash
# Deploy built frontend artifacts from local machine → VPS.
# Does NOT ship src/, game/, or projects source packs.
#
# Usage (from repo root or frontend/):
#   bash frontend/deploy/scripts/deploy-from-local.sh
#   bash frontend/deploy/scripts/deploy-from-local.sh --site voidborn
#   bash frontend/deploy/scripts/deploy-from-local.sh --dry-run
#   bash frontend/deploy/scripts/deploy-from-local.sh --skip-build
#   bash frontend/deploy/scripts/deploy-from-local.sh --skip-game
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
FRONTEND_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"
REPO_ROOT="$(cd "$FRONTEND_DIR/.." && pwd)"
CONFIG_FILE="$FRONTEND_DIR/deploy/deploy.local.env"

DRY_RUN=0
SKIP_BUILD=0
SKIP_GAME=0
SITE_FILTER=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    --dry-run)    DRY_RUN=1 ;;
    --skip-build) SKIP_BUILD=1 ;;
    --skip-game)  SKIP_GAME=1 ;;
    --site)       SITE_FILTER="$2"; shift ;;
    -h|--help)
      echo "Usage: $0 [--site ID] [--dry-run] [--skip-build] [--skip-game]"
      exit 0
      ;;
    *) echo "Unknown option: $1" >&2; exit 1 ;;
  esac
  shift
done

[[ -f "$CONFIG_FILE" ]] || { echo "Missing $CONFIG_FILE — see deploy guide." >&2; exit 1; }
# shellcheck source=/dev/null
source "$CONFIG_FILE"

: "${VPS_HOST:?Set VPS_HOST in deploy.local.env}"
: "${VPS_USER:?Set VPS_USER in deploy.local.env}"
: "${VPS_FRONTEND_DIR:?Set VPS_FRONTEND_DIR}"
: "${VPS_PROJECTS_DIR:?Set VPS_PROJECTS_DIR}"
PM2_APPS="${PM2_APPS:-voidborn-prod}"

SSH_TARGET="${VPS_USER}@${VPS_HOST}"
RSYNC_SSH=(rsync -avz --progress)
[[ "$DRY_RUN" == "1" ]] && RSYNC_SSH+=(--dry-run)

log() { echo "[deploy] $*"; }

# --- Resolve sites from registry ---
read_registry() {
  node -e "
    const r = require('$REPO_ROOT/projects/registry.json');
    const filter = '$SITE_FILTER';
    for (const s of r) {
      if (!filter || s.id === filter) console.log(s.id);
    }
  "
}

SITES=()
while IFS= read -r line; do
  [[ -n "$line" ]] && SITES+=("$line")
done < <(read_registry)

[[ ${#SITES[@]} -gt 0 ]] || { echo "No sites matched." >&2; exit 1; }
log "Sites: ${SITES[*]}"

# --- Build locally ---
if [[ "$SKIP_BUILD" != "1" ]]; then
  log "Building locally…"
  cd "$FRONTEND_DIR"
  for site in "${SITES[@]}"; do
    if [[ "$SKIP_GAME" == "1" ]]; then
      log "  compile + build:web (skip game): $site"
      PROJECT="$site" node scripts/compile-project.mjs
      PROJECT="$site" node scripts/build-prod.mjs --skip-game --skip-compile
    else
      log "  compile + build: $site"
      PROJECT="$site" npm run build
    fi
  done
else
  log "Skipping build (--skip-build)"
fi

# --- Verify build outputs ---
for site in "${SITES[@]}"; do
  [[ -d "$FRONTEND_DIR/.build/$site/.next" ]] || {
    echo "Missing .build/$site/.next — run build first." >&2
    exit 1
  }
done

# --- Rsync runtime shell (frontend) ---
log "Syncing runtime files…"
"${RSYNC_SSH[@]}" \
  "$FRONTEND_DIR/package.json" \
  "$FRONTEND_DIR/package-lock.json" \
  "$FRONTEND_DIR/next.config.ts" \
  "$FRONTEND_DIR/ecosystem.config.cjs" \
  "$SSH_TARGET:$VPS_FRONTEND_DIR/"

"${RSYNC_SSH[@]}" \
  "$FRONTEND_DIR/scripts/project-ports.mjs" \
  "$FRONTEND_DIR/scripts/project-next.mjs" \
  "$FRONTEND_DIR/scripts/project-paths.mjs" \
  "$FRONTEND_DIR/scripts/site-hybrid.mjs" \
  "$SSH_TARGET:$VPS_FRONTEND_DIR/scripts/"

"${RSYNC_SSH[@]}" \
  --exclude 'output/' \
  --exclude 'deploy.local.env' \
  "$FRONTEND_DIR/deploy/" \
  "$SSH_TARGET:$VPS_FRONTEND_DIR/deploy/"

ssh "$SSH_TARGET" "mkdir -p '$VPS_FRONTEND_DIR/.build' '$VPS_PROJECTS_DIR'"

# --- Rsync per-site build artifacts ---
for site in "${SITES[@]}"; do
  log "  .build/$site/"
  "${RSYNC_SSH[@]}" --delete \
    "$FRONTEND_DIR/.build/$site/" \
    "$SSH_TARGET:$VPS_FRONTEND_DIR/.build/$site/"
done

# --- Rsync minimal projects/ (registry + manifests only) ---
log "Syncing minimal projects/…"
"${RSYNC_SSH[@]}" \
  "$REPO_ROOT/projects/registry.json" \
  "$SSH_TARGET:$VPS_PROJECTS_DIR/"

for site in "${SITES[@]}"; do
  ssh "$SSH_TARGET" "mkdir -p '$VPS_PROJECTS_DIR/$site'"
  "${RSYNC_SSH[@]}" \
    "$REPO_ROOT/projects/$site/manifest.json" \
    "$SSH_TARGET:$VPS_PROJECTS_DIR/$site/"
done

# --- Optional: sync .env.production ---
if [[ "${SYNC_ENV:-0}" == "1" && -f "$FRONTEND_DIR/.env.production" ]]; then
  log "Syncing .env.production"
  "${RSYNC_SSH[@]}" \
    "$FRONTEND_DIR/.env.production" \
    "$SSH_TARGET:$VPS_FRONTEND_DIR/"
fi

# --- Remote: install deps + restart pm2 ---
if [[ "$DRY_RUN" == "1" ]]; then
  log "Dry run — skipping remote npm/pm2."
  exit 0
fi

log "Installing production deps on VPS…"
ssh "$SSH_TARGET" bash -s <<REMOTE
set -euo pipefail
cd "$VPS_FRONTEND_DIR"
npm ci --omit=dev

if pm2 describe ${PM2_APPS%%,*} >/dev/null 2>&1; then
  pm2 restart $PM2_APPS
else
  pm2 start ecosystem.config.cjs --only $PM2_APPS
fi
pm2 save
REMOTE

log "Done. Check: pm2 logs ${PM2_APPS%%,*}"