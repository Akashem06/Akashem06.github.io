/* Collage filtering for a bucket gallery page (photography / art).
   You land on the whole collage; this narrows it in place by album chip + live
   search — no folders, no reload, no image refetch, just toggling `.is-hidden`.
   lightbox.js reads the *visible* thumbnails, so the viewer automatically follows
   whatever the chips/search have narrowed the grid to. */
(function () {
  "use strict";

  var page = document.querySelector(".gallery-page");
  if (!page) return;

  var chips = document.getElementById("gallery-chips");
  var search = document.getElementById("gallery-search");
  var gallery = document.getElementById("gallery");
  var empty = document.getElementById("gallery-empty");
  var countEl = document.getElementById("gallery-count");
  if (!gallery) return;

  var items = Array.prototype.slice.call(gallery.querySelectorAll(".masonry__item"));
  var album = "all"; // active chip

  // --- Windowing -------------------------------------------------------------
  // Only the first WINDOW matched items are laid out; the rest are dropped from
  // flow (.is-beyond) so the CSS-column grid stays cheap no matter how many
  // photos exist. A sentinel below the grid reveals BATCH more as you scroll.
  // `matched` is the full count that passes the current filter (what the counter
  // shows); `limit` is how many of those we currently render. Lazy-loading means
  // even rendered-but-off-screen thumbs don't fetch until near the viewport.
  var WINDOW = 80;
  var BATCH = 60;
  var limit = WINDOW;
  var matched = 0;

  // Re-run the filter for the current chip + search term, updating the count.
  function apply() {
    var q = search ? search.value.trim().toLowerCase() : "";
    var shown = 0; // how many matches we've actually rendered (<= limit)
    matched = 0;
    items.forEach(function (item) {
      var okAlbum = album === "all" || item.dataset.album === album;
      var okSearch = !q || (item.dataset.search || "").toLowerCase().indexOf(q) !== -1;
      var vis = okAlbum && okSearch;
      item.classList.toggle("is-hidden", !vis);
      if (vis) {
        matched++;
        var within = shown < limit;
        item.classList.toggle("is-beyond", !within);
        if (within) shown++;
      } else {
        item.classList.remove("is-beyond");
      }
    });
    if (empty) empty.hidden = matched !== 0;
    if (countEl) {
      var noun = countEl.dataset.noun || "item";
      countEl.textContent = matched + " " + noun + (matched === 1 ? "" : "s");
    }
    syncSentinel();
  }

  // Reveal the next batch when the sentinel scrolls into view (and there's more).
  var sentinel = document.createElement("div");
  sentinel.className = "gallery-sentinel";
  sentinel.setAttribute("aria-hidden", "true");
  gallery.parentNode.insertBefore(sentinel, gallery.nextSibling);

  function revealMore() {
    if (limit >= matched) return;
    limit += BATCH;
    apply();
  }
  function syncSentinel() {
    // Nothing left to reveal → hide the sentinel so the observer idles.
    sentinel.style.display = limit >= matched ? "none" : "block";
  }
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(
      function (entries) {
        if (entries[0].isIntersecting) revealMore();
      },
      { rootMargin: "800px 0px" } // start a batch before it's actually visible
    );
    io.observe(sentinel);
  } else {
    // No IO support: just render everything (older browsers, graceful fallback).
    limit = Infinity;
  }

  function setAlbum(slug) {
    album = slug || "all";
    limit = WINDOW; // reset the window whenever the filter changes
    if (chips) {
      Array.prototype.forEach.call(chips.querySelectorAll(".gchip"), function (c) {
        c.classList.toggle("is-active", c.dataset.album === album);
      });
    }
    apply();
  }

  // --- Album chips -----------------------------------------------------------
  if (chips) {
    chips.addEventListener("click", function (e) {
      var chip = e.target.closest(".gchip");
      if (!chip) return;
      setAlbum(chip.dataset.album);
      var hash = album === "all" ? "" : "#" + album;
      if (history.replaceState) {
        history.replaceState(null, "", location.pathname + location.search + hash);
      }
    });
  }

  // --- Search (across every album in this bucket) ----------------------------
  if (search)
    search.addEventListener("input", function () {
      limit = WINDOW; // a new query resets the render window to the top
      apply();
    });

  // --- Deep link: /photography/#san-francisco pre-selects that album ---------
  function openFromHash() {
    var slug = (location.hash || "").replace(/^#/, "");
    if (!slug || !chips) return;
    var chip = chips.querySelector('.gchip[data-album="' + slug + '"]');
    if (chip) setAlbum(slug);
  }
  openFromHash();
  apply();
})();
