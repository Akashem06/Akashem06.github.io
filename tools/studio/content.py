"""Content layer for Studio: read / write / list / delete the three collections.

Each item is a Markdown file with YAML frontmatter (the site's source of truth).
This module is the single place that knows each collection's schema, filename
rule, and field coercion, so app.py stays thin.
"""
from __future__ import annotations

import json
import re
import sys
from datetime import date as _date
from pathlib import Path
from typing import Any

import yaml

# Reuse the tested helpers from the sibling photo_tool module.
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
from photo_tool import slugify  # noqa: E402

REPO_ROOT = Path(__file__).resolve().parent.parent.parent

# --- Schemas ---------------------------------------------------------------
# `order` drives both the form and the written frontmatter key order.
SCHEMAS: dict[str, dict[str, Any]] = {
    "posts": {
        "dir": "_posts",
        "order": ["title", "date", "description", "categories", "image", "read_time"],
        "required": ["title", "date", "description", "categories"],
        "lists": ["categories"],
        "bools": [],
        "ints": ["read_time"],
        "has_body": True,
        "image_dir": "assets/images/blog",
    },
    "projects": {
        "dir": "_projects",
        "order": ["title", "summary", "team", "repo", "demo", "stack", "features", "challenges", "image", "gallery", "video", "video_poster", "featured", "date"],
        "required": ["title", "summary"],
        "lists": ["stack", "features"],
        "bools": ["featured"],
        "ints": [],
        "json": ["gallery"],  # list of {image, thumb, alt} mappings, stored as-is
        "has_body": True,
        "image_dir": "assets/images/projects",
    },
    "experiences": {
        "dir": "_experiences",
        "order": ["company", "title", "company_url", "logo", "location", "type",
                  "start_date", "end_date", "stack", "highlights", "gallery", "date", "featured"],
        "required": ["company", "title", "logo"],
        "lists": ["stack", "highlights"],
        "bools": ["featured"],
        "ints": [],
        "json": ["gallery"],  # list of {image, thumb, alt} mappings, stored as-is
        "has_body": True,
        "image_dir": "assets/images/experiences",
    },
    "gallery": {
        "dir": "_galleries",
        "order": ["bucket", "album", "title", "image", "thumb", "alt", "location", "date", "featured"],
        "required": ["bucket", "album", "image", "alt"],
        "lists": [],
        "bools": ["featured"],
        "ints": [],
        "has_body": False,
        "image_dir": "assets/images/gallery",
    },
}

_FM_RE = re.compile(r"^---\s*\n(.*?)\n---\s*\n?(.*)$", re.S)


class ContentError(Exception):
    """Raised for bad input (missing required fields, unknown id, etc.)."""


def _schema(kind: str) -> dict[str, Any]:
    if kind not in SCHEMAS:
        raise ContentError(f"unknown content kind: {kind}")
    return SCHEMAS[kind]


def _dir(kind: str) -> Path:
    d = REPO_ROOT / _schema(kind)["dir"]
    d.mkdir(parents=True, exist_ok=True)
    return d


def parse(text: str) -> tuple[dict, str]:
    m = _FM_RE.match(text)
    if not m:
        return {}, text
    meta = yaml.safe_load(m.group(1)) or {}
    return meta, m.group(2).lstrip("\n")


def _serialize(meta: dict, body: str, has_body: bool) -> str:
    y = yaml.safe_dump(meta, sort_keys=False, allow_unicode=True, default_flow_style=False).strip()
    out = f"---\n{y}\n---\n"
    if has_body and body.strip():
        out += "\n" + body.strip() + "\n"
    return out


def _coerce(kind: str, raw: dict) -> dict:
    """Turn form strings into typed frontmatter values, in schema order."""
    s = _schema(kind)
    meta: dict[str, Any] = {}
    for key in s["order"]:
        if key not in raw:
            continue
        val = raw[key]
        if key in s.get("json", []):
            # Already-structured value (e.g. the project gallery list). The
            # frontend sends it as a JSON string; pass the parsed value to YAML.
            if isinstance(val, str):
                try:
                    val = json.loads(val) if val.strip() else []
                except json.JSONDecodeError:
                    val = []
            if val:
                meta[key] = val
        elif key in s["lists"]:
            if isinstance(val, list):
                items = [str(x).strip() for x in val if str(x).strip()]
            else:
                items = [p.strip() for p in re.split(r"[\n,]", str(val)) if p.strip()]
            if items:
                meta[key] = items
        elif key in s["bools"]:
            meta[key] = bool(val) if isinstance(val, bool) else str(val).lower() in ("1", "true", "yes", "on")
        elif key in s["ints"]:
            if str(val).strip():
                meta[key] = int(val)
        elif key == "date":
            meta[key] = _as_date_str(val)
        else:
            if str(val).strip():
                meta[key] = str(val).strip()
    return meta


def _as_date_str(val: Any) -> str:
    if isinstance(val, (_date,)):
        return val.isoformat()
    s = str(val).strip()
    return s[:10] if s else _date.today().isoformat()


def _filename(kind: str, meta: dict, existing: str | None) -> str:
    """Compute the .md filename. On edit, keep the existing name stable."""
    if existing:
        return existing
    if kind == "posts":
        d = _as_date_str(meta.get("date"))
        base = slugify(meta.get("title", "")) or "post"
        return f"{d}-{base}.md"
    if kind == "projects":
        base = slugify(meta.get("title", "")) or "project"
        return f"{base}.md"
    if kind == "experiences":
        base = slugify(meta.get("company", "")) or "role"
        return f"{base}.md"
    # gallery: title -> alt -> image stem
    base = slugify(meta.get("title", "")) or slugify(meta.get("alt", ""))
    if not base and meta.get("image"):
        base = slugify(Path(meta["image"]).stem)
    return f"{base or 'photo'}.md"


def _unique(directory: Path, name: str) -> str:
    if not (directory / name).exists():
        return name
    stem, ext = name[:-3], ".md"
    i = 2
    while (directory / f"{stem}-{i}{ext}").exists():
        i += 1
    return f"{stem}-{i}{ext}"


# --- Public API ------------------------------------------------------------
def list_items(kind: str) -> list[dict]:
    s = _schema(kind)
    out = []
    for p in sorted(_dir(kind).glob("*.md")):
        meta, _ = parse(p.read_text(encoding="utf-8"))
        out.append({
            "id": p.name,
            "title": meta.get("company") or meta.get("title") or meta.get("alt") or p.stem,
            "date": str(meta.get("date", "")),
            "image": meta.get("thumb") or meta.get("image") or meta.get("logo") or "",
            "bucket": meta.get("bucket", ""),
            "album": meta.get("album") or meta.get("type", ""),
            "featured": bool(meta.get("featured", False)),
        })
    out.sort(key=lambda x: x["date"], reverse=True)
    return out


def list_albums() -> list[dict]:
    """Distinct gallery albums (folders) with their bucket — powers the Studio
    album autocomplete so existing folders are reusable and new ones are just
    a matter of typing a new name."""
    seen: dict[str, str] = {}
    for p in sorted(_dir("gallery").glob("*.md")):
        meta, _ = parse(p.read_text(encoding="utf-8"))
        album = str(meta.get("album", "")).strip()
        if album and album not in seen:
            seen[album] = str(meta.get("bucket", "")).strip()
    return [{"album": a, "bucket": b} for a, b in sorted(seen.items())]


def get_item(kind: str, item_id: str) -> dict:
    path = _dir(kind) / _safe_id(item_id)
    if not path.exists():
        raise ContentError(f"not found: {item_id}")
    meta, body = parse(path.read_text(encoding="utf-8"))
    return {"id": path.name, "meta": _json_safe(meta), "body": body}


def _json_safe(meta: dict) -> dict:
    """YAML turns unquoted dates into date objects; stringify them so the form
    (and JSON) get a plain 'YYYY-MM-DD' the date input can use."""
    out = {}
    for k, v in meta.items():
        out[k] = v.strftime("%Y-%m-%d") if isinstance(v, _date) else v
    return out


def save_item(kind: str, item_id: str | None, raw: dict, body: str = "") -> str:
    s = _schema(kind)
    meta = _coerce(kind, raw)
    missing = [f for f in s["required"] if f not in meta or meta[f] in ("", [], None)]
    if missing:
        raise ContentError("missing required: " + ", ".join(missing))
    if kind == "projects" and not (meta.get("repo") or meta.get("demo")):
        raise ContentError("projects need at least one of repo or demo")

    directory = _dir(kind)
    name = _filename(kind, meta, _safe_id(item_id) if item_id else None)
    if not item_id:
        name = _unique(directory, name)
    (directory / name).write_text(_serialize(meta, body, s["has_body"]), encoding="utf-8")
    return name


def delete_item(kind: str, item_id: str, drop_images: bool = False) -> None:
    path = _dir(kind) / _safe_id(item_id)
    if not path.exists():
        raise ContentError(f"not found: {item_id}")
    if drop_images and kind == "gallery":
        meta, _ = parse(path.read_text(encoding="utf-8"))
        for key in ("image", "thumb"):
            rel = str(meta.get(key, "")).lstrip("/")
            # Only ever delete inside the gallery image tree — never elsewhere.
            if rel.startswith("assets/images/gallery/"):
                f = REPO_ROOT / rel
                if f.exists():
                    f.unlink()
    path.unlink()


def _safe_id(item_id: str) -> str:
    """Prevent path traversal — ids are bare filenames only."""
    name = Path(item_id).name
    if name != item_id or "/" in item_id or "\\" in item_id:
        raise ContentError(f"invalid id: {item_id}")
    return name
