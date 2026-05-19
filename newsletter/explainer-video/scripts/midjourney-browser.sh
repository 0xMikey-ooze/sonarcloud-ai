#!/usr/bin/env bash
# Start persistent Chromium + noVNC on the sprite for one-time Midjourney login.
set -euo pipefail

ROOT="${MIDJOURNEY_ROOT:-/home/sprite/explainer-video}"
PROFILE="${MIDJOURNEY_PROFILE:-$ROOT/.data/browser-midjourney}"
RUN_DIR="${MIDJOURNEY_RUN_DIR:-$ROOT/.data/midjourney-vnc}"
DISPLAY_NUM="${MIDJOURNEY_DISPLAY:-:99}"
VNC_PORT="${MIDJOURNEY_VNC_PORT:-5900}"
NOVNC_PORT="${MIDJOURNEY_NOVNC_PORT:-6080}"
CDP_PORT="${MIDJOURNEY_CDP_PORT:-9222}"
SCREEN="${MIDJOURNEY_SCREEN:-1920x1080x24}"

find_chrome() {
  local c
  c=$(ls -d "$HOME"/.cache/ms-playwright/chromium-*/chrome-linux/chrome 2>/dev/null | sort -V | tail -1 || true)
  if [[ -n "${c:-}" && -x "$c" ]]; then
    echo "$c"
    return 0
  fi
  if [[ -x /usr/bin/chromium-browser ]] && ! /usr/bin/chromium-browser --version 2>&1 | grep -q snap; then
    echo /usr/bin/chromium-browser
    return 0
  fi
  return 1
}

CHROME=$(find_chrome) || {
  echo "No Chromium found. On the sprite run:" >&2
  echo "  cd $ROOT && npx --yes playwright@1.49.1 install chromium" >&2
  exit 1
}

mkdir -p "$PROFILE" "$RUN_DIR"
export DISPLAY="${DISPLAY_NUM#:}"
DISPLAY=":${DISPLAY}"

if [[ -f "$RUN_DIR/novnc.pid" ]] && kill -0 "$(cat "$RUN_DIR/novnc.pid")" 2>/dev/null; then
  echo "Midjourney browser stack already running (pid $(cat "$RUN_DIR/novnc.pid"))."
  exit 0
fi

# Clean stale PIDs
for f in xvfb.pid x11vnc.pid chrome.pid novnc.pid; do
  if [[ -f "$RUN_DIR/$f" ]]; then
    pid=$(cat "$RUN_DIR/$f")
    kill -0 "$pid" 2>/dev/null || rm -f "$RUN_DIR/$f"
  fi
done

Xvfb "$DISPLAY" -screen 0 "$SCREEN" -ac -nolisten tcp >>"$RUN_DIR/xvfb.log" 2>&1 &
echo $! >"$RUN_DIR/xvfb.pid"
sleep 1

x11vnc -display "$DISPLAY" -forever -shared -rfbport "$VNC_PORT" -localhost -noxdamage \
  >>"$RUN_DIR/x11vnc.log" 2>&1 &
echo $! >"$RUN_DIR/x11vnc.pid"
sleep 1

"$CHROME" \
  --user-data-dir="$PROFILE" \
  --no-first-run \
  --no-default-browser-check \
  --disable-dev-shm-usage \
  --no-sandbox \
  --remote-debugging-port="$CDP_PORT" \
  --remote-debugging-address=127.0.0.1 \
  "https://www.midjourney.com/" \
  >>"$RUN_DIR/chrome.log" 2>&1 &
echo $! >"$RUN_DIR/chrome.pid"

websockify --web=/usr/share/novnc "$NOVNC_PORT" "127.0.0.1:$VNC_PORT" \
  >>"$RUN_DIR/novnc.log" 2>&1 &
echo $! >"$RUN_DIR/novnc.pid"

cat <<EOF

Midjourney login browser is running on the sprite.

  Profile (persistent):  $PROFILE
  Chrome binary:         $CHROME
  noVNC port:            $NOVNC_PORT
  CDP port:              $CDP_PORT

On your Mac (keep this terminal open):

  sprite proxy -s explainer-video-agent $NOVNC_PORT $CDP_PORT

Then open in your local browser:

  http://127.0.0.1:$NOVNC_PORT/vnc.html

Sign in to Midjourney (and Discord in the same browser if prompted).
When finished, run on the sprite:

  bash $ROOT/scripts/midjourney-browser-stop.sh

Verify session later:

  bash $ROOT/scripts/midjourney-session-check.sh

EOF
