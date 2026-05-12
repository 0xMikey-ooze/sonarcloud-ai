# Claude rules for this repo

See `AGENTS.md` for the full ruleset. Critical pins:

## ⚠ One template. One design source.

- **Design source:** `design.md`
- **THE template:** `src/newsletter/scripts/generate-and-send-premium.ts` (inline HTML via `renderPremiumHtml()`)
- **Send command:** `npm run newsletter:send-premium`
- **Output (read-only):** `output/newsletter-issue-N.html`

Never:
- Create a second email template (no React Email TSX template, no static HTML twin)
- Hand-edit a generated `output/newsletter-issue-N.html`
- Recreate `output/newsletter-template.html` — it was deleted on purpose
- Add color/spacing values that aren't in `design.md` first

If a second template appears, **delete it**.

## Before any send — MANDATORY

1. **Mobile mode check** — DevTools at iPhone width, verify stacks
2. **Dogfood every link** — no `href="#"`, no `example.com`, no 404s
3. **Subject lines** — under 50 chars, no emojis, no generic phrases ("Weekly Roundup"), no publication names. Use curiosity gap, benefit+number, or contrarian angle. Curator generates three options, strongest selected.
4. **One test recipient by default**
5. **HTML size under 102KB** (Gmail clipping threshold)

After sending: report the Resend message id.

## Content pipeline (do not reintroduce removed clients)

- **Primary:** Exa neural search (`exa-client.ts`) — last 14 days
- **Fallback:** TinyFish (currently 403), Perplexity
- **Press release filter** — auto-strips PR wires, product launches, funding announcements
- **DeepSeek curator** — persona filter + subject line generator (`curator.ts`)
- **History tracker** — dedupes URLs across issues (`history-tracker.ts`)
- **Removed on purpose:** Reddit, Hacker News, GitHub clients. Don't bring them back.

## Persona system

Three rotating personas as primary "focus":
- `tech-savvy-educator` → Focus: Educators
- `screen-free-parent` → Focus: Parents
- `podcast-curious-creator` → Focus: Creators

Every issue still serves both educators AND parents. The primary persona only drives spotlight + subject angle. Articles get audience tags: educator (blue), parent (coral), both (green).

## Template features (in `renderPremiumHtml`)

- 600px single-column, table-based for Outlook
- Dark mode via `@media (prefers-color-scheme: dark)`
- Mobile responsive at ≤600px (15px body, 44px tap targets, 72×72 thumbs)
- Alt text on every image
- ~80:20 text-to-image (spam-safe)
- Sections: Hero → Metrics (Signals, Sources, Yoto partner ad) → Spotlight → Field Notes → Forward CTA → Partners → Footer

## Persistence

- Skills installed live in `.agents/skills/`
- `.env.local` is gitignored. Never echo secret values.
- Sends hit Resend's real API. Always report the message id.
- Confirm the recipient before any follow-up send.
