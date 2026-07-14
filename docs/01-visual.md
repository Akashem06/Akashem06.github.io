# 01 - Visual

The visual language for the site. Concept: **crimson "dystopia"** — a stark, bold,
*1984*-flavoured frame (refs: `orwell.byholm.co`, `majd-portfolio.framer.website`).
Blood-crimson on ink-black, monumental condensed propaganda type, oversized index
numerals, a hard hairline grid. One screaming accent and a lot of black, so the work —
photography, sketches, projects — is the only other colour on the page.

## Theming model

- **One palette, two themes.** The default warm "paper" light theme, plus a warm
  charcoal **"paper at night"** dark theme. (The site has since moved off the crimson
  dystopia described elsewhere in this doc — see the stale note under "Palette".)
- Implemented with CSS custom properties. The light theme lives in the `:root` token
  block; the dark theme **re-points the same tokens** under `html[data-theme="dark"]`.
  Dark mode overrides only the paint tokens (`--paper`/`--ink`/`--plum`/`--line`) plus
  the handful that hardcode a plum rgba — the legacy mappings (`--bg: var(--paper)` …)
  and `--accent`/`--accent-text` follow automatically, so components re-skin with **no
  markup change**.
- **Never hardcode a hex value anywhere outside those token blocks.** All components
  reference tokens. (Two known theme-independent exceptions: the lightbox stays dark in
  both themes, and the bento caption sits white over its photo scrim.)
- **Switching.** A no-flash inline script in `_layouts/default.html` sets `data-theme`
  on `<html>` *before* the stylesheet loads — from the saved choice in `localStorage`,
  else the OS `prefers-color-scheme`. The nav toggle (`theme.js`) flips and persists it,
  and keeps the `theme-color` meta in sync. Because the no-flash script always sets an
  explicit `data-theme`, the dark CSS needs only the `[data-theme="dark"]` selector (no
  `prefers-color-scheme` duplication); no-JS visitors get the light theme.
- **Blooms invert their blend.** The hero/project-header watercolor blooms paint with
  `mix-blend-mode: multiply` on paper; under `[data-theme="dark"]` they switch to
  `screen` so the washes glow on the charcoal instead of sinking into it.
- **One accent.** A single accent family — **plum in light, warm gold in dark** (the
  same `--plum` token, re-pointed) — for links, active tab, primary button, focus, and
  numerals, plus one supporting "pop" for badges/tags, and the watercolor washes for
  blooms only. Don't introduce a second UI hue per theme.

## Palette — "blood on ink-black"

> **Stale (pending rewrite).** The site shipped a watercolor pivot: warm paper +
> graphite + a plum accent (light) and a warm-charcoal "paper at night" with a warm
> gold accent (dark). The
> live token values are in `assets/css/main.css` (`:root` for light, the
> `html[data-theme="dark"]` block for dark). The crimson table below documents the
> retired theme and is kept only until this doc's full watercolor rewrite lands.

Crimson `#E5121F` on near-black `#0B0B0C`. The single token block:

| Token | Value | Use |
|---|---|---|
| `--bg` | `#0B0B0C` | Page background (ink-black) |
| `--bg-elev` | `#141416` | Cards, raised surfaces, nav (faintly raised) |
| `--border` | `#2A2A2D` | Hairlines, dividers, grid rules |
| `--text` | `#ECECEC` | Body text (~17:1 on ink) |
| `--text-dim` | `#8A8A8A` | Secondary text, dates, captions (~5.7:1) |
| `--accent` | `#E5121F` | Brand crimson — **large type / numerals / focus ring / active tab / graphic / UI** only (~4.2:1, clears the ≥3:1 large-text & UI bar) |
| `--accent-hover` | `#C20E18` | Deeper crimson — **primary button fill** under a white label |
| `--accent-text` | `#F4313D` | AA-safe crimson for **small interactive text / links** on ink (~5.0:1) |
| `--on-accent` | `#FFFFFF` | Label colour on crimson fills (white on `--accent-hover` ~5.8:1) |
| `--pop-bg` | `rgba(229,18,31,0.14)` | Badge/tag background (crimson, translucent) |
| `--pop-text` | `#F4313D` | Badge/tag text (on `--pop-bg`, ~4.6:1) |

**The AA rule that keeps crimson legal:** brand crimson `#E5121F` is only ~4.2:1 on ink,
so it's for **large/graphic/UI** use (≥3:1). Anything small and crimson — body links,
nav text, tags — uses `--accent-text` (`#F4313D`, ~5.0:1). The primary button fills with
the deeper `--accent-hover` and a white (`--on-accent`) label (~5.8:1).

## Galleries & the lightbox

Photography and sketches already read best against dark, and the whole site is now dark,
so there's no special case:
- Gallery **grids** use the site palette like everything else.
- The **lightbox stays dark** (near-black backdrop, full image) — no longer an
  "exception", just consistent with the site.

## Accent gradient, numerals & "pop"

The polish comes from **space, monumental type, and one screaming red** — no second hue.

- **`--grad`** = `linear-gradient(120deg, var(--accent), var(--accent-hover))`. Both
  stops are crimson tokens, so it stays one red family — not a rainbow. Used on the
  **hero headline** (clipped to the text via `background-clip: text`, behind an
  `@supports` guard with a solid `--accent` fallback) and as the conceptual primary fill.
- **Index numerals:** section headings auto-number (`01 —`, `02 —` …) via a CSS counter
  (`main { counter-reset: section }` / `.section { counter-increment }` /
  `.section-head h2::before`), drawn in `--accent`. No markup needed.
- **Eyebrow / kicker:** an uppercase Anton label above page titles (`.eyebrow`),
  letter-spaced, with a **stamped crimson bar** (`::before`) — the one consistent
  "label" flourish.
- **Redaction bar** (`.redact`): a sparing, purely-decorative crimson block. Standalone
  (never obscures real text), inert to assistive tech. Use once or twice, not everywhere.
- **Buttons:** primary `.btn` = solid `--accent-hover` fill + white label, sharp corners,
  brightening to `--accent` on hover; `.btn--ghost` = `--accent` outline that fills on
  hover. **Tags:** `--pop-bg` / `--pop-text`, sharp corners, uppercase.

## Red bands (section treatments)

The site is **ink-black by default; crimson is the accent, not the canvas.** Full
red-background sections (`.band--red`) are reserved for the **home page and a few chosen
sections** — never the whole site, so the red punches instead of exhausting. Guiding
rule: each red block may look **distinct, but they all conform** to one DNA — *crimson
invert · white line-grid · index numeral*.

- A red band is a `.section` that is **not** wrapped in `.container` (so it spans the full
  `main` width); its content sits in a `.container` *inside*. `overflow: hidden` clips the
  bleed-off numeral so there's no horizontal scroll on phones.
- **`.band--red`:** `--accent` background, black (`--bg`) heading + index numeral + rule,
  white (`--on-accent`) body; a white line-grid (`--grid-on-red`) via `::before`.
- **`.band--num`** (opt-in): adds a giant outlined ghost numeral bleeding off the right
  edge (`::after`, outline `--ghost-stroke`), reusing the section counter — no extra markup.
- AA: black heading is large-text (≥3:1) on red; white body is 4.7:1 on `--accent`. Keep
  body text white and headings black inside red bands.
- **As a page header — one texture per tab (unique but conforming).** Every inner tab
  opens with a **title-only** red `.band--red.page-band` (no eyebrow/subtitle; the
  `.page-lede` intro moves *below* the band into the ink content). Each tab swaps the
  default white grid for its own black-ink motif:
  - **Projects** `.band--hazard` — diagonal caution stripes + checker edges
  - **Experience** `.band--redact` — redacted-document bars down the right
  - **Photography** `.band--film` — black film strips + crimson sprocket holes
  - **Blog** `.band--ledger` — ruled notebook lines + a margin rule
  - **Art** `.band--hatch` — diagonal cross-hatch (sketch texture)
  - **Resources** `.band--index` — sparse vertical hairlines (clean filing feel)

  Motif modifiers override `.band--red::before` (and may add `::after`); ink overlays come
  from the `--band-*` tokens. No ghost numeral on headers (not a counted section). The home
  page's "Selected projects" band keeps the original grid + ghost numeral (`.band--num`).

## Frosted navigation

The sticky header is a frosted-glass bar: a translucent `--bg-elev`
(`color-mix(... transparent)`) with `backdrop-filter: blur()`, wrapped in `@supports`
so unsupported engines fall back to the solid `--bg-elev`, with a hard `--border`
bottom hairline. A subtle shadow fades in once scrolled (`.site-header.is-scrolled`,
toggled in `theme.js`). The brand + nav links are uppercase.

## Background ambience

Pinned behind all content (fixed, `z-index: -1`, `pointer-events: none`, `aria-hidden`),
so it never touches layout, interaction, or screen readers. Markup lives once in
`_layouts/default.html`; all colour comes from tokens.

- **Film grain** (`.grain`): an inline-SVG fractal-noise texture tiled over the canvas at
  very low opacity (`--grain-opacity`) for paper-tooth tactile depth. Static.
- **Hard grid** (`.grid`): retired with the dystopia pivot — `--grid-line` is now
  `transparent`, so the layer renders nothing. The markup is kept as an inert hook in
  case a future direction wants a faint grid back.

All layers are static, so there is nothing to gate for reduced motion.

## Typography

The dystopian look needs real type, so we keep the **deliberate, bounded exception** to
"system fonts only": two self-hosted families, **latin-subset woff2** (~53KB total, in
`assets/fonts/`), `font-display: swap`, and `<link rel=preload>` on both. No third-party
round-trip (self-hosted, not the Google CDN). If you add a weight/glyph range, re-subset
and keep it lean.

- **Display:** `--font-display` = **Anton** (`"Anton", "Arial Narrow", "Impact",
  system-ui, sans-serif`) — ultra-condensed heavy propaganda caps (ships one weight,
  `font-weight: 400`). Used on **h1/h2**, `.eyebrow`, `.nav__brand`, all
  **forced uppercase** and set tight. (Dock section labels use `--font-mono`, not this.) **h3 stays the body grotesque (heavy)** so small
  subheads read as labels, not posters.
- **Body:** `--font-body` = **Archivo** (`"Archivo", system-ui, …, sans-serif`) — clean
  grotesque, variable 400–700, for all running text (`body`).
- **Mono:** `--font-mono` = `ui-monospace, "SF Mono", "Cascadia Code", Menlo, monospace`
  for code/firmware snippets — stays system.
- **Scale (rem):** h1 2.5 · h2 1.75 · h3 1.25 · body 1.0625 · small 0.9375; the **hero
  h1** blows up to `clamp(3rem, 11vw, 6.5rem)`. Line-height 1.6 body, ~1.1 headings.
- **Measure:** cap article text at ~70ch. Galleries are full-width.
- Uppercase for display/labels/nav; sentence case for body. Type colour comes from
  `--text` / `--text-dim` / `--accent-text` — never hardcoded.

## Spacing & layout (both themes)

- 8px base unit; tokens `--space-1..12` (8/16/24/32/48/64/80/112).
- **Section rhythm scales with the viewport:** `main` padding and `.section` gaps
  use `clamp()` so desktop breathes (up to `--space-12`) while mobile stays tight.
  Pages should feel airy, never cramped.
- **Page-header pattern** (every top-level page): an `.eyebrow` + `<h1>` + optional
  `.page-lede` intro, wrapped in `.page-header` with a generous bottom margin so the
  intro is clearly separated from the content below (don't jam a summary against a
  grid). The gallery layout renders its intro as the `.page-lede`.
- Max content width 720px for articles/pages; galleries full viewport with a small gutter.
- Generous whitespace around images.

## Imagery rules (both themes)

- Every image needs **alt text** (accessibility + SEO).
- Provide responsive sizes; lazy-load below the fold. Never ship a 4000px JPEG to a phone.
- Photography/sketches: preserve aspect ratio, no forced cropping in the masonry grid; lightbox shows the full image.
- **Preview tiles** (the home "From the gallery" cards) are a fixed **3:2** crop
  (`object-fit: cover`) so the row reads as even tiles regardless of the source photo's
  ratio — `.card--photo .card__media`. Only the preview is cropped; the gallery masonry
  and lightbox still show the whole frame.
- Project screenshots: consistent ratio within a section (16:9 or 4:3). On a project
  page they show as a **4:3** thumbnail strip (`.project-gallery .thumb`) that opens the
  full frame in the lightbox; in the projects **list** the cover shows as a **3:2** tile in
  the left column of the timeline-style row (`.project-row__media`, `object-fit: cover`).
- The home "From the gallery" carousel reuses the **3:2** `.card--photo` tile per slide
  (`.carousel__slide`), each a fixed-width snap target (`clamp(240px, 70%, 340px)`).
- **Experience logos** sit in a small fixed square chip (`.timeline__logo`, `object-fit:
  contain` on a `--bg-elev` background) so mismatched logo shapes still line up cleanly.
- Prefer `.webp` with `.jpg` fallback where the build allows.

## Motion

- Subtle and fast: 150–200ms ease-out on hover/focus and lightbox open/close.
- **Scroll-reveal:** sections/cards fade + rise once as they enter view
  (`[data-reveal]` → `.is-visible`, via `reveal.js` + `IntersectionObserver`).
  Reveal-once only — never re-hide on scroll-up. This is enter animation, **not**
  parallax/scroll-jacking (the page never hijacks scrolling).
- Card/button hover: a small lift + soft shadow (`--shadow-soft`).
- No parallax, autoplay, or scroll-jacking. The home gallery **carousel** is manual
  scroll-snap (swipe + arrows); under `prefers-reduced-motion` its arrow scrolling drops to a
  non-smooth jump (`behavior: 'auto'`).
- Respect `prefers-reduced-motion`: disable non-essential transitions (hover lift)
  **and** the scroll-reveal. Reveal is gated so reduced-motion and
  no-JS visitors get fully visible content immediately (never trapped hidden) — see
  the `html.reveal` gate in `_layouts/default.html`.

## Contrast guarantee

Every text/background pairing in the token set must pass **WCAG AA**. Baked-in rules:
brand `--accent` (~4.2:1) is **large/graphic/UI only** (≥3:1) — small crimson text uses
`--accent-text` (~5.0:1); the primary button uses a white `--on-accent` label on
`--accent-hover` (~5.8:1); `--pop-text` is only ever placed on `--pop-bg` (~4.6:1);
`--text-dim` (~5.7:1) is for non-essential text only. If you add a token, verify contrast
before committing.