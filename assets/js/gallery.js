/* Sectioned bucket gallery (photography / art). The collage is split into one
   section per album, newest trip first. Each section renders only its first row
   or so of photos as real nodes; the rest ride inside an inert <template> and are
   "hydrated" (cloned into the grid) the moment the visitor hits "See all" or
   searches — so first load only pays for what's on screen. A sticky rail jumps
   between albums (with scroll-spy); one search box filters across every album at
   once. lightbox.js reads the *visible* thumbnails, so the viewer always follows
   whatever is on screen (current section state + search). */
(function () {
  "use strict";

  var page = document.querySelector(".gallery-page");
  if (!page) return;

  var gallery = document.getElementById("gallery");
  if (!gallery) return;
  var search = document.getElementById("gallery-search");
  var empty = document.getElementById("gallery-empty");
  var countEl = document.getElementById("gallery-count");
  var rail = document.getElementById("gallery-rail");

  // Model each album section: grid, live items, the <template> of deferred items
  // (null once hydrated), "See all" button, expand state.
  var sections = Array.prototype.slice.call(gallery.querySelectorAll(".gsection")).map(function (el) {
    var tmpl = el.querySelector("template.ggrid-rest");
    return {
      el: el,
      grid: el.querySelector(".ggrid"),
      items: Array.prototype.slice.call(el.querySelectorAll(".ggrid__item")),
      tmpl: tmpl,
      hydrated: !tmpl, // sections with no overflow are fully live already
      btn: el.querySelector(".gsection__all"),
      expanded: false
    };
  });

  var lastCols = 0;

  // Clone a section's deferred items into its grid (once). Idempotent.
  function hydrate(s) {
    if (s.hydrated) return;
    if (s.tmpl) {
      s.grid.appendChild(s.tmpl.content); // moves the fragment's children in
      if (s.tmpl.parentNode) s.tmpl.parentNode.removeChild(s.tmpl);
      s.tmpl = null;
    }
    s.hydrated = true;
    s.items = Array.prototype.slice.call(s.grid.querySelectorAll(".ggrid__item"));
  }

  // How many columns the grid currently has. Every grid shares one CSS template
  // at the same width, so we measure ONE on-screen reference (the first section,
  // always at the top → laid out even with content-visibility) and reuse it for
  // all sections — instead of forcing a reflow per section.
  function measureCols() {
    var ref = sections[0] && sections[0].grid;
    if (!ref) return 1;
    var tpl = getComputedStyle(ref).getPropertyValue("grid-template-columns");
    if (!tpl || tpl === "none") return lastCols || 1;
    var n = tpl.trim().split(/\s+/).length;
    return n > 0 ? n : 1;
  }

  // Re-evaluate what's visible for the current search term + per-section state.
  function render() {
    var q = search ? search.value.trim().toLowerCase() : "";
    // Searching needs every photo to be a real node, so hydrate on first query.
    if (q) sections.forEach(function (s) { if (!s.hydrated) hydrate(s); });

    var cols = measureCols(); // one row = this many items (search ignores it)
    lastCols = cols;
    var total = 0;
    sections.forEach(function (s) {
      // Ultrawide safety: if one row is wider than what we rendered live, pull the
      // rest in so the first row always fills.
      if (!q && s.tmpl && !s.hydrated && cols > s.items.length) hydrate(s);
      var matched = 0;
      s.items.forEach(function (item) {
        var matches = !q || (item.dataset.search || "").toLowerCase().indexOf(q) !== -1;
        // Searching → show every match; collapsed → just the first row; expanded → all.
        var vis = matches && (q ? true : s.expanded || matched < cols);
        item.classList.toggle("is-hidden", !vis);
        if (matches) matched++;
      });
      total += matched;
      // While searching, drop a whole section if nothing in it matches.
      s.el.hidden = q !== "" && matched === 0;
      var hasMore = matched > cols; // more than one row to reveal
      // "See all" only when collapsed AND there's a second row to show.
      if (s.btn) s.btn.style.display = !q && !s.expanded && hasMore ? "" : "none";
      // Fade the row only while it's hiding more behind "See all".
      if (s.grid) s.grid.classList.toggle("is-faded", !q && !s.expanded && hasMore);
    });
    if (empty) empty.hidden = total !== 0;
    if (countEl) {
      var noun = countEl.dataset.noun || "item";
      countEl.textContent = total + " " + noun + (total === 1 ? "" : "s");
    }
  }

  // Re-measure on width change — but only do DOM work when the column count
  // actually changed (resizing within the same column count is a no-op).
  var resizeRaf;
  window.addEventListener("resize", function () {
    if (resizeRaf) cancelAnimationFrame(resizeRaf);
    resizeRaf = requestAnimationFrame(function () {
      if (measureCols() === lastCols) return;
      render();
    });
  });

  // "See all / Show less" toggles a section's preview cap (hydrating on first open).
  sections.forEach(function (s) {
    if (!s.btn) return;
    s.btn.addEventListener("click", function () {
      if (!s.hydrated) hydrate(s);
      s.expanded = !s.expanded;
      s.btn.setAttribute("aria-expanded", String(s.expanded));
      s.btn.innerHTML = s.expanded
        ? 'Show less <span aria-hidden="true">&uarr;</span>'
        : "See all " + s.items.length + ' <span aria-hidden="true">&rarr;</span>';
      render();
    });
  });

  // Live search across every album in the bucket.
  if (search) search.addEventListener("input", render);

  // --- Rail scroll-spy -------------------------------------------------------
  // Highlight the rail link for whichever section is centred in the viewport and
  // keep it scrolled into view within the rail. Jumping itself is native anchor
  // scrolling (CSS scroll-behavior + the section's scroll-margin-top).
  if (rail && "IntersectionObserver" in window) {
    var links = {};
    Array.prototype.forEach.call(rail.querySelectorAll("a"), function (a) {
      links[a.getAttribute("data-target")] = a;
    });
    var spy = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (e) {
          if (!e.isIntersecting) return;
          var a = links[e.target.id];
          if (!a) return;
          Object.keys(links).forEach(function (k) {
            links[k].classList.remove("is-active");
          });
          a.classList.add("is-active");
          a.scrollIntoView({ inline: "center", block: "nearest" });
        });
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );
    sections.forEach(function (s) {
      spy.observe(s.el);
    });
  }

  render();

  // Back-compat: old deep links were /photography/#madrid; sections are now
  // #album-madrid. Map a bare album slug to its section so those links still land.
  if (location.hash) {
    var h = location.hash.replace(/^#/, "");
    if (h && !document.getElementById(h)) {
      var el = document.getElementById("album-" + h);
      if (el) el.scrollIntoView();
    }
  }
})();
