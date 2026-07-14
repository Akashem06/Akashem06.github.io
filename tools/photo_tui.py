#!/usr/bin/env python3
"""Terminal UI for importing photos into the gallery.

Runs anywhere a terminal does (Windows / WSL / Linux / macOS / SSH) — no display
server needed. Wraps the same engine as photo_tool.py.

    pip install -r tools/requirements.txt
    python tools/photo_tui.py
"""
from __future__ import annotations

import sys
from pathlib import Path

try:
    from textual.app import App, ComposeResult
    from textual.containers import Horizontal, Vertical, VerticalScroll
    from textual.widgets import (
        Button, Footer, Header, Input, Label, ProgressBar, RichLog, Select,
    )
except ImportError:
    sys.exit("Textual is required. Run:  pip install -r tools/requirements.txt")

from photo_tool import VALID_BUCKETS, import_folder, slugify


class PhotoImportApp(App):
    """Fill in the fields, press Import, watch the progress bar."""

    CSS = """
    Screen { layout: horizontal; }
    #form { width: 46; padding: 1 2; border-right: solid $primary; }
    #form Label { margin-top: 1; color: $text-muted; }
    #right { padding: 1 2; }
    #log { height: 1fr; border: round $primary; padding: 0 1; }
    ProgressBar { margin: 1 0; }
    Button { margin-top: 1; width: 100%; }
    """
    BINDINGS = [("ctrl+q", "quit", "Quit")]

    def compose(self) -> ComposeResult:
        yield Header(show_clock=False)
        with VerticalScroll(id="form"):
            yield Label("Source folder (paste full path)")
            yield Input(placeholder="/mnt/c/Users/.../photos", id="source")
            yield Label("Album slug")
            yield Input(placeholder="iceland", id="album")
            yield Label("Bucket")
            yield Select(
                [(b.title(), b) for b in VALID_BUCKETS],
                value="photography", allow_blank=False, id="bucket",
            )
            yield Label("Location (optional)")
            yield Input(placeholder="Reykjavik, Iceland", id="location")
            yield Label("Exclude filenames (regex, optional)")
            yield Input(placeholder="Inez|Aryan|Jenna", id="exclude")
            yield Button("Import photos", variant="primary", id="run")
        with Vertical(id="right"):
            yield Label("Progress")
            yield ProgressBar(total=100, show_eta=False, id="bar")
            yield RichLog(id="log", highlight=True, markup=True)
        yield Footer()

    def on_mount(self) -> None:
        self.query_one("#log", RichLog).write(
            "[dim]Fill in the form and press Import. Originals are never modified.[/]"
        )

    def on_button_pressed(self, event: Button.Pressed) -> None:
        if event.button.id != "run":
            return
        source = self.query_one("#source", Input).value.strip()
        album = self.query_one("#album", Input).value.strip()
        location = self.query_one("#location", Input).value.strip()
        exclude = self.query_one("#exclude", Input).value.strip()
        bucket = self.query_one("#bucket", Select).value
        log = self.query_one("#log", RichLog)

        src_path = Path(source).expanduser()
        if not source or not src_path.is_dir():
            log.write(f"[red]Source folder not found:[/] {source or '(empty)'}")
            return
        if not slugify(album):
            log.write("[red]Album slug is required[/] (e.g. 'iceland').")
            return

        self.query_one("#run", Button).disabled = True
        log.write(f"[cyan]Importing from[/] {src_path} [cyan]as[/] '{slugify(album)}'…")
        self._run_import(src_path, album, bucket, location, exclude)

    # --- background work ---------------------------------------------------
    def _run_import(self, src_path, album, bucket, location, exclude) -> None:
        # Pillow work is blocking/CPU-bound — run it off the UI thread.
        self.run_worker(
            lambda: self._worker(src_path, album, bucket, location, exclude),
            thread=True,
            exclusive=True,
        )

    def _worker(self, src_path, album, bucket, location, exclude) -> None:
        log = self.query_one("#log", RichLog)
        bar = self.query_one("#bar", ProgressBar)

        def on_log(msg: str) -> None:
            self.call_from_thread(log.write, msg)

        def on_progress(done: int, total: int) -> None:
            self.call_from_thread(bar.update, total=total, progress=done)

        try:
            res = import_folder(
                src_path, album, bucket, location, exclude,
                log=on_log, progress=on_progress,
            )
            self.call_from_thread(self._done, res)
        except Exception as exc:  # noqa: BLE001 - surface to the log
            self.call_from_thread(log.write, f"[red]Error:[/] {exc}")
            self.call_from_thread(self._reenable)

    def _done(self, res) -> None:
        log = self.query_one("#log", RichLog)
        log.write(f"[green]Imported {res.imported} photos[/] into _galleries.")
        if res.skipped:
            log.write(f"[yellow]{res.skipped} skipped[/] (see messages above).")
        if res.oversized:
            log.write(
                f"[yellow]{res.oversized} image(s) over 400KB[/] "
                f"(largest {res.largest_kb} KB) — CI warns, won't fail."
            )
        log.write("[cyan]Refine the alt text in the new files, then commit.[/]")
        self._reenable()

    def _reenable(self) -> None:
        self.query_one("#run", Button).disabled = False


if __name__ == "__main__":
    PhotoImportApp().run()
