#!/usr/bin/env bash
set -euo pipefail

: "${TELEGRAM_BOT_TOKEN:?Isi TELEGRAM_BOT_TOKEN}"
: "${TELEGRAM_WEBHOOK_SECRET:?Isi TELEGRAM_WEBHOOK_SECRET}"
: "${PUBLIC_APP_URL:?Isi PUBLIC_APP_URL, contoh https://domain-anda.com}"

curl -sS "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/setWebhook" \
  -H 'Content-Type: application/json' \
  -d "{\"url\":\"${PUBLIC_APP_URL%/}/api/telegram/webhook\",\"secret_token\":\"${TELEGRAM_WEBHOOK_SECRET}\",\"allowed_updates\":[\"message\"]}"

echo
