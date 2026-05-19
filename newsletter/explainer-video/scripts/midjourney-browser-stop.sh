#!/usr/bin/env bash
set -euo pipefail

ROOT="${MIDJOURNEY_ROOT:-/home/sprite/explainer-video}"
RUN_DIR="${MIDJOURNEY_RUN_DIR:-$ROOT/.data/midjourney-vnc}"

stop_pid() {
  local file=$1
  [[ -f "$RUN_DIR/$file" ]] || return 0
  local pid
  pid=$(cat "$RUN_DIR/$file")
  if kill -0 "$pid" 2>/dev/null; then
    kill "$pid" 2>/dev/null || true
    sleep 0.5
    kill -9 "$pid" 2>/dev/null || true
  fi
  rm -f "$RUN_DIR/$file"
}

for f in novnc.pid chrome.pid x11vnc.pid xvfb.pid; do
  stop_pid "$f"
done

pkill -f "user-data-dir=.*/browser-midjourney" 2>/dev/null || true
echo "Stopped Midjourney browser stack. Profile kept at: ${MIDJOURNEY_PROFILE:-$ROOT/.data/browser-midjourney}"
