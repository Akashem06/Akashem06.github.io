/* Sitewide UI glue: theme toggle, mobile nav, sticky-header scroll state, and the
   obfuscated contact link. Deferred. The no-flash script in default.html has
   already set data-theme before paint; here we only handle the toggle + sync. */
(function () {
  "use strict";

  // --- Theme toggle ---------------------------------------------------------
  // Light <-> dark, persisted in localStorage. The no-flash <head> script set the
  // initial data-theme; we just flip it and keep the button's label/meta in sync.
  var root = document.documentElement;
  var themeBtn = document.getElementById("theme-toggle");
  var metaTheme = document.getElementById("meta-theme-color");

  function applyTheme(mode) {
    root.setAttribute("data-theme", mode);
    if (metaTheme) metaTheme.content = mode === "dark" ? "#1c1815" : "#f7f2e9";
    if (themeBtn) {
      themeBtn.setAttribute(
        "aria-label",
        mode === "dark" ? "Switch to light theme" : "Switch to dark theme"
      );
    }
  }

  if (themeBtn) {
    applyTheme(root.getAttribute("data-theme") === "dark" ? "dark" : "light");
    themeBtn.addEventListener("click", function () {
      var next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
      try {
        localStorage.setItem("theme", next);
      } catch (e) {}
      applyTheme(next);
    });
  }

  // Track OS changes, but only while the visitor hasn't made an explicit choice.
  try {
    window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", function (e) {
      var saved = null;
      try {
        saved = localStorage.getItem("theme");
      } catch (_) {}
      if (!saved) applyTheme(e.matches ? "dark" : "light");
    });
  } catch (e) {}

  // --- Section nav ----------------------------------------------------------
  // The wash tabs (see header.html / docs/03) are plain <a> links with
  // aria-current — no JS needed for behaviour. There's no hamburger anymore. On
  // mobile the tab strip scrolls horizontally, so nudge the active tab into view.
  var tabStrip = document.getElementById("nav-tabs");
  if (tabStrip) {
    var activeTab = tabStrip.querySelector('.nav__tab[aria-current="page"]');
    if (activeTab && tabStrip.scrollWidth > tabStrip.clientWidth) {
      activeTab.scrollIntoView({ inline: "center", block: "nearest" });
    }
  }

  // --- Sticky-nav scroll state ----------------------------------------------
  // Adds a subtle shadow to the frosted header once the page is scrolled.
  var header = document.querySelector(".site-header");
  if (header) {
    var onScroll = function () {
      header.classList.toggle("is-scrolled", window.scrollY > 4);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  // --- Contact link ---------------------------------------------------------
  // Email is assembled from data-* parts so it's never committed in plaintext.
  // Owner: set data-user and data-domain on the #contact-link element to enable.
  var contact = document.getElementById("contact-link");
  if (contact && contact.dataset.user && contact.dataset.domain) {
    var addr = contact.dataset.user + "@" + contact.dataset.domain;
    contact.setAttribute("href", "mailto:" + addr);
  }
})();
