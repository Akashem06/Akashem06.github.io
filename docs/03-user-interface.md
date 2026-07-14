# 03 - User Interface

Visitor-facing UI/UX: how someone browsing the site navigates, views galleries, and reads. This is the *consumer* side. Aryan's *authoring* side is in `docs/04-authoring.md`.

## Navigation

Section navigation lives in the **top bar** as **wash tabs** (`.nav__tabs` in
`_includes/header.html`): brand left, the seven section links next, theme toggle far
right. Sticky, **frosted glass** (translucent `--bg-elev` + `backdrop-filter`, solid
fallback via `@supports`), hairline `--border` bottom, subtle shadow once scrolled.

- **Wash tabs.** Each `.nav__tab` carries its own inline `--wash` (lilac/lav/sky/sage/
  peach/rose/gold). On hover / `:focus-visible` / active, a wash-tinted dab blooms behind
  the label via a `::before` running `filter: url(#wash-bloom)` (a gentle sibling of the
  hero `#bleed`, defined in `_layouts/default.html`) — a *painted* bleed, not a glow. On
  charcoal the dab opacity eases back so the off-white label stays legible. Order is fixed
  (`docs/02-tabs.md`).
- **Mobile (≤640px):** no hamburger. Brand + theme toggle stay on row one; the tabs drop
  to a **horizontally scrollable** second row (hidden scrollbar). `theme.js` nudges the
  active tab into view on load.
- **Theme toggle** (sun/moon `.theme-toggle`) sits in the bar on every viewport. Flips
  light ↔ dark, remembers the choice, defaults to OS. (Theming: `docs/01-visual.md`.)
- Keyboard: real `<nav aria-label="Primary">` of `<a>` links, `aria-current="page"` on the
  active tab, a visible `--accent` focus ring on `:focus-visible`.


## Page header (every top-level page)

- Every top-level page opens with the **bloom masthead** (`_includes/masthead.html`):
  a small, static multi-colour watercolor **bloom** (`.mblob`, wet `url(#bleed)` edges,
  breathing slowly) sitting behind a big display `<h1>`, over a mono **eyebrow** (usually a
  live count — "3 writings", "8 builds"), a thin rule, and an optional one-line **lede**.
  It's the same watercolor language as the home page. Params: `title`, `eyebrow`, `lede`,
  `wide` (galleries use the wide container). **This replaced the old crimson `band--red`
  banners**, which are fully removed (CSS + markup). Nav tabs are **right-aligned on every
  page** for a consistent header.
- **Section-title bloom** (`_includes/bloom-head.html`, `.bloom-head`): standalone
  in-page section headings (project **Highlights** / **Challenges**, post **Related**)
  are wrapped so a small three-wash watercolor bloom **seeps in behind the title as it
  scrolls into view** — the masthead's language scaled down for content headings. It
  rides the site reveal system (`data-reveal` + `.is-visible`), so the wash only hides-
  then-fades when reveal.js is active; no-JS and reduced-motion visitors see the heading
  with the wash already shown (it never gates content). This is for *section* titles only,
  not per-item list/card titles (blog/project rows, experience roles, resource cards),
  which stay clean to avoid clutter.

## Home = the landing / about

There is **no separate About page** — the home page *is* the about/landing. It is
**"the collage"** (`index.html`, all styles inline + scoped under `.stage`): a centered
identity block — mono kicker, the monumental `<h1>` name, one punchy lede on the
engineer-who-draws duality — floating over a **full-viewport wall of the actual work**
(a balanced mix of **all sketches + all project shots [covers + galleries] + a recent slice
of photography**, so the 100+ photos don't drown the rest; randomly footprinted + Fisher–Yates
shuffled, packed to the "dense" grid). Experience entries carry only company logos, not work
shots, so they're intentionally left out of the wall.
The wall is heavily washed + center-masked so type always wins, and **drifts with the
cursor** (parallax). The masked centre holds a static **watercolor bloom** — seven washes
(`.sblob`, each with its own `--wash`/position/size/opacity) overlapping through `url(#bleed)`
into one contained multi-colour "explosion", breathing slowly out of phase (no cursor
tracking); a soft `--bg` halo behind `.stage__inner` keeps the name readable over it. Below
the lede, five **section doors** (Blog · Photography · Sketches ·
Projects · Experience) each carry their own watercolor `--wash`; **hovering a door lights
its wash and floats that section's images forward in the collage** while the rest recede.
The header/footer are nudged via `body:has(.stage)` so the wall bleeds under them. All motion
is disabled under `prefers-reduced-motion`. (The old hero-splash-plus-bento landing is
retired.)

## Blog & article reading

- **List page (`/blog/`):** the **same 2-up card grid (`.pcards.g2`) as projects**, so the two
  read as siblings. Each post is a **rounded card**: a 16:10 cover (the post `image`, or a
  per-card watercolor `ph--N` placeholder), the first category as a chip, the display-serif
  title, the description, and a mono `date · N min read` line, with the year below. Two cards
  per row on wide screens, **one column under ~880px** (`.g2`). Whole card is a link.
- **Shared `.pcard` hover (blog + projects):** deliberately **one clean move** — the card
  lifts (soft shadow + accent-tinted border, the cover image scales a touch) and a single
  hue-cycled watercolor wash (`--pcw`, wet `#bleed` edge) **blooms up from the card's base**.
  This replaced the old `.track` rows, whose hover stacked an underline-sweep *and* a
  slide-nudge *and* a numeral pop — too many competing effects. Keep it to the one bloom.
  (There is also **no** cursor-following effect anywhere on the lists — an earlier
  `hover-preview.js` pointer-trailing preview was removed; don't reintroduce mouse-tracked
  effects.)
- Article page: ~70ch measure, generous line-height, mono for code blocks. Show date + estimated read time + tags at top. Optional related-links block at the bottom (this is where curated resource links can sit per-article).

## Projects

- **List (`/projects/`):** a **2-up card grid** (`.pcards.g2`) — one **rounded card** per
  project: a 16:10 cover (the project `image`/first gallery image, or a per-card watercolor
  wash placeholder cycled by index when no image exists), a `★ Featured` chip when featured,
  a short title, a subtitle, the stack, and the year. Titles of the form `Short Name: long
  subtitle` are **split at the colon** in `projects.html`, so the display title stays short
  and the part after the colon becomes the subtitle; titles with no colon use the project
  `summary` as the subtitle. Two cards per row on wide screens, **one column under ~880px**.
  Hover is the shared `.pcard` treatment described in the Blog section (lift + base wash
  bloom; no cursor-following).
- **Card click → project page.** Each card is a plain `<a href>` that navigates to the
  project's own page. No JS interception, no fetch panel: it is native navigation, so the
  back button, new-tab, and SEO all just work. (This replaced an earlier full-screen
  fetch-and-inject panel, which was fragile and styled in the retired crimson theme.)
- **Project page:** a `← Projects` back link, then the title over a soft watercolor
  **bloom** (faint blurred paint behind the heading, matching the home hero), the summary,
  repo/demo buttons, and stack tags, then optional **media**, then Highlights / Challenges /
  write-up.
  - **Image gallery:** a responsive thumbnail strip. Clicking a thumb opens the **same
    lightbox** as the photo galleries (zoom / pan / download / prev-next / focus trap) —
    it steps through just that project's images. The lightbox JS loads only on project
    pages that actually have a gallery.
  - **Showcase video:** a self-hosted `<video controls>` (poster frame, no autoplay,
    `playsinline`), responsive width, with a download-link fallback.

## Experience (`/experiences/`)

- Roles as **"personnel files"** (`.files.g2` / `.file`), newest first (one page, no per-role
  detail pages). Each role is a **rounded dossier card** with an **accent top edge**, a mono
  `Record NN · type/Active` tag, the position title, a **monospace metadata grid**
  (company [linked when provided], type, location, date range), resume-style highlight
  bullets, tech/skills tags, and an optional longer write-up. The company **logo** sits as
  a small rounded chip top-right.
- **2-up grid** (`.g2`, in the wide container): two cards per row on wide screens, collapsing
  to **one column under ~880px**. Rows **stretch to equal height** — both cards match the taller
  one, and any extra space just sits empty at the shorter card's base. No motion beyond
  scroll-reveal.

## Home ("From the gallery")

- The home page surfaces the **5 newest** gallery additions as a **horizontal carousel**
  (`.carousel`): a scroll-snap track you swipe/drag through (its scrollbar is hidden), with
  prev/next arrow buttons on pointer devices. **No autoplay** (manual only — respects the
  no-scroll-jacking / reduced-motion rules). Arrows appear only when the track overflows and
  disable at each end; touch devices rely on swipe (arrows hidden).
- A row of **pagination dots** sits below the track — one per slide, generated in
  `carousel.js` (so the count always matches; no-JS visitors see none). The active dot tracks
  the scroll position live, and clicking a dot jumps to that photo. Dots show on **all** devices
  (they're the touch affordance once arrows are hidden).
- Each slide links to the Photography/Art page (it does *not* open the lightbox). Behavior lives
  in `assets/js/carousel.js`, loaded on the home page only (`page.carousel`).

## Gallery (Photography / Art)

Each bucket page (`/photography/`, `/art/`) lands on the **whole collage** — every
item in the bucket as one masonry, visible immediately. There are **no folders to
drill into**; you narrow the collage *in place* with filter chips or search — no
full page reloads (all show/hide via `gallery.js`).

- **Filter chips (`.gallery-chips` / `.gchip`):** a sticky **toolbar panel**
  (`.gallery-toolbar`) — a rounded, frosted control bar on the raised `--bg-elev`
  surface (same token as the nav, so it reads a touch *lighter* than the canvas, never
  darker, in both themes). It holds a row of chips — **"All" first**, then one per
  `album` (each with its per-album count and an inline `--w` wash); chips + search sit
  as canvas-tone pills on the panel. Clicking a chip filters the collage; the active one carries
  a **watercolor dab** behind it (`::before` running `filter: url(#wash-bloom)`, the
  same wash language as the nav tabs). Deep-linkable via `/photography/#san-francisco`
  (pre-selects that album's chip on load).
- **Search:** one box (right of the chips) filters across *every* album in the bucket
  (title, location, album, alt), combining with the active chip. The masthead eyebrow
  count updates live to the number showing; an empty-state line appears when nothing
  matches.
- **Photo masonry:** CSS columns (no JS masonry) — preserves aspect ratio, no forced
  cropping. Lazy-load below the fold (`loading="lazy"`). Hover = slight lift + caption
  fade-in (respect `prefers-reduced-motion`).
- **Mobile (≤640px):** the search takes the full first row; the chips become a single
  **horizontally scrollable** strip (hidden scrollbar) rather than stacking into many
  rows — matters for photography's long album list.

## Lightbox

When an image is clicked:
- Opens a full-screen overlay on a near-black backdrop; the image is centered and
  captioned below. Image, caption and bottom toolbar are one flex column, so the image
  flex-shrinks to fit and the caption always stays centered above the tools — never
  overlapping them, whatever the image's aspect ratio.
- **Dark backdrop** (see `docs/01-visual.md`) - images are always viewed against near-black so colors read true (consistent with the site's single ink-black theme).
- Controls: prev / next arrows, close (X), and a bottom toolbar with **zoom out / zoom
  level / zoom in** and a **download** button. Keys: `←` `→` navigate, `Esc` closes,
  `+` / `-` zoom, `0` resets zoom.
- A position counter (`3 / 98`) shows above the caption.
- Slides are the **currently visible** thumbnails, so the viewer steps through
  exactly the open folder (or the active search results), not the whole bucket.
- **Zoom & pan:** zoom via the toolbar, scroll-wheel, or double-click (and pinch on
  touch); when zoomed, **drag to pan** (mouse or finger). Zoom resets on every
  navigate/open. The image can't be panned off the stage (bounds are clamped).
- **Download:** the toolbar's download button saves the current full-res image
  (same-origin `<a download>`), and is keyboard-reachable inside the focus trap.
- **Focus trap:** focus moves into the lightbox on open and returns to the triggering
  thumbnail on close; the trap includes the download link. Background is `aria-hidden`
  while open.
- Swipe left/right to navigate on touch — **only when not zoomed**, so panning a zoomed
  image never fights with navigation.
- No autoplay slideshow. The viewer drives.

## Responsive behavior

- Breakpoints: ≤640 mobile (1 gallery column), 641–1024 tablet (2 cols), ≥1025 desktop (3–4 cols).
- Tap targets ≥44px. Test the lightbox and nav on a real phone, not just devtools.
- Articles stay single-column at all sizes.

## Performance

- No render-blocking JS. Defer scripts. Lightbox JS loads only on gallery pages; the
  carousel JS loads only on the home page (`page.carousel`).
- Two self-hosted latin-subset woff2 fonts (Anton + Archivo, ~53KB), preloaded,
  `font-display: swap` — no third-party round-trip.
- Target green Lighthouse (Performance + Accessibility ≥ 90). Image-heavy is fine if lazy-loaded and sized right.

## Accessibility checklist (every page)

- [ ] All images have meaningful `alt` (decorative ones `alt=""`).
- [ ] Lightbox is keyboard-operable and traps/restores focus.
- [ ] Contrast passes AA.
- [ ] One `<h1>` per page; logical heading order.
- [ ] `prefers-reduced-motion` honored (incl. scroll-reveal — see below).
- [ ] Scroll-reveal never traps content: no-JS and reduced-motion visitors see
      everything immediately (the `html.reveal` gate, `docs/01-visual.md`).