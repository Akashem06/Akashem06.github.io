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

  // Re-run the filter for the current chip + search term, updating the count.
  function apply() {
    var q = search ? search.value.trim().toLowerCase() : "";
    var shown = 0;
    items.forEach(function (item) {
      var okAlbum = album === "all" || item.dataset.album === album;
      var okSearch = !q || (item.dataset.search || "").toLowerCase().indexOf(q) !== -1;
      var vis = okAlbum && okSearch;
      item.classList.toggle("is-hidden", !vis);
      if (vis) shown++;
    });
    if (empty) empty.hidden = shown !== 0;
    if (countEl) {
      var noun = countEl.dataset.noun || "item";
      countEl.textContent = shown + " " + noun + (shown === 1 ? "" : "s");
    }
  }

  function setAlbum(slug) {
    album = slug || "all";
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
  if (search) search.addEventListener("input", apply);

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
