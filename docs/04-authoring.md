# 04 - Authoring (Aryan's interface)

How Aryan posts and updates content. Under the hood every item is just a Markdown
file — this doc is the schema reference. You can author those files three ways:
by hand, through the **Front Matter CMS** editor, or (for photos) the **import tool**.

## The whole workflow

```
1. Add a file in _posts/ , _projects/ , or _galleries/
2. Drop images in assets/images/<section>/
3. git add . && git commit -m "content: ..." && git push
4. CI validates, then Pages rebuilds → live
```

No build step to run by hand. If CI fails (see `docs/05-cicd.md`), the push is rejected before going live - fix and re-push.

## Editor & tools

These are conveniences for producing the same Markdown files described below — the
files remain the source of truth, so hand-editing always works too. None of this
tooling ships with the site (`tools/`, `frontmatter.json`, `.vscode/` are excluded
from the build).

### Studio (web app) — the main interface

A small local web app (`tools/studio/`) for create / edit / delete across all three
collections, in the browser — so it runs anywhere, **including WSL** (no display
server). Drag a photo in and it's optimized + thumbnailed on upload, with the
Markdown path filled in. This is the recommended day-to-day tool because it's the
only one that does editing *and* image optimization together.

```bash
python -m venv tools/.venv && source tools/.venv/bin/activate   # Scripts\activate on Windows
pip install -r tools/requirements.txt
python tools/studio/app.py          # opens http://127.0.0.1:8731 (auto-picks a free port)
```

Full setup and usage in `tools/README.md`. After adding gallery items, refine the
auto-suggested `alt` text before committing (accessibility; CI fails on missing alt).

**Bulk upload (gallery only).** On the Gallery tab, **⇪ Bulk** opens a batch form for
when a shoot or a stack of scans all share one album, description and date. Drop many
files at once; each is optimized + thumbnailed and written as its own item. Two title
modes: *use each file's name* (good for sketches — the filename becomes the title), or
*shared name + index* (e.g. `Iceland 1`, `Iceland 2`… — good for a photo series). The
description falls back to each item's title when left blank, and duplicate filenames are
de-duplicated automatically (`dsc001`, `dsc001-2`, …). Refine `alt`/titles afterward as
needed.

### Front Matter CMS (visual editor, in VS Code)

A dashboard inside VS Code for create / edit / delete of posts, projects, and gallery
items, with a form per field (no hand-written frontmatter). Free, local, no servers.

- Config: `frontmatter.json` at the repo root (content types + folders).
- Install: opening the repo in VS Code prompts to install the recommended extension
  (`eliostruyf.vscode-front-matter`), pinned in `.vscode/extensions.json`.
- Open the **Front Matter** panel → pick a folder (Blog / Projects / Gallery) →
  *Create content*. Edit then commit + push as usual.
- It edits Markdown only; it does **not** optimize images — use the import tool for
  photos so the repo stays small.

### Bulk photo importer (`tools/photo_tool.py` / `photo_tui.py`)

For dumping a whole folder of photos at once (a trip's worth) rather than one at a
time in Studio. Same image engine; optimizes every image + writes one gallery `.md`
each. CLI or a terminal UI (no preview — terminals can't show images):

```bash
python tools/photo_tui.py                       # terminal UI
python tools/photo_tool.py --source ... --album iceland --bucket photography   # CLI
```

After import, **refine the auto-generated `title` and `alt` text** (derived from
filenames) before committing — accessibility matters and CI fails on missing alt.

**Routing one folder into several albums.** Each run imports a whole `--source` into a
single `--album`. If a folder holds mixed mediums (e.g. the `Art` folder with
`MixedMedia*`, `Realistic*`, `Sketch_*`), run it once per album and use `--exclude`
(a filename regex) to skip the others — no need to physically split the folder:

```bash
python tools/photo_tool.py --source ".../Art" --album "Sketches" --bucket art --exclude "Realistic|MixedMedia"
```

**Adding a new medium later** (painting, clay, …) needs no code — the gallery groups by
the `album` field, so just import with a new `--album` and a folder card appears.

## Blog post

File: `_posts/YYYY-MM-DD-slug.md`

```yaml
---
layout: post
title: "How I Use Wise as a Canadian Student in Spain"
date: 2026-06-15
description: "One-sentence SEO description - shows in search results and OG card."
categories: [finance, travel]
image: /assets/images/blog/wise-spain.jpg   # OG / social preview
read_time: 6                                 # minutes (optional; can auto-calc)
---

Article body in Markdown...
```

Required: `title`, `date`, `description`, `categories`. Missing `description` fails CI (SEO depends on it).

## Engineering project

File: `_projects/slug.md`

```yaml
---
layout: page
title: "Midnight Sun - Vehicle Firmware"
summary: "CAN-based control firmware for a solar race car."
repo: https://github.com/Akashem06/...        # repo link
demo:                                          # live demo URL if any
stack: [C, FreeRTOS, STM32, CAN]
features:
  - "Real-time CAN message routing across ECUs"
  - "Fault-tolerant state machine for race conditions"
  - "..."
challenges: "Brief note on 1–2 hard problems and the fix."
image: /assets/images/projects/midnightsun.jpg   # cover (card + OG)
gallery:                                          # optional 3–4 images → lightbox strip
  - image: /assets/images/projects/midnightsun/01.jpg
    thumb: /assets/images/projects/midnightsun/thumb/01.jpg
    alt: "Solar car telemetry dashboard on a bench setup"
  - image: /assets/images/projects/midnightsun/02.jpg
    thumb: /assets/images/projects/midnightsun/thumb/02.jpg
    alt: "Close-up of the custom CAN board"
video: /assets/video/projects/midnightsun.mp4     # optional self-hosted showcase clip
video_poster: /assets/images/projects/midnightsun/poster.jpg   # optional still
featured: true                                 # surfaces on Home
---

Longer write-up: what it does, the problem, your role, what you learned.
```

Lead with `repo`/`demo` links. Confirm anything internship-related is shareable (NDA check) before committing.

**Project media.** `gallery` is a list of `{image, thumb, alt}` — rendered as a thumbnail
strip that opens the site lightbox (every entry needs `alt`). All of a project's images
live under a per-project folder `assets/images/projects/<project-slug>/` (with a `thumb/`
subfolder); Studio creates this for you. `video` is a **self-hosted MP4** under
`assets/video/projects/` — keep it short and compressed (aim ≤ ~10 MB; GitHub Pages isn't
a video host), and give it a `video_poster` still. In **Studio → Projects**, drag multiple
images into the *gallery* dropzone (each is optimized + thumbnailed, with an alt box) and
drop an `.mp4` into the *video* field — type the project **title first** so the media lands
in the right folder.

## Experience (work history)

File: `_experiences/slug.md`

```yaml
---
company: "Texas Instruments"
title: "Firmware Engineering Intern"      # position title
company_url: https://ti.com                # optional — links the company name/logo
logo: /assets/images/experiences/ti.jpg
location: "Dallas, TX"
type: "Internship"                         # Internship | Co-op | Full-time | Part-time | Contract
start_date: "May 2025"                     # display string (free format)
end_date: "Aug 2025"                       # blank or omit → shows "Present"
stack: [C, FreeRTOS, ARM]                  # tech / skills tags
highlights:                                # resume-style bullets (lead with impact)
  - "Built X that cut Y by Z%."
gallery:                                    # optional photos from the role (each needs alt text)
  - image: /assets/images/experiences/ti/lab.jpg
    thumb: /assets/images/experiences/ti/thumb/lab.jpg
    alt: "The TI firmware lab bench, mid bring-up."
date: 2025-08-31                           # YYYY-MM-DD — used only to sort (newest first)
featured: false
---

Optional longer write-up about the role (Markdown body).
```

Required: `company`, `title`, `logo` (its alt is set automatically to "<company> logo").
Roles render as a **timeline** on `/experiences/`, sorted by `date` (newest first) —
`start_date`/`end_date` are just display text. Add roles via **Studio → Experience** (drag
the logo in; it's optimized to a small square). Optionally drop photos into the **gallery**
field — Studio optimizes each into `assets/images/experiences/<company>/` (with a thumb) and
they render as a small photo strip on the card, opening in the shared lightbox. Every gallery
photo needs **alt text**. Adding a new role is just a new file — no config. A new employment
`type` value is free text if you need one beyond the listed choices.

## Gallery item

File: `_galleries/slug.md` - one file per image (or per set; keep it simple with one-per-image to start).

```yaml
---
bucket: photography      # photography | art  (which top-level page)
album: "San Francisco"   # folder name within the bucket (free text; new value = new folder)
title: "Reykjavík at blue hour"
image: /assets/images/gallery/reykjavik-blue-hour.jpg
thumb: /assets/images/gallery/reykjavik-blue-hour-thumb.jpg   # optional
alt: "City skyline under deep blue twilight, lights reflecting on wet street"
location: "Reykjavík, Iceland"
date: 2026-05-02
featured: false
---
```

Required: `bucket`, `album`, `image`, `alt`. **`alt` is mandatory - CI fails without it.**
`bucket` chooses the page (Photography or Art); `album` is the folder the photo
appears in there. Typing an `album` that doesn't exist yet just creates a new
folder — no extra config. The folder cover is its newest photo automatically.

> The `album` string is also used (slugified) as the image subfolder on upload, so
> e.g. `album: "San Francisco"` writes to `assets/images/gallery/san-francisco/`.
> (The original SF import predates this and lives under `assets/images/gallery/sf/`;
> image paths are stored per-item, so the mismatch is harmless.)

## Image prep (do before committing)

- The importer does this for you: full image longest edge **~2560px** (quality **82**)
  so it holds detail when zoomed in the lightbox; thumb **~600px** for the fast grid.
  Two tiers — the grid loads only the small thumb, the lightbox loads the larger full.
- Compress: aim < 400KB per full image. At 2560/q82 some full images run a bit larger;
  that's fine — CI only **warns** over 400KB, it won't fail. Lower `--quality` or
  `--max-edge` if you want them smaller.
- The stored full can only be as sharp as the file you import from — feed the importer
  your **original (uncompressed) photos**, not an already-compressed export.
- Name descriptively, lowercase, hyphenated: `reykjavik-blue-hour.jpg`.
- Put in `assets/images/<section>/` matching the content type.

## Editing / updating

- **Fix a typo:** edit the file, push.
- **Unpublish a post:** add `published: false` to its frontmatter (don't delete - keeps the file history).
- **Reorder featured items:** toggle `featured: true/false` in frontmatter.
- **Bulk caption/alt fixes:** edit the gallery `.md` files; images themselves don't need re-uploading.

## What NOT to commit

- Affiliate strategy, commission figures, timeline → `STRATEGY.local.md` (gitignored).
- Email in plaintext, any keys, analytics IDs in a way that exposes secrets (the GA tag ID is public-safe; anything secret is not).
- Raw multi-MB unoptimized images.