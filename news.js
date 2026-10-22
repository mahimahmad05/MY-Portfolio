// News & Highlights page. Content: data.json -> "news" { news.items[], highlights.items[] (photo paths) }.
// Highlight photos go in assets/highlights/.
(function () {
  const S = (p) => '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' + p + "</svg>";
  const ICONS = {
    newspaper: S('<path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"/><path d="M18 14h-8"/><path d="M15 18h-5"/><path d="M10 6h8v4h-8z"/>'),
    bell: S('<path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>'),
    image: S('<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>'),
    prev: S('<polyline points="15 18 9 12 15 6"/>'),
    next: S('<polyline points="9 18 15 12 9 6"/>'),
  };
  function el(tag, cls, text, kids) {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null && text !== "") n.textContent = text;
    (kids || []).forEach((k) => n.appendChild(k));
    return n;
  }

  window.renderNews = function (cfg) {
    const sec = document.getElementById("newsSec");
    if (!sec || !cfg) return;
    sec.hidden = false;
    document.getElementById("nwNum").textContent = cfg.number || "";
    document.getElementById("nwTitle").textContent = cfg.title || "News & Highlights";
    document.getElementById("nwHeadIcon").innerHTML = ICONS[cfg.icon] || ICONS.newspaper;
    sub("nwNews", cfg.news, ICONS.bell);
    sub("nwHigh", cfg.highlights, ICONS.image);
    news((cfg.news && cfg.news.items) || [], cfg);
    slideshow((cfg.highlights && cfg.highlights.items) || []);
  };

  function sub(id, c, fallback) {
    const box = document.getElementById(id);
    if (!box || !c || !(c.items || []).length) return;
    box.hidden = false;
    box.querySelector(".sub-title").textContent = c.title;
    box.querySelector(".sub-icon").innerHTML = ICONS[c.icon] || fallback;
  }

  const CHECK = S('<polyline points="20 6 9 17 4 12"/>'), CLOCK = S('<circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 15 14"/>');
  const status = (t) => (/^(working|exploring|practic|learning|building|studying|developing)/i.test(t) ? "doing" : "done");

  // ---- news = scroll timeline: glowing line fills as you scroll, cards slide in from alternate sides ----
  function news(items, cfg) {
    const wrap = document.getElementById("newsList");
    if (!items.length) return;
    wrap.classList.add("tl");
    const track = el("div", "tl-track", "", [el("i", "tl-fill")]);
    wrap.appendChild(track);
    const max = cfg.visibleCount || 5;
    let n = 0;
    function item(it) {
      const st = status(it.title), i = n++;
      const badge = el("span", "tl-badge " + st); badge.innerHTML = (st === "doing" ? CLOCK : CHECK); badge.appendChild(document.createTextNode(st === "doing" ? "In progress" : "Done"));
      const card = el("div", "tl-card", "", [
        el("div", "tl-top", "", [badge, el("span", "tl-date", it.date || "#" + String(i + 1).padStart(2, "0"))]),
        el("div", "tl-title", it.title),
      ]);
      if (it.description) card.appendChild(el("div", "tl-desc", it.description));
      card.addEventListener("mousemove", (e) => { const r = card.getBoundingClientRect(); card.style.setProperty("--sx", e.clientX - r.left + "px"); card.style.setProperty("--sy", e.clientY - r.top + "px"); });
      const node = el("span", "tl-node " + st, "", [el("i")]);
      const row = el("div", "tl-item " + (i % 2 ? "r" : "l"), "", [node, card]);
      if ("IntersectionObserver" in window) { row.classList.add("pre"); new IntersectionObserver((en, ob) => en.forEach((x) => { if (x.isIntersecting) { row.classList.add("in"); ob.disconnect(); } }), { threshold: .2 }).observe(row); }
      return row;
    }
    const rows = [];
    items.slice(0, max).forEach((it) => { const r = item(it); rows.push(r); wrap.appendChild(r); });
    const fill = track.firstChild;
    function prog() { const r = wrap.getBoundingClientRect(), p = Math.max(0, Math.min(1, (innerHeight * .6 - r.top) / r.height)); fill.style.height = p * 100 + "%"; }
    addEventListener("scroll", prog, { passive: true }); addEventListener("resize", prog); prog();
    if (items.length <= max) return;
    const label = el("span", "", cfg.moreLabel || "See More");
    const btn = el("button", "nl-more"); btn.type = "button"; btn.appendChild(label);
    const more = el("div", "nl-more-row", "", [btn]); wrap.appendChild(more);
    let open = false, extra = [];
    btn.addEventListener("click", () => {
      open = !open;
      if (open) { n = max; extra = items.slice(max).map((it) => { const r = item(it); wrap.insertBefore(r, more); setTimeout(() => r.classList.add("in"), 30); return r; }); label.textContent = cfg.lessLabel || "See Less"; }
      else { extra.forEach((r) => r.remove()); extra = []; label.textContent = cfg.moreLabel || "See More"; more.scrollIntoView({ behavior: "smooth", block: "nearest" }); }
      prog();
    });
  }

  // ---- highlights = 3D coverflow: centre photo big, neighbours tilted behind; swipe / arrows / dots / autoplay ----
  function slideshow(photos) {
    const wrap = document.getElementById("hlWrap");
    if (!photos.length) return;
    const stage = el("div", "cf-stage"), N = photos.length;
    const cards = photos.map((src, i) => {
      const img = document.createElement("img"); img.alt = "Highlight " + (i + 1); img.loading = "lazy"; img.draggable = false;
      const ph = el("div", "cf-ph", "", [el("b", "", String(i + 1).padStart(2, "0")), el("span", "", "Photo not added yet")]);
      const c = el("div", "cf-card", "", [ph, img, el("div", "cf-gloss")]);
      img.onload = () => { ph.style.display = "none"; }; img.onerror = () => img.remove(); img.src = src;
      c.addEventListener("click", () => { if (moved) return; if (i !== idx) { go(i); start(); } });
      stage.appendChild(c); return c;
    });
    let idx = 0, timer = null, moved = false;
    const counter = el("div", "cf-count", "", [el("b", "", "01"), el("span", "", " / " + String(N).padStart(2, "0"))]);
    const bar = el("div", "cf-bar", "", [el("i")]);
    function layout() {
      cards.forEach((c, i) => {
        let o = i - idx; if (o > N / 2) o -= N; if (o < -N / 2) o += N;
        const a = Math.abs(o), vis = a <= 2;
        c.style.transform = "translate(-50%,-50%) translateX(" + (o * 50) + "%) translateZ(" + (-a * 140) + "px) rotateY(" + (-o * 42) + "deg) scale(" + (a === 0 ? 1 : .86) + ")";
        c.style.opacity = vis ? (a === 0 ? 1 : a === 1 ? .75 : .35) : 0; c.style.zIndex = 10 - a; c.style.pointerEvents = vis ? "auto" : "none";
        c.classList.toggle("on", a === 0);
      });
      counter.firstChild.textContent = String(idx + 1).padStart(2, "0");
      dots.forEach((d, i) => d.classList.toggle("active", i === idx));
      bar.firstChild.style.animation = "none"; void bar.offsetWidth; bar.firstChild.style.animation = timer ? "cf-bar 3.4s linear" : "none";
    }
    function go(n) { idx = (n + N) % N; layout(); }
    function start() { stop(); if (N > 1) { timer = setInterval(() => go(idx + 1), 3400); layout(); } }
    function stop() { if (timer) clearInterval(timer); timer = null; bar.firstChild.style.animation = "none"; }
    const prev = el("button", "cf-arrow cf-prev"); prev.type = "button"; prev.setAttribute("aria-label", "Previous"); prev.innerHTML = ICONS.prev;
    const next = el("button", "cf-arrow cf-next"); next.type = "button"; next.setAttribute("aria-label", "Next"); next.innerHTML = ICONS.next;
    prev.onclick = () => { go(idx - 1); start(); }; next.onclick = () => { go(idx + 1); start(); };
    const dots = photos.map((_, i) => { const b = el("button", "cf-dot"); b.type = "button"; b.setAttribute("aria-label", "Photo " + (i + 1)); b.onclick = () => { go(i); start(); }; return b; });
    // swipe / drag
    let sx = null;
    stage.addEventListener("pointerdown", (e) => { sx = e.clientX; moved = false; });
    addEventListener("pointerup", (e) => { if (sx == null) return; const d = e.clientX - sx; sx = null; if (Math.abs(d) > 40) { moved = true; go(idx + (d < 0 ? 1 : -1)); start(); setTimeout(() => (moved = false), 50); } });
    stage.addEventListener("mouseenter", stop); stage.addEventListener("mouseleave", start);
    wrap.appendChild(el("div", "cf-wrap", "", [stage, prev, next]));
    if (N > 1) { wrap.appendChild(el("div", "cf-foot", "", [counter, el("div", "cf-dots", "", dots)])); wrap.appendChild(bar); }
    layout(); start();
  }
})();
