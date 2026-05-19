#!/usr/bin/env bash
# Quick check that the persistent profile still has a Midjourney session (no secrets printed).
set -euo pipefail

ROOT="${MIDJOURNEY_ROOT:-/home/sprite/explainer-video}"
PROFILE="${MIDJOURNEY_PROFILE:-$ROOT/.data/browser-midjourney}"

find_chrome() {
  ls -d "$HOME"/.cache/ms-playwright/chromium-*/chrome-linux/chrome 2>/dev/null | sort -V | tail -1
}

CHROME=$(find_chrome)
if [[ -z "${CHROME:-}" || ! -x "$CHROME" ]]; then
  echo "FAIL: Playwright Chromium not installed."
  exit 1
fi

if [[ ! -d "$PROFILE" ]]; then
  echo "FAIL: No profile at $PROFILE — run midjourney-browser.sh and sign in first."
  exit 1
fi

export DISPLAY=:98
Xvfb :98 -screen 0 1280x720x24 -ac >>/tmp/mj-check-xvfb.log 2>&1 &
XPID=$!
sleep 1

OUT=$(mktemp)
timeout 45 "$CHROME" \
  --user-data-dir="$PROFILE" \
  --headless=new \
  --no-sandbox \
  --disable-gpu \
  --dump-dom \
  --virtual-time-budget=15000 \
  "https://www.midjourney.com/explore" 2>/dev/null >"$OUT" || true

kill "$XPID" 2>/dev/null || true

if grep -qiE 'sign in|log in|login' "$OUT" && ! grep -qi 'explore' "$OUT"; then
  echo "WARN: Page may require login again. Open noVNC and re-authenticate if image gen fails."
  rm -f "$OUT"
  exit 2
fi

if grep -qiE 'explore|create|imagine|midjourney' "$OUT"; then
  echo "OK: Profile at $PROFILE looks logged in (Midjourney content detected)."
  rm -f "$OUT"
  exit 0
fi

echo "UNKNOWN: Could not confirm login from page HTML. Try noVNC manually."
rm -f "$OUT"
exit 3
