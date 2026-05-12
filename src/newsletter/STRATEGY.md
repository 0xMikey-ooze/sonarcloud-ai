# Newsletter Strategy: Kids Audio Council

Applies the `openclaudia-skills/newsletter` framework to the Kids Audio Council Newsletter.

## Concept

- **Niche:** Kids audio, podcasting, and educational AI — for K-5 educators, librarians, and parents of ages 4-10
- **Format:** Hybrid (200-500 word editor's intro + 3-4 curated signals + 1 data block)
- **Frequency:** Weekly, Mondays at 06:00 EDT
- **Value proposition:** A weekly research bulletin that filters this week's signal from kids audio + ed-AI, anchored in named studies and specific numbers, not hype

## Subject-line bench (per skill's formulas)

| Formula | Example for KAC | When to use |
|---------|-----------------|-------------|
| News/Urgency | `Issue 012: Boston goes first` | When a real district/policy story leads |
| Number + Benefit | `5 months of learning, 15 min a day` | Research-led issue (Ignite Reading-style) |
| Curiosity gap | `The AI tutor question, with new evidence` | Mixed/analysis issue |
| List/Roundup | `This week: 4 signals worth keeping` | Slow news weeks |
| Personal/Story | `What a teacher told us about deepfakes` | Reader-reply issues |

**A/B test plan:** rotate between News and Number formulas first; both score "High" per the skill. Skip questions and `FREE`/`URGENT` spam triggers.

## Growth Plan

### Month 1 — Foundation (target: 0 → 250)

- **Lead magnet:** "The 12-question audit for AI tools in K-5 classrooms" — a one-page PDF that pre-fills with the safeguards Yoto, aiEDU, and BPS are converging on. Instantly valuable, ships before signup.
- **Landing page** (single page, no nav):
  - Above the fold: KAC masthead, the council partners strip, one-line value prop, sample issue thumbnail, single email-capture form
  - Social proof slot for "Council partners" (Yoto + ABF Creative + Audible) — already in the template
  - Sample-issue link → current `output/newsletter-template.html`
- **Personal network seed:** 30 direct emails to educators in your network, asking them to subscribe + forward to one other person

### Month 2-3 — Early growth (target: 250 → 1,500)

- **Referral program** (built in or SparkLoop): 1 referral = the K-5 AI audit checklist; 5 = a private Discord with sponsor partners; 10 = a year of Yoto cards
- **Cross-promotion swaps** with: aiEDU's email list, Cult of Pedagogy, Edutopia weekly, Anchor's parent-podcast list, We Are Teachers. Goal: 3 swaps in the quarter
- **Content upgrades**: every issue's spotlight study gets a downloadable "research card" — 1-page PDF summary suitable for staff meetings — gated behind referral
- **Reply prompts**: end every issue with one specific question. Track reply rate weekly

### Month 4-6 — Scale (target: 1,500 → 5,000)

- **Paid acquisition**: $500/mo Meta ads to landing page, audience = US parents 30-45 with school-age kids interested in education / NYT / Common Sense Media. Target $1-3 CPA
- **Podcast guest appearances**: pitch hosts in the same orbit — Truth for Teachers, House of #EdTech, AI in Education. CTA in show notes = newsletter
- **SEO landing pages**: "Best kids audio platforms 2026", "AI in elementary reading: what the research actually says", "How to vet an AI tool for your classroom". Each ends with newsletter capture.

## Content Template (the issue itself)

The current `output/newsletter-template.html` already implements this:

```
PREHEADER (≤90 char, extends subject)
HERO         — issue ribbon, display title (3 lines), 2-sentence subtitle, primary CTA
ATTENTION    — one number in #F55C47 block (the metric you want them to remember)
METRICS      — Signals / Sources / Read time
SECTION 01 SPOTLIGHT  — 1 story, side image, 100-word summary, single data chip
SECTION 02 FIELD NOTES — 3 stories, 96px thumbnails, 50-word summaries
SECTION 03 TRACK      — progress bar against a quarterly research goal
FORWARD CTA  — "Forward this to one educator. One parent."
COUNCIL PARTNERS — Yoto, ABF Creative, Audible wordmarks
FOOTER       — masthead, coords (issue/version), unsubscribe, sigil
```

**Word budgets per cell** (enforce to keep read time ≤ 5 min):
- Hero subtitle: 35 words max
- Spotlight summary: 60 words max
- Field-note summary: 40 words max each
- Editor's intro (when used): 80 words max

## Engagement targets

Per the skill's table, KAC's stretch goals at the K-5/parents niche:

| Metric | Initial target | Stretch | Triage trigger |
|--------|----------------|---------|----------------|
| Open rate | 35% | 50%+ | <30% → subject A/B + clean list |
| Click rate | 5% | 7%+ | <3% → review CTA placement + link relevance |
| Unsubscribe | <0.5% | <0.2% | >1% → reduce frequency or segment |
| Reply rate | 2% | 3%+ | <1% → close every issue with a real question |
| Forward rate | 1% | 3% | (not tracked by default — UTM the "Forward" button) |

## Monetization Roadmap

Per the skill's CPM table for education/parents niche (general consumer = $15-25 CPM):

- **0-1,000:** No paid sponsorship pitches yet. Use Yoto/ABFC/Audible "Council partners" framing as **trade**, not paid — they get logo placement, you get social proof.
- **1,000-3,000:** Open paid sponsor slots at $25 CPM. Two slots per issue, max. First-issue rate $50 to seed case studies.
- **3,000-10,000:** Move to $30-40 CPM, add a single "premium council partner" annual slot at $5K-10K covering the entire calendar quarter
- **10,000+:** Paid tier (`KAC Council Pro`): $8/mo, $80/yr. Extras: full-text PDF archive, monthly research-card deck, quarterly live with a guest researcher

## Deliverability Punch List

Check before scaling sends:

- [ ] SPF + DKIM + DMARC verified on `sonarcloud.getsonarcloud.com` in Resend dashboard
- [ ] Confirm 80/20 text-to-image ratio in current template — count it
- [ ] Replace placeholder `example.com` URLs in current `output/newsletter-template.html` before any further send (they trip spam scoring)
- [ ] Add a real `unsubscribe` URL (currently `href="#"`) — wire to Resend's `{{RESEND_UNSUBSCRIBE_URL}}` token
- [ ] Sunset rule: archive any subscriber with 0 opens in 90 days
- [ ] Warm-up plan: stay under 200 sends/day for the first two weeks, then ramp

## Open issues from current state

1. **Template was rewritten** — current `output/newsletter-template.html` shows Issue 019 "Listen & Learn Weekly" with placeholder `example.com/study` URLs. The polished "Kids Audio Council" version was overwritten. If we send this as-is, the spotlight link goes to a non-existent page.
2. **TinyFish key returns 403** — supplementary sources (Reddit/HN/GitHub) gave noisy threads, not signal. Fix before relying on `npm run newsletter:preview` for content.
3. **Audible/Yoto/ABF wordmarks** are clean text, not real logos. Production swap: host PNGs on your own CDN, max-height 36px.

## Next 5 actions

1. Restore the Kids Audio Council branding + real-URL articles in `output/newsletter-template.html` (or run the polished version as a separate template)
2. Wire a real unsubscribe + `View in browser` link
3. Fix TinyFish key (or rip it out of the aggregator and lean on WebSearch + Reddit + HN only)
4. Build the lead-magnet PDF ("12-question K-5 AI audit") — 1 page, ships before any landing page goes live
5. Set up the referral milestone tree in Resend Audiences or SparkLoop
