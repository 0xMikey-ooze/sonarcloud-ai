# Design System Inspired by Pedagogy Sys

## 1. Visual Theme & Atmosphere

Pedagogy Sys embodies a data-driven, academic aesthetic with a warm, approachable tone. The design bridges cutting-edge educational technology with human-centered pedagogical research through a minimalist yet data-rich visual language. Warm neutrals form the foundation—a comfortable beige backdrop—while strategic pops of vivid color (electric blue, vibrant orange, magenta accents) punctuate dashboards and highlight critical engagement metrics. The system favors clarity and precision: monospace typography for system logs and measurements, clean geometric shapes (diamonds, hexagons, progress bars), and translucent layers that suggest depth without visual clutter. Every element serves an informational purpose; nothing is merely decorative. This creates a professional yet inviting ecosystem where educational data, behavioral metrics, and learning outcomes feel tangible and actionable.

**Key Characteristics:**
- Warm, natural color foundation with strategic neon accents
- Data-dense layouts balanced with generous whitespace
- Monospace and sans-serif typography emphasizing clarity and precision
- Geometric, mathematical visual language (diamonds, hexagons, progress indicators)
- Translucent overlays and layered surfaces for depth
- High contrast between neutral backgrounds and vivid CTAs
- Educational and analytical tone without sterility

## 2. Color Palette & Roles

### Primary
- **Electric Blue** (`#3A86FF`): Primary interactive elements, hyperlinks, focus states, and active indicators in data visualizations
- **Bright Blue** (`#3291FF`): Secondary primary accent for alternate CTAs and complementary actionable elements
- **Sky Blue** (`#2688F9`): Tertiary blue for hover states and tertiary buttons

### Accent Colors
- **Vibrant Orange** (`#F55C47`): Critical alerts, attention-demanding elements, high-priority notifications (e.g., "ATTENTION SPAN" warnings)
- **Magenta** (`#FF1B9D`): Accent highlights, secondary visual emphasis in illustrations and data points

### Interactive
- **Bright Green** (`#00D084`): Success states, positive confirmations, "SYSTEM OPTIMAL" status badges
- **Warning Orange** (`#FF6B35`): Warnings and cautionary states

### Neutral Scale
- **Pure White** (`#FFFFFF`): Primary surface color, card backgrounds, text backgrounds
- **Warm Beige** (`#F0EDE5`): Secondary surface, subtle container backgrounds, light section dividers
- **Near Black** (`#222222`): Primary text color, headings, dense information labels
- **Charcoal** (`#363636`): Secondary text, metadata, system log text
- **Black** (`#000000`): Maximum contrast elements, measurement indicators, progress fill
- **Light Gray** (`#DADADA`): Disabled states, tertiary borders, placeholder text
- **Medium Gray** (`#CCCCCC`): Light borders, divider lines, inactive progress segments

### Surface & Borders
- **Off-White Surface** (`#F0EDE5`): Container backgrounds, card fills, subtle section separators
- **Light Border** (`#CCCCCC`): Non-critical dividers, inactive UI elements
- **Medium Border** (`#DADADA`): Secondary borders, progress bar tracks

## 3. Typography Rules

### Font Family
- **Primary:** Arial, Helvetica, sans-serif (for all interface text, headings, body)
- **Secondary:** Monospace fallback for data display and system logs (e.g., "Courier New, monospace" or "IBM Plex Mono")

### Hierarchy

| Role | Font | Size | Weight | Line Height | Letter Spacing | Notes |
|------|------|------|--------|-------------|----------------|-------|
| Display/Title | Arial | 32px | 700 | 1.2 | 0px | Main page headings ("PEDAGOGY SYS", "CLASSROOM VECTORS") |
| Heading XL | Arial | 24px | 700 | 1.3 | 0px | Section headers, card titles |
| Heading L | Arial | 20px | 600 | 1.3 | 0px | Subsection headers, prominent labels |
| Heading M | Arial | 16px | 600 | 1.4 | 0px | Component headers, item titles |
| Body Large | Arial | 14px | 400 | 1.5 | 0px | Primary body text, descriptions |
| Body Regular | Arial | 13px | 400 | 1.5 | 0px | Standard body copy, labels, paragraphs |
| Button | Arial | 13px | 600 | 1.2 | 0.5px | All button text, caps often used |
| Caption | Arial | 11px | 400 | 1.4 | 0px | Footnotes, metadata, system logs |
| Monospace Data | Courier New | 12px | 400 | 1.6 | 0px | System logs, metrics, code-like data ("SYS_LOG: 884") |

### Principles
- **Hierarchy through weight and scale:** Bold weights (600–700) drive attention; regular (400) provides supporting context
- **Contrast-first:** High contrast between text and surface ensures legibility in data-heavy layouts
- **Monospace for data:** System metrics, logs, and numerical data use monospace to evoke precision and computational origin
- **Generous line-height:** Educational content benefits from breathing room; 1.4–1.6 line-height aids comprehension
- **All-caps for emphasis:** System labels and accent text use uppercase sparingly to signal importance ("SYSTEM OPTIMAL", "ATTENTION SPAN")

## 4. Component Stylings

### Buttons

**Primary Button**
- Background: `#3A86FF`
- Text Color: `#FFFFFF`
- Font Size: `13px`
- Font Weight: `600`
- Padding: `12px 24px`
- Border Radius: `4px`
- Border: `1px solid #3A86FF`
- Box Shadow: `0 2px 8px rgba(58, 134, 255, 0.2)`
- Line Height: `1.2`
- Letter Spacing: `0.5px`
- Hover State: Background `#2B7AE8`, box shadow `0 4px 12px rgba(58, 134, 255, 0.35)`
- Active State: Background `#1F5AC9`, box shadow `inset 0 2px 4px rgba(0, 0, 0, 0.2)`

**Secondary Button**
- Background: `#F0EDE5`
- Text Color: `#222222`
- Font Size: `13px`
- Font Weight: `600`
- Padding: `12px 24px`
- Border Radius: `4px`
- Border: `1px solid #CCCCCC`
- Box Shadow: `0 2px 4px rgba(0, 0, 0, 0.05)`
- Line Height: `1.2`
- Hover State: Background `#E8E3D9`, border `#DADADA`
- Active State: Background `#DDD9CF`, box shadow `inset 0 2px 4px rgba(0, 0, 0, 0.1)`

**Ghost Button**
- Background: `rgba(240, 237, 229, 0)`
- Text Color: `#3A86FF`
- Font Size: `13px`
- Font Weight: `600`
- Padding: `12px 24px`
- Border Radius: `4px`
- Border: `1px solid rgba(58, 134, 255, 0.5)`
- Box Shadow: `none`
- Line Height: `1.2`
- Hover State: Background `rgba(58, 134, 255, 0.08)`, border `rgba(58, 134, 255, 1)`
- Active State: Background `rgba(58, 134, 255, 0.15)`, border `#3A86FF`

**Danger/Attention Button**
- Background: `#F55C47`
- Text Color: `#FFFFFF`
- Font Size: `13px`
- Font Weight: `600`
- Padding: `12px 24px`
- Border Radius: `4px`
- Border: `1px solid #F55C47`
- Box Shadow: `0 2px 8px rgba(245, 92, 71, 0.25)`
- Hover State: Background `#E64A32`, box shadow `0 4px 12px rgba(245, 92, 71, 0.4)`

**Status/Success Badge Button**
- Background: `#00D084`
- Text Color: `#FFFFFF`
- Font Size: `11px`
- Font Weight: `700`
- Padding: `6px 12px`
- Border Radius: `999px`
- Border: `none`
- Box Shadow: `0 2px 4px rgba(0, 208, 132, 0.2)`
- Letter Spacing: `1px`
- Uppercase

### Cards & Containers

**Data Card (Light)**
- Background: `#FFFFFF`
- Border: `1px solid #CCCCCC`
- Border Radius: `8px`
- Padding: `24px`
- Box Shadow: `0 2px 8px rgba(0, 0, 0, 0.06)`
- Text Color: `#222222`

**Data Card (Warm Beige)**
- Background: `#F0EDE5`
- Border: `1px solid #DADADA`
- Border Radius: `8px`
- Padding: `24px`
- Box Shadow: `0 1px 4px rgba(0, 0, 0, 0.04)`
- Text Color: `#222222`

**Highlight Container (Alert/Attention)**
- Background: `#F55C47`
- Border Radius: `12px`
- Padding: `20px 24px`
- Text Color: `#FFFFFF`
- Font Weight: `700`
- Font Size: `18px`
- Box Shadow: `0 4px 12px rgba(245, 92, 71, 0.3)`

**Progress Container**
- Background: `#FFFFFF`
- Border: `1px solid #CCCCCC`
- Border Radius: `4px`
- Height: `8px`
- Padding: `0px`
- Overflow: `hidden`

**Progress Fill**
- Background: `#000000`
- Height: `100%`
- Border Radius: `4px`
- Transition: `width 0.3s ease`

### Inputs & Forms

**Text Input (Enabled)**
- Background: `#FFFFFF`
- Border: `1px solid #CCCCCC`
- Border Radius: `4px`
- Padding: `12px 16px`
- Font Size: `13px`
- Font Family: `Arial`
- Text Color: `#222222`
- Line Height: `1.5`
- Box Shadow: `0 1px 2px rgba(0, 0, 0, 0.04)`
- Focus State: Border `#3A86FF`, box shadow `0 0 0 3px rgba(58, 134, 255, 0.15)`

**Text Input (Disabled)**
- Background: `#F0EDE5`
- Border: `1px solid #DADADA`
- Text Color: `#DADADA`
- Cursor: `not-allowed`
- Opacity: `0.6`

**Input Label**
- Font Size: `12px`
- Font Weight: `600`
- Text Color: `#222222`
- Margin Bottom: `8px`
- Display: `block`

**Input Helper Text**
- Font Size: `11px`
- Text Color: `#363636`
- Margin Top: `4px`

### Navigation

**Navbar/Header**
- Background: `#FFFFFF`
- Border Bottom: `1px solid #CCCCCC`
- Padding: `16px 24px`
- Display: `flex`
- Align Items: `center`
- Justify Content: `space-between`
- Height: `64px`

**Nav Item (Active)**
- Text Color: `#3A86FF`
- Font Weight: `600`
- Font Size: `13px`
- Padding: `8px 16px`
- Border Bottom: `2px solid #3A86FF`

**Nav Item (Inactive)**
- Text Color: `#363636`
- Font Weight: `400`
- Font Size: `13px`
- Padding: `8px 16px`
- Border Bottom: `2px solid transparent`
- Hover State: Text Color `#222222`

**Breadcrumb**
- Font Size: `11px`
- Text Color: `#363636`
- Separator: ` / `
- Current Item Font Weight: `600`
- Link Color: `#3A86FF`

### Choice Indicators (Multiple Choice)

**Choice Hexagon (Inactive)**
- Border: `2px solid #CCCCCC`
- Width: `56px`
- Height: `56px`
- Display: `flex`
- Align Items: `center`
- Justify Content: `center`
- Background: `transparent`
- Font Size: `16px`
- Font Weight: `600`
- Text Color: `#363636`
- Border Radius: `8px`
- Transition: `all 0.2s ease`

**Choice Hexagon (Active)**
- Border: `2px solid #3A86FF`
- Background: `rgba(58, 134, 255, 0.08)`
- Text Color: `#3A86FF`
- Font Weight: `700`

**Choice Hexagon (Hover)**
- Border: `2px solid #3A86FF`
- Cursor: `pointer`

## 5. Layout Principles

### Spacing System

**Base Unit:** `8px`

**Scale:**
- **Micro:** `4px` (internal component gutters, tight grouping)
- **XS:** `8px` (small gaps between adjacent elements)
- **S:** `12px` (padding in small containers, button padding vertical)
- **M:** `16px` (standard padding, medium gaps)
- **L:** `24px` (card padding, section padding)
- **XL:** `32px` (major section spacing)
- **XXL:** `48px` (page-level spacing between major sections)
- **XXXL:** `64px` (hero spacing, top-level container margins)

**Context Usage:**
- Card padding: `24px` (L)
- Button padding: `12px 24px` (S horizontal, L vertical scale)
- Section gap: `32px` (XL)
- Margin between cards: `16px` (M)
- Form field gap: `12px` (S)

### Grid & Container

**Max Width:** `1440px` for main content container

**Column Strategy:**
- Desktop (1440px): 12-column flexible grid
- Tablet (768px): 8-column grid
- Mobile (360px): 4-column single-column stack

**Container Padding:**
- Desktop: `48px` left/right
- Tablet: `32px` left/right
- Mobile: `16px` left/right

**Section Patterns:**
- Header + navigation: Fixed `64px` height
- Hero section: Full viewport width, min-height `400px`
- Data cards: 2–3 column grid on desktop, stacked on mobile
- Footer: Full width, `64px` height, dark background option

### Whitespace Philosophy

Generous whitespace is fundamental to Pedagogy Sys. Data-heavy layouts require breathing room to prevent cognitive overload. Cards maintain `24px` internal padding; sections are separated by at least `32px` gaps. The warm beige background (`#F0EDE5`) subtly differentiates container layers without harsh contrast. Whitespace is never wasted—it organizes information hierarchy and guides the eye through learning narratives. On mobile, spacing tightens proportionally but never eliminates breathing room around primary CTAs.

### Border Radius Scale

- **Sharp:** `0px` for grid-aligned components (tables, data cells)
- **Subtle:** `4px` for buttons, inputs, small containers
- **Rounded:** `8px` for cards, modal windows, medium containers
- **Soft:** `12px` for hero sections, large containers, image corners
- **Pill/Full:** `999px` for status badges, fully rounded buttons, avatar containers

## 6. Depth & Elevation

| Level | Treatment | Use |
|-------|-----------|-----|
| Surface (L0) | No shadow, solid background | Base surfaces, cards on main layer |
| Raised (L1) | `0 1px 2px rgba(0, 0, 0, 0.04)` | Input fields, disabled states, subtle lift |
| Elevated (L2) | `0 2px 4px rgba(0, 0, 0, 0.05)` | Secondary buttons, light interactive elements |
| Prominent (L3) | `0 2px 8px rgba(0, 0, 0, 0.06)` | Primary cards, default card state |
| High (L4) | `0 4px 12px rgba(0, 0, 0, 0.12)` | Hover buttons, modals, popovers |
| Maximum (L5) | `0 8px 24px rgba(0, 0, 0, 0.16)` | Dropdown menus, floating panels, overlays |

**Shadow Philosophy:**
Pedagogy Sys employs subtle, soft shadows that suggest layering without visual drama. Shadows increase progressively with interactive intent: buttons on hover lift slightly; cards gain definition at L3; critical overlays float at L5. The warm neutral palette absorbs shadows gracefully, preventing harsh contrasts. All shadows use black with low opacity (`0.04–0.16`), maintaining the system's approachable, non-aggressive tone. Translucent overlays (`rgba(0, 0, 0, 0.1–0.3)`) on modals and dropdowns create depth while preserving background visibility.

## 7. Do's and Don'ts

### Do

- **Pair warm neutrals with vivid accents:** Use `#F0EDE5` and `#FFFFFF` as surfaces; deploy `#3A86FF` and `#F55C47` sparingly for maximum impact
- **Maintain generous whitespace:** Ensure at least `24px` padding inside containers; space sections by `32px` minimum
- **Use monospace for data:** Display metrics, logs, and system information in monospace to signal precision
- **Prioritize accessibility:** All interactive elements must meet minimum `44px × 44px` touch target on mobile; use color + iconography for status indication
- **Follow the typography hierarchy:** Display roles for headings, Body Regular for paragraphs, Caption for metadata
- **Leverage translucent layers:** Use `rgba()` values for overlays and borders to create subtle depth without increasing visual weight
- **Apply button states consistently:** Hover, active, and disabled states must be visually distinct across all button types
- **Use all-caps sparingly:** Reserve uppercase for status badges, system labels, and critical warnings to maintain hierarchy

### Don't

- **Avoid high-saturation colors on warm backgrounds:** The beige backdrop can muddy overly saturated colors; test contrast carefully
- **Don't remove focus states:** Every interactive element must have a clear focus ring (`outline: 2px solid #3A86FF` minimum)
- **Avoid fonts smaller than 11px:** Body text should never drop below 12px; captions at 11px are minimum
- **Don't use pure black (`#000000`) for body text:** Use `#222222` (Near Black) for primary text to reduce eye strain
- **Avoid nesting shadows:** A single shadow per element maintains clarity; layered shadows create visual confusion
- **Don't ignore line-height:** Always apply 1.4–1.5 line-height to body text; 1.2 is reserved for headings and buttons
- **Avoid container widths over 1440px:** Longer lines reduce comprehension; constrain primary content to max-width `1440px`
- **Don't override border-radius for components:** Maintain consistency across buttons (`4px`), cards (`8px`), and badges (`999px`)

## 8. Responsive Behavior

### Breakpoints

| Name | Width | Key Changes |
|------|-------|-------------|
| Mobile | 360px–599px | Single-column layouts, 16px padding, 4-column grid, font -1 size tier |
| Tablet | 600px–1023px | 2-column cards, 8-column grid, 32px padding, maintained typography |
| Desktop | 1024px–1439px | 2–3 column grid, 48px padding, full hierarchy |
| Wide | 1440px+ | Max-width container at 1440px, centered layout, full spacing system |

### Touch Targets

- **Minimum interactive element size:** `44px × 44px` (buttons, links, choice indicators)
- **Comfortable target:** `48px × 48px` for primary actions on mobile
- **Spacing between targets:** Minimum `8px` gap to prevent accidental activation
- **Focus ring thickness:** `2px` for keyboard navigation, with `4px` padding from edge
- **Tap feedback:** Visual feedback (color shift, shadow change) within `100ms` of interaction

### Collapsing Strategy

**Navigation:**
- Desktop: Horizontal nav bar, full-width item labels
- Tablet: Horizontal nav bar, condensed labels
- Mobile: Hamburger menu, drawer navigation, full-screen on open

**Card Layouts:**
- Desktop (1440px): 3-column grid
- Tablet (768px): 2-column grid
- Mobile (360px): Single-column stack with `16px` margin

**Spacing Reduction:**
- Desktop: `24px` card padding → Tablet: `20px` → Mobile: `16px`
- Section gaps: `32px` (desktop) → `24px` (tablet) → `16px` (mobile)

**Font Scaling:**
- Body text remains `13px` across breakpoints for consistency
- Display headings: `32px` (desktop) → `24px` (tablet) → `20px` (mobile)
- Never compress below base sizes defined in Typography Hierarchy

**Images & Illustrations:**
- Desktop: Full-size with aspect ratio maintained
- Tablet: 80–90% width, maintain aspect ratio
- Mobile: 100% viewport width minus padding, constrained height

## 9. Agent Prompt Guide

### Quick Color Reference

- **Primary CTA:** Electric Blue (`#3A86FF`)
- **Secondary CTA:** Sky Blue (`#2688F9`)
- **Attention/Alert:** Vibrant Orange (`#F55C47`)
- **Success/Optimal:** Bright Green (`#00D084`)
- **Primary Background:** Pure White (`#FFFFFF`)
- **Secondary Background:** Warm Beige (`#F0EDE5`)
- **Primary Text:** Near Black (`#222222`)
- **Secondary Text:** Charcoal (`#363636`)
- **Heading/Display:** Near Black (`#222222`)
- **Borders:** Light Gray (`#CCCCCC`) or Medium Gray (`#DADADA`)
- **Disabled State:** Light Gray (`#DADADA`) or placeholder styling

### Iteration Guide

1. **All typography must use Arial or system sans-serif fallback; monospace (Courier New) only for data/logs.** No serif fonts. Sizes must match the Typography Hierarchy table exactly (13px base, 32px display max, 11px captions min).

2. **Button padding is always `12px 24px` (vertical × horizontal); border-radius is `4px` standard, `999px` for badges only.** Primary buttons use `#3A86FF`, secondary use `#F0EDE5`, danger use `#F55C47`. Hover states must shift background by 1 tone and increase shadow from L2→L4.

3. **Card backgrounds are `#FFFFFF` or `#F0EDE5` with `1px` border in `#CCCCCC` or `#DADADA`, padding `24px`, and shadow `0 2px 8px rgba(0, 0, 0, 0.06)` max.** Cards stack single-column on mobile (360px), 2-column on tablet (768px), 2–3 column on desktop (1440px).

4. **Spacing is base-8 system: 4px, 8px, 12px, 16px, 24px, 32px, 48px, 64px.** Use `24px` for card padding and major gaps; `16px` for standard margins; `8px` for form field gaps; reduce by 25% on mobile.

5. **All interactive elements (buttons, links, inputs) must have visible focus state:** `outline: 2px solid #3A86FF` or `box-shadow: 0 0 0 3px rgba(58, 134, 255, 0.15)`.** Never remove native focus indicators.

6. **Progress bars use `#000000` fill on `#FFFFFF` or `#F0EDE5` background;** indicators/badges use `#00D084` for success and `#F55C47` for warnings. All status colors must be accompanied by text label (not color-only).

7. **Line-height is 1.2 for headings/buttons, 1.4–1.6 for body text.** Letter-spacing is default (0px) except buttons (`0.5px`) and status badges (`1px` for uppercase).

8. **Max container width is 1440px; apply 48px padding on desktop, 32px on tablet, 16px on mobile.** Never exceed this width; center containers with margin auto on wide screens.
