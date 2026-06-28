#!/usr/bin/env bash
# Send a one-off SMTP test using backend/.env (run on API VPS).
# Usage: bash scripts/test-smtp.sh recipient@example.com
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
ENV_FILE="$ROOT/.env"
TO="${1:-}"

[[ -f "$ENV_FILE" ]] || { echo "Missing $ENV_FILE" >&2; exit 1; }
[[ -n "$TO" ]] || { echo "Usage: $0 recipient@example.com" >&2; exit 1; }

set -a
# shellcheck source=/dev/null
source "$ENV_FILE"
set +a

: "${SMTP_HOST:?SMTP_HOST}"
: "${SMTP_USER:?SMTP_USER}"
: "${SMTP_PASS:?SMTP_PASS}"
SMTP_PORT="${SMTP_PORT:-465}"
FROM="${SMTP_ADMIN_EMAIL:-$SMTP_USER}"
NAME="${SMTP_SENDER_NAME:-VOIDBORN}"

python3 - "$SMTP_HOST" "$SMTP_PORT" "$SMTP_USER" "$SMTP_PASS" "$FROM" "$NAME" "$TO" <<'PY'
import smtplib, ssl, sys
from email.message import EmailMessage

host, port_s, user, password, from_addr, from_name, to_addr = sys.argv[1:8]
port = int(port_s)
msg = EmailMessage()
msg["Subject"] = "VOIDBORN SMTP test"
msg["From"] = f"{from_name} <{from_addr}>"
msg["To"] = to_addr
msg.set_content(
    "If you received this, cPanel SMTP works from the API VPS.\n\n"
    "Next: register on staging and check GoTrue confirmation mail.\n"
)

ctx = ssl.create_default_context()
if port == 465:
    with smtplib.SMTP_SSL(host, port, context=ctx, timeout=30) as smtp:
        smtp.login(user, password)
        smtp.send_message(msg)
else:
    with smtplib.SMTP(host, port, timeout=30) as smtp:
        smtp.ehlo()
        smtp.starttls(context=ctx)
        smtp.ehlo()
        smtp.login(user, password)
        smtp.send_message(msg)

print(f"OK — sent test mail to {to_addr} via {host}:{port}")
PY
) || {
  echo ""
  echo "[test-smtp] FAILED — connection timed out or refused."
  echo "  Cloud VPS often blocks outbound ports 465/587 (anti-spam)."
  echo "  Run: bash scripts/diagnose-api.sh"
  echo "  Fixes: try SMTP_PORT=587; whitelist this VPS IP in cPanel; or use Resend/Mailgun."
  exit 1
}
