/* Scroll-reveal: fade + rise elements as they enter the viewport.
   Progressive enhancement — see the pre-paint script in _layouts/default.html,
   which only adds `html.reveal` (the class the CSS keys off to hide elements)
   when JS + IntersectionObserver are present AND motion is allowed. So if this
   file never runs, or motion is reduced, content is simply visible. */
(function () {
  "use strict";

  var root = document.documentElement;
  // No reveal class => CSS isn't hiding anything; nothing to animate.
  if (!root.classList.contains("reveal") || !("IntersectionObserver" in window)) {
    return;
  }

  var items = document.querySelectorAll("[data-reveal]");
  if (!items.length) return;

  var observer = new IntersectionObserver(
    function (entries, obs) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        obs.unobserve(entry.target); // reveal once, then stop watching
      });
    },
    { rootMargin: "0px 0px -10% 0px", threshold: 0.08 }
  );

  items.forEach(function (el) {
    observer.observe(el);
  });
})();
