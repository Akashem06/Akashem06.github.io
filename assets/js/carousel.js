/* Manual horizontal carousel for the home "From the gallery" strip. Loaded only on
   the home page (via page.carousel). The track is a native scroll-snap element —
   swipe/drag works with no JS; this wires the prev/next arrows, builds pagination
   dots, and reveals/syncs them as you scroll. No autoplay (docs/03). */
(function () {
  "use strict";

  var reduce = false;
  try {
    reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  } catch (e) {}
  var behavior = reduce ? "auto" : "smooth";

  function setup(root) {
    var track = root.querySelector(".carousel__track");
    if (!track) return;
    var prev = root.querySelector(".carousel__arrow--prev");
    var next = root.querySelector(".carousel__arrow--next");
    var slides = Array.prototype.slice.call(
      track.querySelectorAll(".carousel__slide")
    );

    // One slide's worth of horizontal distance (slide width + the flex gap).
    function step() {
      var slide = slides[0];
      if (!slide) return track.clientWidth;
      var gap = parseFloat(getComputedStyle(track).columnGap || "0") || 0;
      return slide.getBoundingClientRect().width + gap;
    }

    // Pagination dots — one per slide, generated so the count always matches and
    // no-JS visitors don't see an empty rail. Skipped when there's nothing to scroll.
    var dots = [];
    if (slides.length > 1) {
      var dotsWrap = document.createElement("div");
      dotsWrap.className = "carousel__dots";
      dotsWrap.setAttribute("role", "group");
      dotsWrap.setAttribute("aria-label", "Choose photo");
      slides.forEach(function (slide, i) {
        var dot = document.createElement("button");
        dot.type = "button";
        dot.className = "carousel__dot";
        dot.setAttribute("aria-label", "Go to photo " + (i + 1));
        dot.addEventListener("click", function () {
          track.scrollTo({
            left: slide.offsetLeft - track.offsetLeft,
            behavior: behavior,
          });
        });
        dotsWrap.appendChild(dot);
        dots.push(dot);
      });
      root.appendChild(dotsWrap);
    }

    // Reveal the arrows only when there's something to scroll to, disable an arrow
    // once its end is reached, and mark the dot nearest the current scroll position.
    function update() {
      var scrollable = track.scrollWidth - track.clientWidth > 1;
      [prev, next].forEach(function (btn) {
        if (btn) btn.hidden = !scrollable;
      });
      if (!scrollable) return;
      var max = track.scrollWidth - track.clientWidth;
      if (prev) prev.disabled = track.scrollLeft <= 1;
      if (next) next.disabled = track.scrollLeft >= max - 1;

      if (dots.length) {
        var active = Math.round(track.scrollLeft / step());
        if (active < 0) active = 0;
        if (active > dots.length - 1) active = dots.length - 1;
        dots.forEach(function (dot, i) {
          var on = i === active;
          dot.classList.toggle("is-active", on);
          if (on) {
            dot.setAttribute("aria-current", "true");
          } else {
            dot.removeAttribute("aria-current");
          }
        });
      }
    }

    if (prev) {
      prev.addEventListener("click", function () {
        track.scrollBy({ left: -step(), behavior: behavior });
      });
    }
    if (next) {
      next.addEventListener("click", function () {
        track.scrollBy({ left: step(), behavior: behavior });
      });
    }

    track.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    update();
  }

  Array.prototype.forEach.call(
    document.querySelectorAll("[data-carousel]"),
    setup
  );
})();
