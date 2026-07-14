#!/usr/bin/env python3
"""Optimize a folder of photos and import them as Jekyll gallery items.

Cross-platform (Windows / WSL / Linux / macOS) — the one job a CMS can't do:
shrink images to web sizes (<400KB) so the gallery can grow without bloating
the repo. Originals are never modified. See docs/04-authoring.md.

Use the CLI here, or the friendlier terminal UI in photo_tui.py (same engine).

    python tools/photo_tool.py --source "/path/to/photos" --album iceland \
        --bucket photography --location "Iceland" --exclude "Inez|Aryan"
"""
from __future__ import annotations

import argparse
import re
import sys
from datetime import datetime
from pathlib import Path
from typing import Callable, Iterable, NamedTuple

# Repo root = parent of the tools/ directory this file lives in.
REPO_ROOT = Path(__file__).resolve().parent.parent

VALID_BUCKETS = ("photography", "art")
IMG_EXTS = {".jpg", ".jpeg", ".png", ".webp", ".tif", ".tiff"}


class Result(NamedTuple):
    imported: int
    skipped: int
    oversized: int          # files still > 400KB after optimizing (CI warns, won't fail)
    largest_kb: int


def slugify(text: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", text.lower()).strip("-")


def titleize(base: str) -> str:
    """Turn a filename stem into a readable caption.

    'OceanBeachSunset (1)' -> 'Ocean Beach Sunset 1'
    """
    num = ""
    m = re.search(r"\((\d+)\)\s*$", base)
    if m:
        num = m.group(1)
        base = re.sub(r"\(\d+\)\s*$", "", base)
    s = re.sub(r"(?<=[a-z0-9])(?=[A-Z])", " ", base.strip())
    s = re.sub(r"(?<=[A-Z])(?=[A-Z][a-z])", " ", s)
    s = re.sub(r"[_\-]+", " ", s)
    s = re.sub(r"\s+", " ", s).strip()
    return f"{s} {num}".strip() if num else s


def optimize(src: Path, dst: Path, max_edge: int, quality: int) -> int:
    """Resize (never upscale), auto-rotate by EXIF, strip metadata, save JPEG.

    Stripping EXIF also removes any embedded GPS coordinates — a privacy win.
    Returns the output size in bytes.
    """
    try:
        from PIL import Image, ImageOps
    except ImportError:  # pragma: no cover - guidance for first run
        raise SystemExit("Pillow is required. Run:  pip install -r tools/requirements.txt")

    dst.parent.mkdir(parents=True, exist_ok=True)
    with Image.open(src) as im:
        im = ImageOps.exif_transpose(im)            # bake in orientation
        if im.mode not in ("RGB", "L"):
            im = im.convert("RGB")
        im.thumbnail((max_edge, max_edge), Image.LANCZOS)   # keeps aspect, no upscale
        im.save(dst, "JPEG", quality=quality, optimize=True, progressive=True)
    return dst.stat().st_size


def iter_images(source: Path, exclude: str) -> Iterable[Path]:
    pattern = re.compile(exclude, re.IGNORECASE) if exclude else None
    for p in sorted(source.rglob("*")):
        if p.is_file() and p.suffix.lower() in IMG_EXTS:
            if pattern and pattern.search(p.name):
                continue
            yield p


def import_folder(
    source: Path,
    album: str,
    bucket: str,
    location: str = "",
    exclude: str = "",
    *,
    max_edge: int = 2560,
    thumb_edge: int = 600,
    quality: int = 82,
    repo_root: Path = REPO_ROOT,
    log: Callable[[str], None] = print,
    progress: Callable[[int, int], None] | None = None,
) -> Result:
    """Optimize every image in `source` and write one gallery .md per photo.

    `album` is a short slug (used for the image folder and filenames); its
    human-readable form is written as the gallery folder name in frontmatter.
    `bucket` is the top-level section the album lives under (photography / art).
    """
    if bucket not in VALID_BUCKETS:
        raise ValueError(f"bucket must be one of {VALID_BUCKETS}, got {bucket!r}")

    album_name = titleize(album)  # human-readable folder name (keeps capitalization)
    album = slugify(album)        # slug for the image folder + filenames
    if not album:
        raise ValueError("album must contain at least one alphanumeric character")

    out_full = repo_root / "assets" / "images" / "gallery" / album
    out_thumb = out_full / "thumb"
    gal_dir = repo_root / "_galleries"
    gal_dir.mkdir(parents=True, exist_ok=True)

    files = list(iter_images(source, exclude))
    total = len(files)
    if total == 0:
        log("No matching images found.")
        return Result(0, 0, 0, 0)

    imported = skipped = oversized = largest = 0
    for i, src in enumerate(files, 1):
        try:
            stem = src.stem
            slug = slugify(stem)
            full_bytes = optimize(src, out_full / f"{slug}.jpg", max_edge, quality)
            optimize(src, out_thumb / f"{slug}.jpg", thumb_edge, max(70, quality - 2))

            largest = max(largest, full_bytes)
            if full_bytes > 400 * 1024:
                oversized += 1

            title = titleize(stem)
            alt = f"{title} - {location}" if location else title
            loc_line = f'location: "{location}"\n' if location else ""
            date = datetime.fromtimestamp(src.stat().st_mtime).strftime("%Y-%m-%d")
            md = (
                "---\n"
                f"bucket: {bucket}\n"
                f"album: {album_name}\n"
                f'title: "{title.replace(chr(34), chr(39))}"\n'
                f"image: /assets/images/gallery/{album}/{slug}.jpg\n"
                f"thumb: /assets/images/gallery/{album}/thumb/{slug}.jpg\n"
                f'alt: "{alt.replace(chr(34), chr(39))}"\n'
                f"{loc_line}"
                f"date: {date}\n"
                "featured: false\n"
                "---\n"
            )
            (gal_dir / f"{album}-{slug}.md").write_text(md, encoding="utf-8")
            imported += 1
        except Exception as exc:  # noqa: BLE001 - keep going, report at end
            log(f"  skipped {src.name}: {exc}")
            skipped += 1
        if progress:
            progress(i, total)

    return Result(imported, skipped, oversized, round(largest / 1024))


def _build_parser() -> argparse.ArgumentParser:
    p = argparse.ArgumentParser(description="Optimize photos and import them as gallery items.")
    p.add_argument("--source", required=True, type=Path, help="Folder of original images")
    p.add_argument("--album", required=True, help="Short album/folder slug, e.g. 'iceland'")
    p.add_argument("--bucket", default="photography", choices=VALID_BUCKETS)
    p.add_argument("--location", default="", help='e.g. "Reykjavik, Iceland"')
    p.add_argument("--exclude", default="", help="Regex of filenames to skip, e.g. 'Inez|Jenna'")
    p.add_argument("--max-edge", type=int, default=2560)
    p.add_argument("--thumb-edge", type=int, default=600)
    p.add_argument("--quality", type=int, default=82)
    return p


def main(argv: list[str] | None = None) -> int:
    args = _build_parser().parse_args(argv)
    if not args.source.is_dir():
        print(f"Source folder not found: {args.source}", file=sys.stderr)
        return 2

    def progress(done: int, total: int) -> None:
        print(f"\r  {done}/{total}", end="", flush=True)

    res = import_folder(
        args.source, args.album, args.bucket, args.location, args.exclude,
        max_edge=args.max_edge, thumb_edge=args.thumb_edge, quality=args.quality,
        progress=progress,
    )
    print()
    print(f"Imported {res.imported} photos into _galleries (album '{slugify(args.album)}', bucket '{args.bucket}').")
    if res.skipped:
        print(f"{res.skipped} skipped (see messages above).")
    if res.oversized:
        print(f"{res.oversized} image(s) over 400KB (largest {res.largest_kb} KB) — CI warns, won't fail.")
    print("Review the new _galleries/*.md files, refine alt text, then commit.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
