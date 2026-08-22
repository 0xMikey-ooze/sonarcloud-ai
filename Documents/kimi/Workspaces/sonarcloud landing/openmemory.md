# SonarCloud Landing — OpenMemory Guide

## Overview
Vite + React 19 marketing site for SonarCloud (K-12 AI PA / bell system). Source lives in `repo/`. Canonical domain is `https://getsonarcloud.com/`.

**Hosting (2026-08-19):** Vite build is live on Vercel project `sonarcloud-landing` (`prj_8W4ihi5KGgz9Ta8PVLmxPOW4h927`, team `0xmikeyoozes-projects`). Preview: `https://sonarcloud-landing.vercel.app`. GoDaddy DNS cut over **only** the apex A `@` → `76.76.21.21` (www CNAME still follows `@`). Keep GoDaddy nameservers (`ns47`/`ns48.domaincontrol.com`) — do not switch to Vercel NS. Leave alone: `dashboard`/`ftp` A `45.55.129.244`, `music` `107.170.20.4`, `subscriber` `45.55.63.171`, Google/SES/Mailgun MX+SPF+DKIM, Intercom/Mailchimp/Postmark CNAMEs. `ftp` was converted from CNAME-to-apex to its own A so it would not follow Vercel.
- Production ship is a working-tree CLI deploy (`vercel deploy --prod --yes --non-interactive --scope 0xmikeyoozes-projects`), not a git push. `repo/` HEAD is authored as `kimi@local`; deploying from the git checkout gets `readyState: BLOCKED`. Copy the tree without `.git` (keep `.vercel/project.json`) and deploy from that dir. Latest prod: `dpl_GDd4cuchM62U2F9MjGxWpVGbtVTH`, aliased to getsonarcloud.com.

## Architecture
- Entry: `repo/index.html` (SEO, Open Graph, Twitter cards, JSON-LD) + `repo/src/main.tsx`
- Single-page composition in `repo/src/App.tsx` (Navbar, Hero, Features, Mid, Setup, Safety, CTA, Footer)
- Shared URLs in `repo/src/constants.tsx` (`LINKS`)
- Static assets and legal pages in `repo/public/` (copied to `dist/` on build)
- No React Router — extra pages are static HTML in `public/`
- Agent surface (2026-08-21): `src/agent/` + root `middleware.ts` (Edge). Do **not** use Vercel `/api` serverless on this Vite project — those functions 500'd (`FUNCTION_INVOCATION_FAILED`). `/api/v1/health`, `/api/v1/site`, and unknown `/api/*` JSON errors are served from middleware. Published files: `/llms.txt`, `/openapi.json`, `/index.md`. Homepage `#root` contains prerendered H1 + 500+ chars. `Accept: text/markdown` returns Markdown with `Vary: Accept, Accept-Encoding`. Tests: `npm test` (vitest).

## User Defined Namespaces
- [Leave blank - user populates]

## Components
- **Navbar** — hash nav (`#features`, `#setup`, `#safety`, `#contact`) + dashboard + Calendly; logo `h-10` on mobile, `h-16`/`h-20` from md up
- **Hero** — desktop keeps panoramic `hero-bg.png` behind copy; mobile is copy-first then a cropped `<img>` of the same art, stacked CTAs, then the partner marquee
- **FeaturesSection** — `#features`
- **AccessibilitySection** — `#setup` (3 steps; nav label “How It Works”)
- **InstantOverrideSection** — `#safety` on a wrapper so desktop + mobile both resolve
- **Footer / CTASection** — `#contact`, social, About/FAQ (Medium), privacy/terms

## Patterns
- All outbound URLs live in `LINKS` (`constants.tsx`), including `/llms.txt`, `/openapi.json`, `/api/v1/health`, `/api/v1/site`
- Hero Learn more popup (`LINKS.video`) is Principal Ellman’s testimony — last Wistia embed on https://medium.com/@sonarcloud/sonarcloud-testimonials-30997d97f91f (`9fwxjtf6jg`, HD MP4 `394b7d51be11a171b3f62a76404e1cadbe147cad.bin`). Portrait clip; VideoModal uses `object-contain` + `max-h-[80vh]`, not a forced 16:9 box
- Legal pages: `public/privacy.html`, `public/terms.html` (no router)
- Open Graph image: `public/og-image.png` at 1200×630; tags point to `https://getsonarcloud.com/og-image.png`
- LinkedIn company page is the numeric ID `10538090` (not `/company/sonarcloud/`, which is a different product)
- Medium is the blog/FAQ/About surface (`@sonarcloud`)
- Intercom widget `cm08tzn4` is inlined in `index.html` (right-aligned, 16px padding; Safety/Footer have extra mobile bottom padding so the launcher does not cover content)
- Features chat preview uses `useInView({ once: true })` and stays mounted — do not reset `hasStarted` on scroll-out (that emptied the mobile animation window)
- Mobile section padding is tighter than desktop (`pt-16` / `pb-28` on Safety) so steps and cards appear in the first viewport
