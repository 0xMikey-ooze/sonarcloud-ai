# Design Research: Newsletter Email Template (Pedagogy Sys)

## TL;DR

Built a 600px table-based HTML email template at `output/newsletter-template.html` that strictly follows `design.md` (warm beige body, white cards, electric blue CTAs, vibrant orange attention block, Courier New for data labels, 8px spacing system, 4px button radius, 8px card radius). The template uses an **editorial-with-data-strip** layout — hero card, attention alert in `#F55C47`, monospace metrics row, spotlight card, ranked article list, progress bar, and forward CTA. Above-the-fold (hero + alert + metrics) fits in ~600px of vertical space; mobile collapses metrics to a stacked single column.

## Recommendations / Next Steps

1. **Use this static HTML as the visual source of truth** — your `WeeklyNewsletter.tsx` is close to design.md but has drift (`#A8A29E`, `#D6D3D1`, `#E7E5E4`, `#E5E7EB` are not in the palette, category badges use non-spec blues/greens/purples). Reconcile the React component against `output/newsletter-template.html`.
2. **Replace the bold blue-background header** with a white hero card + a primary-blue CTA. The current `WeeklyNewsletter.tsx` puts the title on a saturated `#3A86FF` background — design.md treats `#3A86FF` as a *CTA* color, not a header surface. The hero card pattern preserves the Pedagogy Sys "warm/clinical" feel.
3. **Add a data strip** (Articles / Sources / Read Time) right under the hero. This is the single most "Pedagogy Sys" touch missing from the current template — it leans into the monospace + measurement aesthetic and gives readers a 1-glance summary.
4. **Promote the `#F55C47` block** to a recurring "ATTENTION" slot. The orange highlight container is the boldest item in the palette; use it once per issue for the single most important number/finding.
5. **Use Courier New labels (`◆`, `SYS_LOG`, `N=`, `p<`)** for section headers and inline metadata. This is what makes the template feel like Pedagogy Sys instead of generic Mailchimp.

### ASCII layout

```
┌─ 600px ──────────────────────────────────┐
│  SYS_LOG / date          [ SYS OPTIMAL ] │  ← prelude row
├──────────────────────────────────────────┤
│  ISSUE_NO: 012                           │
│  Classroom Vectors           ← 32/700    │  ← hero card (white)
│  This week's signal...                   │
│  [ READ THE ISSUE → ]        ← #3A86FF   │
├──────────────────────────────────────────┤
│ ⚠ ATTENTION SPAN                         │  ← #F55C47 block
│ Median K-5 focus 8.2 min (-14%)          │
├──────────────────────────────────────────┤
│  ARTICLES   │  SOURCES   │  READ TIME    │  ← data strip
│     14      │     07     │    9 min      │
├──────────────────────────────────────────┤
│  ◆ SPOTLIGHT                             │
│  ┌────────────────────────────────────┐  │
│  │ [Educational AI]                   │  │
│  │ The Tutor in the Loop...           │  │  ← spotlight card
│  │ N=1,284  D=84d  p<0.01             │  │
│  │ Read the study →                   │  │
│  └────────────────────────────────────┘  │
├──────────────────────────────────────────┤
│  ◆ KIDS AUDIO                            │
│  ┌────────────────────────────────────┐  │
│  │ [Kids Audio]  Article 1            │  │
│  │ ──────────────────────────────     │  │
│  │ [Podcasting]  Article 2            │  │
│  │ ──────────────────────────────     │  │
│  │ [Parenting]   Article 3            │  │
│  └────────────────────────────────────┘  │
├──────────────────────────────────────────┤
│  ◆ THIS QUARTER'S TRACK                  │
│  Goal: 24 studies by July                │
│  ████████████░░░░░░░░  14/24  58%        │  ← progress bar
├──────────────────────────────────────────┤
│  Enjoying the signal?                    │
│  [ FORWARD → ]            ← secondary    │
├──────────────────────────────────────────┤
│  PEDAGOGY_SYS / weekly                   │
│  Unsubscribe · Preferences · Web view    │
└──────────────────────────────────────────┘
```

## Patterns (what the best newsletters share)

- **600–640px capped container** is still the 2026 default — every guide agrees, including the Tabular and Mailtrap guides. The template uses 600px with fluid collapse to 100% < 600px.
- **Header → Hero → Intro → Cards → CTA → Footer** row order — each row is its own `<table>` so Outlook renders correctly.
- **Single, obvious next action above the fold** — one primary CTA in the hero; secondary CTAs (forward, view in browser) deferred to lower in the email.
- **Multi-column layouts collapse to single column on mobile** via media queries on `display:block + width:100%`. The metrics strip uses this pattern.
- **Hero images sourced 2× and constrained** (1200px → 600px) — not used in this template since Pedagogy Sys leans into typography and data over photography, but the slot is there if you want it.

## Anti-patterns (avoided in this build)

- **Saturated full-bleed colored headers.** Common in Mailchimp templates, but on a `#F0EDE5` warm body, a blue header creates harsh contrast. Pedagogy Sys's white hero card on beige is the move.
- **Category badges in arbitrary pastel colors.** The current React component uses 5 different bg/text/border palettes per category — none of which are in `design.md`. The new template uses *one* badge style (`#F0EDE5` bg, `#222222` text, `#CCCCCC` border) and reserves `#3A86FF` solid badges for the spotlight.
- **Pure black body text.** `design.md` is explicit: use `#222222`, not `#000000`. The progress bar fill is the *only* element using true black.
- **Decorative shadows everywhere.** Each surface uses one shadow at its assigned elevation (L1–L3); no nested shadows.

## Unique angles worth stealing

- **Monospace inline data (`N=1,284  D=84d  p<0.01`)** under the spotlight headline. Treats the article preview like a research paper abstract — high credibility, low pixel cost.
- **`SYS_LOG / 2026.05.11` + `SYS OPTIMAL` badge prelude row** above the hero. Costs nothing visually but cements the "instrument panel" aesthetic.
- **Progress bar at the bottom showing newsletter's own track.** Most newsletters bury this kind of meta info in the footer or skip it entirely; foregrounding it makes readers feel they're following a measured series, not getting random links.

## Findings

**Width:** 600px is still the safe default in 2026. Outlook desktop, Apple Mail, Gmail web, and all mobile clients render 600px tables identically. Going wider (680px) is workable but only if you control the audience.

**Layout primitive:** Tables nested in tables. `<div>`-based emails work in modern clients but break in Outlook desktop. The template uses `role="presentation"` tables exclusively.

**Spacing system fit:** `design.md`'s 8px base ports cleanly to email — 16, 24, 32 are all common email paddings already. Card padding stays at 24px on desktop; the mobile media query drops it to 16px.

**Color palette fit:** The trickiest decision was the header. `design.md` shows highlight containers as `#F55C47` with white text, and CTAs as `#3A86FF`. Treating the *whole header* as a `#3A86FF` block (as the existing React component does) overuses the CTA color and weakens its meaning. Solution: hero is a white card, and `#3A86FF` is reserved for the "Read the issue →" button and the spotlight category badge.

**Typography fit:** Arial + Courier New is an unusually safe email-font pair — both are universally installed across Outlook/Gmail/Apple Mail with no web-font fallback needed. `design.md`'s monospace-for-data rule works as a free differentiation lever in email, where almost no template uses monospace.

## Sources

- [Email Template Size Guide 2026 — Tabular](https://tabular.email/blog/email-template-size-width-and-height)
- [Responsive Email Design Tutorial 2026 — Mailtrap](https://mailtrap.io/blog/responsive-email-design/)
- [Designing High-Performance Email Layouts in 2026 — Medium / Romualdo Bugai](https://medium.com/@romualdo.bugai/designing-high-performance-email-layouts-in-2026-a-practical-guide-from-the-trenches-a3e7e4535692)
- [Newsletter design ideas 2026 — Omnisend](https://www.omnisend.com/blog/email-newsletter-design/)
- [Educational Email Examples 2026 — Selzy](https://selzy.com/en/blog/educational-email-examples/)
- [Email Design Best Practices 2026 — Retainful](https://www.retainful.com/blog/email-design-best-practice)

## Files produced

- `output/newsletter-template.html` — the static, email-client-ready template
- `.lazyweb/design-research/newsletter-email-template-2026-05-11/report.md` — this report
