#!/usr/bin/env bash
# Quick checks for API reachability from the backend VPS.
# Usage: bash scripts/diagnose-api.sh
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
ENV_FILE="$ROOT/.env"

[[ -f "$ENV_FILE" ]] || { echo "Missing $ENV_FILE" >&2; exit 1; }
# shellcheck source=/dev/null
source "$ENV_FILE"

API="${API_EXTERNAL_URL:-https://sportsydeals.com}"
ANON="${ANON_KEY:-}"

echo "=== API diagnose: $API ==="
echo ""

echo "--- HTTPS /auth/v1/health ---"
curl -sS -o /dev/null -w "HTTP %{http_code}\n" --max-time 15 "${API}/auth/v1/health" || echo "FAILED"

if [[ -n "$ANON" ]]; then
  echo ""
  echo "--- POST /auth/v1/signup (expect 400/422, not connection error) ---"
  curl -sS -o /tmp/signup-test.json -w "HTTP %{http_code}\n" --max-time 15 \
    -X POST "${API}/auth/v1/signup" \
    -H "apikey: ${ANON}" \
    -H "Content-Type: application/json" \
    -d '{"email":"test@example.com","password":"short"}' || echo "FAILED"
  head -c 200 /tmp/signup-test.json 2>/dev/null; echo ""
fi

echo ""
echo "--- SMTP ports (outbound from this VPS) ---"
for port in 465 587; do
  if timeout 5 bash -c "echo >/dev/tcp/mail.voidborn.fun/$port" 2>/dev/null; then
    echo "  mail.voidborn.fun:$port — reachable"
  else
    echo "  mail.voidborn.fun:$port — BLOCKED or timeout (common on cloud VPS)"
  fi
done

echo ""
echo "If signup curl fails: fix nginx/Kong/DNS for $API"
echo "If SMTP ports blocked: use port 587, whitelist VPS IP in cPanel, or use Resend/Mailgun SMTP"
