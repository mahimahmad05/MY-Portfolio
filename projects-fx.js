// Extra motion for the Projects page: aurora + particles, scroll bar, title letters, parallax, spotlight, scroll reveals.
(function () {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $ = (s, r) => [...(r || document).querySelectorAll(s)];

  // ---- aurora blobs + particle network (behind everything) ----
  const fx = document.createElement("div"); fx.className = "pj-fx";
  fx.innerHTML = '<i class="a1"></i><i class="a2"></i><i class="a3"></i><canvas></canvas>';
  document.body.prepend(fx);
  const bar = document.createElement("div"); bar.className = "pj-progress"; document.body.appendChild(bar);

  const cv = fx.querySelector("canvas"), g = cv.getContext("2d");
  let W, H, pts = [], mx = -999, my = -999;
  function size() { W = cv.width = innerWidth; H = cv.height = innerHeight; const n = Math.round(Math.min(70, W * H / 22000)); pts = Array.from({ length: n }, () => ({ x: Math.random() * W, y: Math.random() * H, vx: (Math.random() - .5) * .35, vy: (Math.random() - .5) * .35, r: Math.random() * 1.6 + .6 })); }
  size(); addEventListener("resize", size);
  addEventListener("mousemove", (e) => { mx = e.clientX; my = e.clientY; }, { passive: true });
  let vis = true; document.addEventListener("visibilitychange", () => (vis = !document.hidden));
  (function loop() {
    requestAnimationFrame(loop); if (!vis || reduce) return;
    g.clearRect(0, 0, W, H);
    pts.forEach((p, i) => {
      p.x += p.vx; p.y += p.vy; if (p.x < 0 || p.x > W) p.vx *= -1; if (p.y < 0 || p.y > H) p.vy *= -1;
      const dx = p.x - mx, dy = p.y - my, d = Math.hypot(dx, dy);
      if (d < 130) { p.x += dx / d * 1.2; p.y += dy / d * 1.2; }
      g.beginPath(); g.arc(p.x, p.y, p.r, 0, 6.283); g.fillStyle = "rgba(150,195,255,.75)"; g.fill();
      for (let j = i + 1; j < pts.length; j++) { const q = pts[j], l = Math.hypot(p.x - q.x, p.y - q.y); if (l < 120) { g.strokeStyle = "rgba(90,150,255," + (.28 * (1 - l / 120)) + ")"; g.lineWidth = 1; g.beginPath(); g.moveTo(p.x, p.y); g.lineTo(q.x, q.y); g.stroke(); } }
      if (d < 170) { g.strokeStyle = "rgba(160,205,255," + (.5 * (1 - d / 170)) + ")"; g.beginPath(); g.moveTo(p.x, p.y); g.lineTo(mx, my); g.stroke(); }
    });
  })();

  // ---- scroll progress + parallax ----
  let tick = false;
  function onScroll() {
    tick = false;
    const m = document.documentElement.scrollHeight - innerHeight; bar.style.transform = "scaleX(" + (m > 0 ? scrollY / m : 0) + ")";
    if (reduce) return;
    $(".proj-card").forEach((c) => {
      const r = c.getBoundingClientRect(); if (r.bottom < -200 || r.top > innerHeight + 200) return;
      const k = (r.top + r.height / 2 - innerHeight / 2) / innerHeight;
      const v = c.querySelector(".pc-visual"), i = c.querySelector(".pc-info");
      if (v) v.style.translate = "0 " + (k * -26).toFixed(1) + "px";
      if (i) i.style.translate = "0 " + (k * 18).toFixed(1) + "px";
    });
  }
  addEventListener("scroll", () => { if (!tick) { tick = true; requestAnimationFrame(onScroll); } }, { passive: true }); onScroll();

  // ---- things that appear later (cards, github) ----
  const seen = new WeakSet();
  function scan() {
    // title letters
    $(".sec-title:not([data-lt])").forEach((t) => {
      if (!t.textContent.trim()) return; t.dataset.lt = 1; const txt = t.textContent; t.textContent = "";
      [...txt].forEach((ch, i) => { const s = document.createElement("span"); s.className = "lt"; s.textContent = ch === " " ? " " : ch; s.style.animationDelay = (.15 + i * .06) + "s"; t.appendChild(s); });
    });
    // spotlight on panels + one-time screenshot peek
    $(".pc-panel").forEach((p) => {
      if (seen.has(p)) return; seen.add(p);
      p.addEventListener("mousemove", (e) => { const r = p.getBoundingClientRect(); p.style.setProperty("--sx", e.clientX - r.left + "px"); p.style.setProperty("--sy", e.clientY - r.top + "px"); });
      const img = p.querySelector(".pc-shot img");
      if (img && "IntersectionObserver" in window) new IntersectionObserver((en, ob) => en.forEach((x) => {
        if (!x.isIntersecting) return; ob.disconnect();
        setTimeout(() => { const sh = img.parentNode; if (!sh) return; const d = img.offsetHeight - sh.offsetHeight; if (d > 12 && !p.matches(":hover")) { img.style.transition = "transform 2.2s ease-in-out"; img.style.transform = "translateY(-" + Math.min(d, 260) + "px)"; setTimeout(() => { img.style.transition = "transform 1.4s ease-in-out"; img.style.transform = ""; }, 2400); } }, 900);
      }), { threshold: .5 }).observe(p);
    });
    // reveal github blocks one after another
    $(".gh-panel, .gh-card, .gh-term, .gh-tile, .gh-repo").forEach((n, i) => {
      if (seen.has(n)) return; seen.add(n);
      if (!("IntersectionObserver" in window) || reduce) return;
      n.classList.add("rv"); n.style.transitionDelay = (n.classList.contains("gh-tile") || n.classList.contains("gh-repo") ? (i % 4) * .09 : 0) + "s";
      new IntersectionObserver((en, ob) => en.forEach((x) => { if (x.isIntersecting) { n.classList.add("rv-in"); ob.disconnect(); } }), { threshold: .12 }).observe(n);
    });
  }
  new MutationObserver(() => requestAnimationFrame(scan)).observe(document.body, { childList: true, subtree: true });
  scan();

  // heatmap: a light wave sweeps across every few seconds
  setInterval(() => { const h = document.querySelector(".gh-heat"); if (!h || reduce) return; h.classList.remove("wave"); void h.offsetWidth; h.classList.add("wave"); }, 6500);
})();
