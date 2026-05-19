# Midjourney session on `explainer-video-agent` (Sprites.dev)

Persistent browser profile on the sprite so you can sign into Midjourney once, keep cookies across restarts, and later drive image generation via automation (Playwright/CDP).

**Profile path (persistent, not in git):**

`/home/sprite/explainer-video/.data/browser-midjourney`

**Runtime state (PIDs/logs):**

`/home/sprite/explainer-video/.data/midjourney-vnc/`

## Prerequisites (sprite)

One-time on the sprite (already done if you use the maintained image):

```bash
sprite exec -s explainer-video-agent -- bash -c 'cd /home/sprite/explainer-video && npx --yes playwright@1.49.1 install chromium'
sprite exec -s explainer-video-agent -- bash -c 'sudo apt-get install -y xvfb x11vnc novnc websockify'
```

Chromium comes from Playwright under `~/.cache/ms-playwright/` (not the Ubuntu snap wrapper).

## One-time login (Mac)

**Terminal 1** — start the browser stack on the sprite:

```bash
sprite exec -s explainer-video-agent -- bash /home/sprite/explainer-video/scripts/midjourney-browser.sh
```

**Terminal 2** — forward noVNC (and optional CDP) to your Mac:

```bash
sprite proxy -s explainer-video-agent 6080 9222
```

**Browser on Mac** — open:

[http://127.0.0.1:6080/vnc.html](http://127.0.0.1:6080/vnc.html)

Click **Connect**. Sign in at Midjourney (use Discord/Google in the remote Chromium if prompted). Complete any 2FA on your phone.

**Terminal 1 again** — stop the stack (profile is kept):

```bash
sprite exec -s explainer-video-agent -- bash /home/sprite/explainer-video/scripts/midjourney-browser-stop.sh
```

## Verify session after restart

```bash
sprite exec -s explainer-video-agent -- bash /home/sprite/explainer-video/scripts/midjourney-session-check.sh
```

- `OK` — profile likely still logged in  
- `WARN` / `UNKNOWN` — open noVNC again and re-login

Optional visual check: run `midjourney-browser.sh` + `sprite proxy 6080` and confirm you land on Explore/Create without a login wall.

## Agent / automation later

- **CDP** (with stack running): `sprite proxy 9222`, then connect Playwright or `browser-harness` to `http://127.0.0.1:9222` from the Mac (same tunnel as noVNC).
- **Headless reuse** (no VNC): launch the same Chrome binary with `--user-data-dir=/home/sprite/explainer-video/.data/browser-midjourney` (see `scripts/midjourney-session-check.sh`).

Do **not** commit `.data/browser-midjourney/` or copy cookies off the sprite into the repo.

## Sync scripts from Mac

After editing scripts or this doc locally:

```bash
cd /Users/baptistefam/newsletter/explainer-video
tar czf - scripts/midjourney-browser.sh scripts/midjourney-browser-stop.sh scripts/midjourney-session-check.sh docs/midjourney-sprite-session.md \
  | sprite exec -s explainer-video-agent -- bash -c 'cd /home/sprite/explainer-video && tar xzf -'
```

## Risks

- **Midjourney ToS** — automation may violate terms; use for personal/production workflows you are allowed to run.
- **Fragility** — UI and auth flows change; session check is heuristic.
- **Discord** — some flows still need Discord authorization inside the same browser profile.
- **Sprite disk** — profile lives on sprite persistent storage; destroying the sprite loses the session unless you checkpoint/backup `.data/browser-midjourney` outside git.

## Troubleshooting

| Issue | Action |
|--------|--------|
| Blank noVNC | Ensure `sprite proxy 6080` is running; restart `midjourney-browser.sh` |
| `No Chromium found` | Run Playwright `install chromium` on sprite |
| Login loop | Clear only if needed: stop stack, rename `.data/browser-midjourney` backup, login again |
| Public URL instead of proxy | Sprite HTTP URL is for app ports (e.g. 3030); prefer `sprite proxy` for VNC |

## Related

- Explainer pipeline default images: Recraft (`IMAGE_PROVIDER=recraft` in `.env.local`).
- Midjourney on sprite is optional for scene stills when you want MJ instead of Recraft.
