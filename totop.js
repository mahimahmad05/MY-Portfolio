// Back-to-top button with a scroll-progress ring (all pages except contact, where the footer script adds it)
(function () {
  if (document.querySelector(".back-to-top")) return;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const UP = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></svg>';
  function init() {
    if (document.querySelector(".back-to-top")) return;
    const up = document.createElement("button"); up.className = "back-to-top"; up.type = "button"; up.setAttribute("aria-label", "Back to top");
    up.innerHTML = '<svg class="btt-ring" viewBox="0 0 48 48"><circle cx="24" cy="24" r="21"/><circle class="btt-bar" cx="24" cy="24" r="21"/></svg><span class="btt-ic">' + UP + "</span>";
    document.body.appendChild(up);
    const bar = up.querySelector(".btt-bar"), C = 2 * Math.PI * 21; bar.style.strokeDasharray = C;
    up.addEventListener("click", () => { up.classList.add("launch"); scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" }); setTimeout(() => up.classList.remove("launch"), 1100); });
    function sc() { const m = document.documentElement.scrollHeight - innerHeight; bar.style.strokeDashoffset = C * (1 - (m > 0 ? scrollY / m : 0)); up.classList.toggle("show", scrollY > 500); }
    addEventListener("scroll", sc, { passive: true }); addEventListener("resize", sc); sc();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})();
