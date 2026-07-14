#!/usr/bin/env python3
"""Studio — a small local web app to add/edit/delete site content.

Runs in your browser (so it works anywhere, including WSL — no display server):

    pip install -r tools/requirements.txt
    python tools/studio/app.py        # then open http://127.0.0.1:8000

It writes the same Markdown files you'd author by hand (the source of truth),
and optimizes images on upload via the tested engine in photo_tool.py.
Nothing here ships with the site — tools/ is excluded from the Jekyll build.
"""
from __future__ import annotations

import socket
import sys
import tempfile
import webbrowser
from pathlib import Path
from threading import Timer

from flask import Flask, abort, jsonify, request, send_file, send_from_directory

THIS = Path(__file__).resolve().parent
sys.path.insert(0, str(THIS.parent))  # tools/ -> photo_tool
import photo_tool  # noqa: E402
import content  # noqa: E402  (tools/studio on path via __main__)

REPO_ROOT = content.REPO_ROOT
app = Flask(__name__, static_folder=str(THIS / "static"), static_url_path="")

# Form/widget metadata the frontend uses to render each collection's form.
FIELDS = {
    "posts": [
        {"name": "title", "type": "string", "required": True},
        {"name": "date", "type": "date", "required": True},
        {"name": "description", "type": "text", "required": True},
        {"name": "categories", "type": "list", "required": True},
        {"name": "image", "type": "image"},
        {"name": "read_time", "type": "int"},
    ],
    "projects": [
        {"name": "title", "type": "string", "required": True},
        {"name": "summary", "type": "text", "required": True},
        {"name": "team", "type": "string"},
        {"name": "repo", "type": "string"},
        {"name": "demo", "type": "string"},
        {"name": "stack", "type": "list"},
        {"name": "features", "type": "list"},
        {"name": "challenges", "type": "text"},
        {"name": "image", "type": "image"},
        {"name": "gallery", "type": "gallery"},
        {"name": "video", "type": "video"},
        {"name": "video_poster", "type": "image"},
        {"name": "featured", "type": "bool"},
        {"name": "date", "type": "date"},
    ],
    "experiences": [
        {"name": "company", "type": "string", "required": True},
        {"name": "title", "type": "string", "required": True},
        {"name": "company_url", "type": "string"},
        {"name": "logo", "type": "image", "required": True},
        {"name": "location", "type": "string"},
        {"name": "type", "type": "choice",
         "choices": ["Internship", "Co-op", "Full-time", "Part-time", "Contract"]},
        {"name": "start_date", "type": "string"},
        {"name": "end_date", "type": "string"},
        {"name": "stack", "type": "list"},
        {"name": "highlights", "type": "list"},
        {"name": "gallery", "type": "gallery"},
        {"name": "date", "type": "date"},
        {"name": "featured", "type": "bool"},
    ],
    "gallery": [
        {"name": "bucket", "type": "choice", "required": True, "choices": ["photography", "art"]},
        {"name": "album", "type": "string", "required": True},
        {"name": "title", "type": "string"},
        {"name": "image", "type": "image", "required": True},
        {"name": "thumb", "type": "hidden"},
        {"name": "alt", "type": "text", "required": True},
        {"name": "location", "type": "string"},
        {"name": "date", "type": "date"},
        {"name": "featured", "type": "bool"},
    ],
}
HAS_BODY = {"posts": True, "projects": True, "experiences": True, "gallery": False}


@app.get("/")
def index():
    return send_from_directory(app.static_folder, "index.html")


@app.get("/api/schema")
def schema():
    return jsonify({"fields": FIELDS, "hasBody": HAS_BODY})


@app.get("/api/content/<kind>")
def api_list(kind: str):
    _check_kind(kind)
    return jsonify(content.list_items(kind))


@app.get("/api/albums")
def api_albums():
    """Existing gallery folders, for the album autocomplete in the editor."""
    return jsonify(content.list_albums())


@app.get("/api/content/<kind>/<item_id>")
def api_get(kind: str, item_id: str):
    _check_kind(kind)
    try:
        return jsonify(content.get_item(kind, item_id))
    except content.ContentError as e:
        abort(404, str(e))


@app.post("/api/content/<kind>")
def api_create(kind: str):
    return _save(kind, None)


@app.put("/api/content/<kind>/<item_id>")
def api_update(kind: str, item_id: str):
    return _save(kind, item_id)


@app.delete("/api/content/<kind>/<item_id>")
def api_delete(kind: str, item_id: str):
    _check_kind(kind)
    drop = request.args.get("images") in ("1", "true", "yes")
    try:
        content.delete_item(kind, item_id, drop_images=drop)
    except content.ContentError as e:
        abort(404, str(e))
    return jsonify({"ok": True})


@app.post("/api/upload/<kind>")
def api_upload(kind: str):
    """Optimize an uploaded image (or copy a video); return the stored web path(s).

    Optional form fields:
      slot   — "gallery" | "video" | "poster" | "" (cover/logo). Drives the
               output filename + whether a thumbnail is also produced.
      folder — the project slug (so a project's media groups under one folder);
               for experiences it slugifies the company for the logo filename.
    """
    _check_kind(kind)
    if "file" not in request.files:
        abort(400, "no file")
    f = request.files["file"]
    if not f.filename:
        abort(400, "empty filename")

    slot = request.form.get("slot", "")
    folder = photo_tool.slugify(request.form.get("folder", "")) or "untitled"

    # Video: copy as-is — Pillow handles images only, no transcoding here.
    if slot == "video":
        dest = REPO_ROOT / "assets" / "video" / "projects" / f"{folder}.mp4"
        dest.parent.mkdir(parents=True, exist_ok=True)
        f.save(str(dest))
        return jsonify({"video": f"/assets/video/projects/{folder}.mp4"})

    slug = photo_tool.slugify(Path(f.filename).stem) or "image"
    with tempfile.NamedTemporaryFile(delete=False, suffix=Path(f.filename).suffix) as tmp:
        f.save(tmp.name)
        src = Path(tmp.name)
    try:
        if kind == "gallery":
            album = photo_tool.slugify(request.form.get("album", "")) or "uploads"
            base = REPO_ROOT / "assets" / "images" / "gallery" / album
            photo_tool.optimize(src, base / f"{slug}.jpg", 2000, 80)
            photo_tool.optimize(src, base / "thumb" / f"{slug}.jpg", 600, 78)
            return jsonify({
                "image": f"/assets/images/gallery/{album}/{slug}.jpg",
                "thumb": f"/assets/images/gallery/{album}/thumb/{slug}.jpg",
                "suggestedTitle": photo_tool.titleize(Path(f.filename).stem),
            })
        if kind == "posts":
            rel = f"/assets/images/blog/{slug}.jpg"
            photo_tool.optimize(src, REPO_ROOT / rel.lstrip("/"), 1600, 82)
            return jsonify({"image": rel})
        if kind == "experiences":
            # Company photos group under assets/images/experiences/<company>/;
            # the logo stays a flat <company>.jpg alongside that folder.
            if slot == "gallery":
                base = REPO_ROOT / "assets" / "images" / "experiences" / folder
                photo_tool.optimize(src, base / f"{slug}.jpg", 1600, 82)
                photo_tool.optimize(src, base / "thumb" / f"{slug}.jpg", 600, 78)
                return jsonify({
                    "image": f"/assets/images/experiences/{folder}/{slug}.jpg",
                    "thumb": f"/assets/images/experiences/{folder}/thumb/{slug}.jpg",
                    "suggestedAlt": photo_tool.titleize(Path(f.filename).stem),
                })
            rel = f"/assets/images/experiences/{folder}.jpg"
            photo_tool.optimize(src, REPO_ROOT / rel.lstrip("/"), 512, 85)
            return jsonify({"image": rel})

        # projects: group all media under assets/images/projects/<folder>/
        base = REPO_ROOT / "assets" / "images" / "projects" / folder
        if slot == "gallery":
            photo_tool.optimize(src, base / f"{slug}.jpg", 1600, 82)
            photo_tool.optimize(src, base / "thumb" / f"{slug}.jpg", 600, 78)
            return jsonify({
                "image": f"/assets/images/projects/{folder}/{slug}.jpg",
                "thumb": f"/assets/images/projects/{folder}/thumb/{slug}.jpg",
                "suggestedAlt": photo_tool.titleize(Path(f.filename).stem),
            })
        # cover (image) or video poster
        fname = "poster" if slot == "poster" else "cover"
        rel = f"/assets/images/projects/{folder}/{fname}.jpg"
        photo_tool.optimize(src, REPO_ROOT / rel.lstrip("/"), 1600, 82)
        return jsonify({"image": rel})
    finally:
        src.unlink(missing_ok=True)


@app.post("/api/bulk/gallery")
def api_bulk_gallery():
    """Create many gallery items at once from a batch of photos or scans.

    Every file lands in the same album with the same date/description — the
    tedious part of the one-at-a-time flow. Shared form fields:

      bucket    — "photography" | "art"            (default photography)
      album     — collection label / folder        (required)
      alt       — shared description; falls back to each item's title
      location  — optional, shared
      date      — shared upload date               (defaults to today)
      featured  — "1" to flag every item
      titleMode — "filename": each file's own name becomes the title (default)
                  "index":    baseTitle + a running number (1, 2, 3…)
      baseTitle — the shared stem used when titleMode == "index"

    Each file is optimized into assets/images/gallery/<album>/ (+ thumb) and one
    Markdown item is written — exactly like a single New → Save, just batched.
    Per-file failures are collected and reported without aborting the rest.
    """
    files = [f for f in request.files.getlist("files") if f and f.filename]
    if not files:
        abort(400, "no files")

    bucket = (request.form.get("bucket") or "photography").strip()
    album_label = (request.form.get("album") or "").strip()
    if not album_label:
        abort(400, "album is required")
    album = photo_tool.slugify(album_label) or "uploads"
    shared_alt = (request.form.get("alt") or "").strip()
    location = (request.form.get("location") or "").strip()
    date = (request.form.get("date") or "").strip()
    featured = request.form.get("featured", "") in ("1", "true", "yes", "on")
    title_mode = request.form.get("titleMode", "filename")
    base_title = (request.form.get("baseTitle") or "").strip()

    base_dir = REPO_ROOT / "assets" / "images" / "gallery" / album
    used: set[str] = set()
    created: list[str] = []
    errors: list[str] = []

    for i, f in enumerate(files, 1):
        stem = Path(f.filename).stem
        slug = photo_tool.slugify(stem) or "image"
        # Keep image filenames unique within the album and this batch — photos
        # "with the same name" are exactly the case bulk upload is meant for.
        uslug, n = slug, 2
        while uslug in used or (base_dir / f"{uslug}.jpg").exists():
            uslug, n = f"{slug}-{n}", n + 1
        used.add(uslug)

        if title_mode == "index" and base_title:
            title = f"{base_title} {i}"
        else:
            title = photo_tool.titleize(stem)

        with tempfile.NamedTemporaryFile(delete=False, suffix=Path(f.filename).suffix) as tmp:
            f.save(tmp.name)
            src = Path(tmp.name)
        try:
            photo_tool.optimize(src, base_dir / f"{uslug}.jpg", 2000, 80)
            photo_tool.optimize(src, base_dir / "thumb" / f"{uslug}.jpg", 600, 78)
            new_id = content.save_item("gallery", None, {
                "bucket": bucket,
                "album": album_label,
                "title": title,
                "image": f"/assets/images/gallery/{album}/{uslug}.jpg",
                "thumb": f"/assets/images/gallery/{album}/thumb/{uslug}.jpg",
                "alt": shared_alt or title,
                "location": location,
                "date": date,
                "featured": featured,
            }, "")
            created.append(new_id)
        except Exception as e:  # noqa: BLE001 — report per file, keep going
            errors.append(f"{f.filename}: {e}")
        finally:
            src.unlink(missing_ok=True)

    return jsonify({"ok": True, "created": created, "count": len(created), "errors": errors})


@app.get("/asset/<path:rel>")
def asset(rel: str):
    """Serve a repo image so the browser can preview it. Assets only."""
    if not rel.startswith("assets/"):
        abort(403)
    target = (REPO_ROOT / rel).resolve()
    if not str(target).startswith(str(REPO_ROOT.resolve())) or not target.is_file():
        abort(404)
    return send_file(target)


def _check_kind(kind: str):
    if kind not in FIELDS:
        abort(404, f"unknown kind: {kind}")


def _save(kind: str, item_id: str | None):
    _check_kind(kind)
    data = request.get_json(force=True, silent=True) or {}
    meta = data.get("meta", {})
    body = data.get("body", "") if HAS_BODY[kind] else ""
    try:
        new_id = content.save_item(kind, item_id, meta, body)
    except content.ContentError as e:
        abort(400, str(e))
    return jsonify({"ok": True, "id": new_id})


def _open_browser(port: int):
    webbrowser.open(f"http://127.0.0.1:{port}")


def _free_port(preferred: int) -> int:
    """Return `preferred` if nothing is listening on it, else the next free port."""
    for p in [preferred, *range(preferred + 1, preferred + 25)]:
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            if s.connect_ex(("127.0.0.1", p)) != 0:  # connect failed -> port is free
                return p
    return preferred


if __name__ == "__main__":
    argv = sys.argv[1:]
    # Default off the crowded 8000 (Speaches, etc.); override with --port N.
    preferred = int(argv[argv.index("--port") + 1]) if "--port" in argv else 8731
    port = _free_port(preferred)
    if "--no-browser" not in argv:
        Timer(1.0, _open_browser, args=[port]).start()
    print(f"Studio running at http://127.0.0.1:{port}  (Ctrl+C to stop)")
    # threaded=True so a slow request (e.g. a bulk upload optimizing many images)
    # doesn't block the parallel /asset preview requests the page fires alongside
    # it — the single-threaded default resets those connections ("Failed to fetch").
    app.run(host="127.0.0.1", port=port, debug=False, threaded=True)
