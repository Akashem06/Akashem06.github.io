# 02 - Tabs

The site's top-level navigation and what belongs in each section. Keep the nav to these items - adding more dilutes it.

## Nav order

`Home · Blog · Projects · Experience · Photography · Art · Resources`

(On mobile, collapse to a hamburger. Keep order identical.)

There is **no separate About tab** - Home *is* the about/landing (the old `/about/`
page was merged in). Don't re-add it.

## Home (`index.html`) — the landing / about

The 10-second pitch **and** the bio, in one attention-grabbing hero. Contains:
- The hero: who Aryan is (embedded firmware engineer who draws — the engineer/artist
  duality), in one punchy lede. This replaces the standalone About page.
- 3 featured recent blog posts.
- A few featured gallery images (the carousel, links into Gallery).
- 1–2 featured projects.
- Links: GitHub (and other handles as provided), email via the footer.

Keep the hero short and vivid — it routes people *and* makes the "smart polymath"
first impression; not a wall of content or a résumé dump.

## Blog (`blog.html` + `_posts/`)

Reverse-chronological list of all posts: title, date, read time, category tags, one-line description. This is the SEO + traffic engine. Topics: embedded firmware learnings, personal finance/life abroad, travel writing. Honest documentation, not career advice.

## Projects (`projects.html` + `_projects/`)

Engineering work - the technical credibility section. 3–5 quality entries beats many thin ones. Each project entry should carry:
- What it does + the problem it solves.
- **Live demo link and/or repo link** up top.
- Tech stack and *why* each choice.
- 3–5 highlighted features.
- 1–2 real challenges and how they were solved.
- **Media:** an optional `gallery` of 3–4 images (a thumbnail strip that opens the
  lightbox) and/or a self-hosted `video` showcase clip. See `docs/04-authoring.md`.

Seed candidates from Aryan's background: Midnight Sun solar car vehicle firmware, BLE hearing-aid firmware, ethernet transceiver drivers, fab-automation tooling in Rust. (Confirm what's shareable - some internship work may be NDA'd.)

The `/projects/` list renders as an **editorial index** (one roomy row per project: index
numeral, 4:3 cover, short title split from its colon subtitle, stack, year); clicking a row
expands the project's full page in-place (progressive enhancement over the real link).
See `docs/03-user-interface.md`.

## Experience (`experiences.html` + `_experiences/`)

Work history — roles and internships, rendered as **"personnel file" cards** (newest
first; no per-role pages; see `docs/03-user-interface.md`). Each entry carries: company (+ optional link) and logo,
position title, employment type, location, start/end dates, tech/skills tags,
resume-style highlight bullets, and an optional longer write-up body. This is the
résumé-style credibility section that complements the deeper Projects writeups.
**Confirm anything internship-related is shareable (NDA check) before posting.**
Schema + Studio workflow in `docs/04-authoring.md`.

## Photography & Art (`photography.html` · `art.html` + `_galleries/`)

Visual creative work, organized as **two top-level buckets**, each its own page:

- **Photography** (`photography.html`) — `bucket: photography`
- **Art** (`art.html`) — `bucket: art` (realistic pencil sketches, etc.)

Within a bucket, photos are grouped into **folders** (the `album` field, e.g.
"San Francisco", "Madrid", "Sketches"). Each page opens on a grid of folder
cards; opening a folder reveals its photos, and a search box filters across every
folder in that bucket. A folder is created simply by giving an item a new `album`
name — no config. See `docs/03-user-interface.md` for grid/folder/lightbox
behavior and `docs/04-authoring.md` for the frontmatter schema.

Travel photos live in whichever Photography folder fits the trip (there is no
separate Travel tab); travel *writing* is just Blog posts tagged `travel`.

## Resources (`resources.html`)

Curated link cards - tools, gear, and referral links. Public-facing list only; the *strategy* behind it stays in the gitignored `STRATEGY.local.md`, never here.

## About → merged into Home

There is no `about.html`. The bio (UWaterloo Computer Engineering, the engineer +
photographer/sketch-artist identity, GitHub for depth) lives in the **Home hero**
(`index.html`). Fuller skills/experience detail belongs on **Experience**. Keep it one
tight, vivid intro — not a résumé dump.

## Section ownership of content types

| Content type | Lives in collection | Surfaced on tab(s) |
|---|---|---|
| Blog article | `_posts/` | Blog, Home (if featured) |
| Engineering project | `_projects/` | Projects, Home (if featured) |
| Work experience / role | `_experiences/` | Experience |
| Photo / sketch image | `_galleries/` | Photography or Art (by `bucket`), Home (if featured) |