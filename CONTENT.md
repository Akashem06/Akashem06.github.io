# Content worksheet

Every piece of **text** on the site, in one place, for you to fill out from your portfolio.
Fill in the `FILL:` lines. The `now:` line shows what's live today so you can keep, tweak, or replace it.

- Leave a field blank / delete the `FILL:` line to keep the current text.
- This file is **not published** (excluded from the build) — it's just your scratch sheet.
- Fields marked **(SEO)** show up in Google results + social share cards. Keep them ~1 sentence, ~150 chars.
- Fields marked **(fixed)** are structural — change only if you want to rename a whole section.

---

## 1. Site-wide  ·  `_config.yml`

These appear in the browser tab, search results, the nav brand, and the footer.

| Field | Fill |
|---|---|
| **Site title** (nav brand + tab titles) — now: `Aryan Kashem` | FILL: |
| **Tagline** — now: `Embedded firmware engineer, photographer, and sketch artist who travels.` | FILL: |
| **Site description (SEO)** — now: `Personal blog and portfolio of Aryan Kashem - embedded firmware engineer (UWaterloo CE), photographer, and sketch artist. Technical writing on embedded systems, finance, and life abroad, plus photography, sketches, and travel.` | FILL: |
| **Author name** — now: `Aryan Kashem` | FILL: |

### Social / contact links (footer)
Handles only — the URL is built for you. Leave blank to hide that link.

| Field | Fill |
|---|---|
| GitHub handle — now: `Akashem06` | FILL: |
| LinkedIn handle — now: `aryan-kashem` | FILL: |
| X / Twitter handle — now: `aryan_ibk` | FILL: |
| Contact email — user part — now: `akashem` | FILL: |
| Contact email — domain part — now: `uwaterloo.ca` | FILL: |

> Email is stored split (user + domain) on purpose and reassembled in the browser, so it never sits in the code as plaintext. Just fill the two halves.

---

## 2. Navigation tabs  ·  `_includes/header.html`  (fixed)

The top-bar labels. Rename only if you want to retitle a whole section (also update the matching page).

`Home` · `Blog` · `Projects` · `Experience` · `Photography` · `Art` · `Resources`

FILL (only if renaming any):

---

## 3. Home page  ·  `index.html`

The landing collage. This is the highest-value copy on the site — the first thing anyone reads.

| Field | Fill |
|---|---|
| **Browser/tab title** — now: `Aryan Kashem` | FILL: |
| **Description (SEO)** — now: `Embedded firmware engineer, photographer, and sketch artist. Firmware, photography, sketches, and travel, gathered in one place.` | FILL: |
| **Kicker line** (small, above your name) — now: `firmware · photography · sketches · travel` | FILL: |
| **Big name** (giant display heading) — now: `Aryan Kashem` | FILL: |
| **Lead paragraph** (1–2 sentences under your name) — now: `Embedded firmware engineer at Waterloo who shoots photos and draws. Bare-metal systems by day; a camera and a sketchbook the rest of the time.` | FILL: |

### The five "doors" (section buttons on the home page)
Each has a **label** and a **small subtitle** under it.

| Door | Label (now) | Subtitle (now) | Fill label | Fill subtitle |
|---|---|---|---|---|
| Blog | `Blog` | `notes & essays` | FILL: | FILL: |
| Photography | `Photography` | `where I've been` | FILL: | FILL: |
| Sketches | `Sketches` | `graphite studies` | FILL: | FILL: |
| Projects | `Projects` | `firmware & systems` | FILL: | FILL: |
| Experience | `Experience` | `the résumé` | FILL: | FILL: |

---

## 4. Section page headers (the masthead on each sub-page)

Every section page has: an **eyebrow** (small kicker), a **title**, a **lede** (one-line intro), and an SEO **description**.

### Blog  ·  `blog.html`
| Field | Fill |
|---|---|
| Title — now: `Blog` | FILL: |
| Eyebrow — auto-generated count (e.g. `3 writings`) — leave as-is unless you want fixed text | FILL: |
| Lede — now: `Notes on embedded systems, finance, and life abroad — the technical and the personal, side by side.` | FILL: |
| Description (SEO) — now: `Technical and personal writing by Aryan Kashem on embedded systems, finance, and life abroad.` | FILL: |
| Empty-state text — now: `No posts yet. Check back soon.` | FILL: |

### Projects  ·  `projects.html`
| Field | Fill |
|---|---|
| Title — now: `Projects` | FILL: |
| Eyebrow — auto count (e.g. `4 builds`) | FILL: |
| Lede — now: `A few firmware and systems projects, written up properly instead of just listed.` | FILL: |
| Description (SEO) — now: `Embedded firmware and engineering projects by Aryan Kashem - a few, well documented.` | FILL: |
| Empty-state text — now: `Projects are on the way.` | FILL: |

### Experience  ·  `experiences.html`
| Field | Fill |
|---|---|
| Title — now: `Experience` | FILL: |
| Eyebrow — auto count (e.g. `3 roles`) | FILL: |
| Lede — now: `Roles and internships — the teams, the systems I worked on, and what I shipped.` | FILL: |
| Description (SEO) — now: `Work history of Aryan Kashem. Embedded firmware roles, internships, and the systems worked on.` | FILL: |
| Empty-state text — now: `Experience is on the way.` | FILL: |

### Photography  ·  `photography.html`
| Field | Fill |
|---|---|
| Title — now: `Photography` | FILL: |
| Eyebrow — now: `Photography` | FILL: |
| Intro line — now: `Photos grouped into folders by place and trip. Open a folder to browse it, search to find a shot, or click any image to view it full size.` | FILL: |
| Description (SEO) — now: `Photography by Aryan Kashem, organized into folders by place and trip, viewable full-screen.` | FILL: |

### Art / Sketches  ·  `art.html`
| Field | Fill |
|---|---|
| Title — now: `Art` | FILL: |
| Eyebrow — now: `Sketchbook` | FILL: |
| Intro line — now: `Sketches and other artwork, grouped into folders. Open a folder to browse it, or click any piece to view it full size.` | FILL: |
| Description (SEO) — now: `Realistic pencil sketches and other artwork by Aryan Kashem, organized into folders.` | FILL: |

### Resources  ·  `resources.html`
| Field | Fill |
|---|---|
| Title — now: `Resources` | FILL: |
| Eyebrow — now: `Toolbox` | FILL: |
| Lede — now: `Tools, references, and links I keep coming back to, for embedded work, photography, and travel.` | FILL: |
| Description (SEO) — now: `Tools, references, and links Aryan Kashem recommends for embedded engineering, photography, and travel.` | FILL: |
| Empty-state text — now: `Resource list coming soon.` | FILL: |

---

## 5. Repeating content items (fill one block per real entry)

These are the actual posts/projects/etc. Each lives in its own file, but the **text fields** are the same every time — copy a block below per item.

### Blog post  (one per article)
```
Title:                _______________________________
Date (YYYY-MM-DD):    _______________________________
Description (SEO):    _______________________________   ← 1 sentence, required
Categories:           [ ____ , ____ ]                    ← e.g. finance, travel
Read time (min):      ____   (optional)
Body (Markdown):      the article itself
```

### Project  (one per build)
```
Title:                _______________________________   ← "Short Name: longer subtitle" splits nicely on the card
Summary:              _______________________________   ← shows under the title if no colon in title
Repo URL:             _______________________________
Demo URL:             _______________________________   (optional)
Stack tags:           [ ____ , ____ , ____ ]             ← e.g. C, FreeRTOS, STM32
Features (bullets):   - _______________________________
                      - _______________________________
Challenges:           _______________________________   ← 1–2 hard problems + the fix
Featured on home?     yes / no
Gallery image alts:   one line per image (required for each)
Body (Markdown):      full write-up — what it does, your role, what you learned
```

### Experience  (one per role)
```
Company:              _______________________________
Position title:       _______________________________
Company URL:          _______________________________   (optional)
Location:             _______________________________
Type:                 Internship / Co-op / Full-time / Part-time / Contract
Start date (display): _______________________________   ← e.g. "May 2025"
End date (display):   _______________________________   ← blank = "Present"
Stack / skills tags:  [ ____ , ____ , ____ ]
Highlights (bullets): - _______________________________  ← lead with impact ("cut X by Y%")
                      - _______________________________
Photos (optional):    drag them into Studio → Experience → gallery
Photo alts:           one line per image (required for each)
Body (Markdown):      optional longer write-up
```

### Gallery item — photo or sketch  (one per image)
```
Bucket:               photography / art
Album (folder name):  _______________________________   ← e.g. "San Francisco" (new name = new folder)
Title:                _______________________________
Alt text:             _______________________________   ← REQUIRED, describe the image
Location:             _______________________________   (optional)
Date (YYYY-MM-DD):    _______________________________
```

### Resource link  (one per link)
```
Title:                _______________________________
URL:                  _______________________________
Note:                 _______________________________   (optional 1-liner)
```

---

### Priority order (if you want to fill highest-impact first)
1. **Home page** — kicker, name, lead, 5 door subtitles (section 3)
2. **Site-wide** — tagline + description + social handles (section 1)
3. **Section ledes + SEO descriptions** (section 4)
4. **Real content items** — your actual posts / projects / roles / photos (section 5)
