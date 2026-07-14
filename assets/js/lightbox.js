/* Accessible gallery lightbox. Loaded only on gallery pages (via the gallery layout).
   Open/close, prev/next, keyboard (←/→/Esc, +/−/0), focus trap + restore.
   Zoom & pan: toolbar buttons, wheel, double-click, drag-to-pan, pinch (Pointer Events).
   The viewer drives — no autoplay (docs/03). Slides are the *visible* thumbnails,
   so it follows whatever folder/search gallery.js has narrowed the grid to. */
(function () {
  "use strict";

  var lightbox = document.getElementById("lightbox");
  var gallery = document.getElementById("gallery");
  if (!lightbox || !gallery) return;

  var imgEl = document.getElementById("lightbox-img");
  var stageEl = document.getElementById("lightbox-stage");
  var captionEl = document.getElementById("lightbox-caption");
  var counterEl = document.getElementById("lightbox-counter");
  var zoomLevelEl = document.getElementById("lightbox-zoom-level");
  var downloadEl = document.getElementById("lightbox-download");

  // Build the slide list from the *visible* thumbnails (skips items hidden by
  // the current folder filter / search), preserving DOM order.
  function slides() {
    return Array.prototype.filter.call(
      gallery.querySelectorAll(".thumb"),
      function (thumb) {
        var item = thumb.closest(".masonry__item");
        return !item || !item.classList.contains("is-hidden");
      }
    );
  }

  var index = -1;
  var lastFocused = null;

  /* ---- Zoom / pan state -------------------------------------------------- */
  var MIN = 1;
  var MAX = 4;
  var STEP = 1.4;
  var scale = 1;
  var tx = 0;
  var ty = 0;

  function applyTransform() {
    imgEl.style.transform =
      "translate(" + tx + "px," + ty + "px) scale(" + scale + ")";
  }

  // Keep the image from drifting off the stage: bound the translation to the
  // overflow created by scaling (offset* is the layout size at scale 1).
  function clampPan() {
    var overflowX = (imgEl.offsetWidth * scale - stageEl.clientWidth) / 2;
    var overflowY = (imgEl.offsetHeight * scale - stageEl.clientHeight) / 2;
    overflowX = Math.max(0, overflowX);
    overflowY = Math.max(0, overflowY);
    tx = Math.min(overflowX, Math.max(-overflowX, tx));
    ty = Math.min(overflowY, Math.max(-overflowY, ty));
  }

  function updateZoomUI() {
    if (zoomLevelEl) zoomLevelEl.textContent = Math.round(scale * 100) + "%";
    imgEl.classList.toggle("is-zoomed", scale > 1.001);
    imgEl.classList.toggle("is-zoomable", scale <= 1.001);
  }

  // Zoom to newScale while keeping the point (mx,my) — measured relative to the
  // stage centre — visually fixed. mx=my=0 zooms about the centre (buttons/keys).
  function zoomAt(newScale, mx, my) {
    newScale = Math.min(MAX, Math.max(MIN, newScale));
    if (newScale === scale) return;
    var ratio = newScale / scale;
    tx = mx - (mx - tx) * ratio;
    ty = my - (my - ty) * ratio;
    scale = newScale;
    clampPan();
    applyTransform();
    updateZoomUI();
  }

  function resetZoom() {
    scale = 1;
    tx = 0;
    ty = 0;
    applyTransform();
    updateZoomUI();
  }

  // Convert a client point to coords relative to the stage centre.
  function relToCentre(clientX, clientY) {
    var r = stageEl.getBoundingClientRect();
    return {
      x: clientX - (r.left + r.width / 2),
      y: clientY - (r.top + r.height / 2),
    };
  }

  function show(i) {
    var list = slides();
    if (!list.length) return;
    index = (i + list.length) % list.length;
    var trigger = list[index];
    var src = trigger.getAttribute("href");
    imgEl.setAttribute("src", src);
    captionEl.textContent = trigger.getAttribute("data-caption") || "";
    if (counterEl) counterEl.textContent = index + 1 + " / " + list.length;
    // Mirror the thumbnail's alt onto the full image for screen readers.
    var thumbImg = trigger.querySelector("img");
    imgEl.setAttribute("alt", thumbImg ? thumbImg.getAttribute("alt") || "" : "");
    // Point the download control at the real file.
    if (downloadEl) {
      downloadEl.setAttribute("href", src);
      downloadEl.setAttribute("download", src.split("/").pop() || "image.jpg");
    }
    resetZoom();
  }

  function open(i, triggerEl) {
    lastFocused = triggerEl || document.activeElement;
    lightbox.classList.add("is-open");
    lightbox.removeAttribute("hidden");
    document.body.classList.add("no-scroll");
    show(i);
    // Focus the close button so Esc/Tab have a sane starting point.
    var closeBtn = lightbox.querySelector(".lightbox__close");
    if (closeBtn) closeBtn.focus();
    document.addEventListener("keydown", onKeydown);
  }

  function close() {
    lightbox.classList.remove("is-open");
    lightbox.setAttribute("hidden", "");
    document.body.classList.remove("no-scroll");
    document.removeEventListener("keydown", onKeydown);
    index = -1;
    resetZoom();
    if (lastFocused && typeof lastFocused.focus === "function") lastFocused.focus();
  }

  function next() { show(index + 1); }
  function prev() { show(index - 1); }

  function onKeydown(e) {
    switch (e.key) {
      case "Escape":
        close();
        break;
      case "ArrowRight":
        next();
        break;
      case "ArrowLeft":
        prev();
        break;
      case "+":
      case "=":
        zoomAt(scale * STEP, 0, 0);
        break;
      case "-":
      case "_":
        zoomAt(scale / STEP, 0, 0);
        break;
      case "0":
        resetZoom();
        break;
      case "Tab":
        trapFocus(e);
        break;
    }
  }

  // Keep focus inside the dialog while it's open (buttons + the download link).
  function trapFocus(e) {
    var focusable = lightbox.querySelectorAll("button:not([disabled]), a[href]");
    if (!focusable.length) return;
    var first = focusable[0];
    var last = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }

  // Open from a thumbnail click.
  gallery.addEventListener("click", function (e) {
    var thumb = e.target.closest(".thumb");
    if (!thumb) return;
    e.preventDefault();
    var list = slides();
    open(list.indexOf(thumb), thumb);
  });

  // Control buttons (event-delegated). The download <a> is left to act natively.
  lightbox.addEventListener("click", function (e) {
    if (e.target.closest("[data-lightbox-close]")) close();
    else if (e.target.closest("[data-lightbox-next]")) next();
    else if (e.target.closest("[data-lightbox-prev]")) prev();
    else if (e.target.closest("[data-lightbox-zoom-in]")) zoomAt(scale * STEP, 0, 0);
    else if (e.target.closest("[data-lightbox-zoom-out]")) zoomAt(scale / STEP, 0, 0);
    else if (e.target.closest("[data-lightbox-zoom-reset]")) resetZoom();
  });

  /* ---- Wheel + double-click zoom (desktop) ------------------------------- */
  stageEl.addEventListener(
    "wheel",
    function (e) {
      e.preventDefault();
      var m = relToCentre(e.clientX, e.clientY);
      zoomAt(scale * (e.deltaY < 0 ? 1.15 : 1 / 1.15), m.x, m.y);
    },
    { passive: false }
  );
  stageEl.addEventListener("dblclick", function (e) {
    e.preventDefault();
    if (scale > 1.001) {
      resetZoom();
    } else {
      var m = relToCentre(e.clientX, e.clientY);
      zoomAt(2.5, m.x, m.y);
    }
  });

  /* ---- Pointer drag + pinch + (when not zoomed) swipe-to-navigate -------- */
  var pointers = new Map();
  var panStart = null; // { x, y, tx, ty } for single-pointer pan/swipe
  var pinch = null; // { dist, startScale, lastMidX, lastMidY }

  function pointerDist() {
    var pts = Array.from(pointers.values());
    return Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
  }
  function pointerMid() {
    var pts = Array.from(pointers.values());
    return { x: (pts[0].x + pts[1].x) / 2, y: (pts[0].y + pts[1].y) / 2 };
  }

  stageEl.addEventListener("pointerdown", function (e) {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    stageEl.setPointerCapture(e.pointerId);
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.size === 2) {
      var mid = pointerMid();
      pinch = {
        dist: pointerDist(),
        startScale: scale,
        lastMidX: mid.x,
        lastMidY: mid.y,
      };
      panStart = null;
    } else if (pointers.size === 1) {
      panStart = { x: e.clientX, y: e.clientY, tx: tx, ty: ty };
    }
  });

  stageEl.addEventListener("pointermove", function (e) {
    if (!pointers.has(e.pointerId)) return;
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (pointers.size === 2 && pinch) {
      var mid = pointerMid();
      var m = relToCentre(mid.x, mid.y);
      zoomAt(pinch.startScale * (pointerDist() / pinch.dist), m.x, m.y);
      // Let the image follow the fingers' midpoint while pinching.
      tx += mid.x - pinch.lastMidX;
      ty += mid.y - pinch.lastMidY;
      pinch.lastMidX = mid.x;
      pinch.lastMidY = mid.y;
      clampPan();
      applyTransform();
      return;
    }

    if (pointers.size === 1 && panStart && scale > 1.001) {
      // Pan the zoomed image (not zoomed → leave it; swipe resolves on pointerup).
      lightbox.classList.add("is-panning");
      tx = panStart.tx + (e.clientX - panStart.x);
      ty = panStart.ty + (e.clientY - panStart.y);
      clampPan();
      applyTransform();
    }
  });

  function endPointer(e) {
    if (!pointers.has(e.pointerId)) return;
    var wasSingle = pointers.size === 1;
    pointers.delete(e.pointerId);
    lightbox.classList.remove("is-panning");

    if (wasSingle && panStart) {
      // Swipe to navigate — only when not zoomed, so pan/nav never fight.
      if (scale <= 1.001) {
        var dx = e.clientX - panStart.x;
        var dy = e.clientY - panStart.y;
        if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) {
          dx < 0 ? next() : prev();
        }
      }
      panStart = null;
    }

    if (pointers.size === 1) {
      // Dropped from pinch back to one finger — resume panning cleanly.
      pinch = null;
      var remaining = Array.from(pointers.entries())[0];
      panStart = { x: remaining[1].x, y: remaining[1].y, tx: tx, ty: ty };
    } else if (pointers.size === 0) {
      pinch = null;
    }
  }
  stageEl.addEventListener("pointerup", endPointer);
  stageEl.addEventListener("pointercancel", endPointer);
})();
