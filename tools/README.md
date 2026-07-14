# tools/ — content helpers

Cross-platform (Windows / WSL / Linux / macOS) Python helpers for adding content.
They are **not** part of the website build — `_config.yml` excludes `tools/`.

## What's here

| File | Purpose |
|---|---|
| `studio/` | **Studio** — a local web app to add / edit / delete gallery items, posts, projects, and experiences in the browser, with drag/drop image upload + optimization. The main interface. |
| `photo_tool.py` | Core image engine + CLI for **bulk** importing a whole folder of photos at once. |
| `photo_tui.py` | Terminal UI over the same bulk engine (no image preview — terminals can't). |
| `requirements.txt` | `Pillow`, `textual` (TUI), `Flask` + `PyYAML` (Studio). |

These do the thing a Markdown CMS can't: shrink images to web sizes (< 400 KB) +
thumbnails so the gallery can grow without bloating the repo. Studio is the
day-to-day tool; the bulk importer is for dumping a trip's worth of photos in one go.
See `docs/04-authoring.md` for the full authoring workflow.

## Studio (web app) — the main interface

```bash
python -m venv tools/.venv
# Windows:        tools\.venv\Scripts\activate
# macOS / Linux:  source tools/.venv/bin/activate
pip install -r tools/requirements.txt
python tools/studio/app.py          # opens http://127.0.0.1:8731 (auto-picks a free port; --port N to choose)
```

Runs entirely in your browser, so it works anywhere — **including WSL** (no display
server needed). Tabs for **Gallery / Posts / Projects / Experience**: pick an item to
edit, or **+ New**. For images, drag a photo onto the dropzone — it's optimized + thumbnailed
on upload and the Markdown path is filled in for you. Save writes the `.md` file;
Delete removes it (gallery deletes can optionally remove the image files too).

On the **Gallery** tab, **⇪ Bulk** batch-uploads many photos/scans that share one album,
description and date — drop them all in and each becomes its own item. Titles come either
from each file's name (sketches) or a shared name + index like `Iceland 1`, `Iceland 2`
(photo series). It's the in-browser equivalent of the folder importer below, minus the
terminal.

It binds to `127.0.0.1` only and writes directly into your working tree — review and
commit the changes as usual. Refine auto-suggested gallery titles/alt before committing.

## One-time setup

Use a real CPython (python.org), **not** msys2/mingw Python — the latter tries to
compile Pillow from source. On Windows the `py` launcher picks the right one.

```bash
# from the repo root
python -m venv tools/.venv
# Windows:        tools/.venv/Scripts/activate
# macOS / Linux:  source tools/.venv/bin/activate
pip install -r tools/requirements.txt
```

## Importing photos

**TUI (recommended):**

```bash
python tools/photo_tui.py
```

Fill in the source folder, an album slug (e.g. `iceland`), type, optional location,
and an optional exclude regex, then press **Import**.

**CLI (scriptable):**

```bash
python tools/photo_tool.py \
  --source "/path/to/photos" \
  --album iceland \
  --type travel \
  --location "Reykjavik, Iceland" \
  --exclude "Inez|Aryan"
```

Both:
- write optimized images to `assets/images/gallery/<album>/` (+ `/thumb/`),
- write one `_galleries/<album>-<slug>.md` per photo (type, title, alt, location, date),
- never modify your originals,
- strip EXIF (incl. GPS) for privacy and size.

## After importing

1. Skim the new `_galleries/<album>-*.md` files and **refine the auto-generated `alt`
   text** — it's derived from filenames and accessibility matters (and CI fails on
   missing alt).
2. Delete any duds: remove the `.md` file (optionally its image + thumb).
3. Commit and push.

## Defaults

`--max-edge 2000` · `--thumb-edge 600` · `--quality 80`. A few large landscapes may
land slightly over 400 KB; CI only *warns* on that, it won't fail. Lower `--quality`
to ~75 if you want them all under.
