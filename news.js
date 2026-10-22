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
    heroExtras(sec);
    sub("nwNews", cfg.news, ICONS.bell);
    sub("nwHigh", cfg.highlights, ICONS.image);
    news((cfg.news && cfg.news.items) || [], cfg);
    slideshow((cfg.highlights && cfg.highlights.items) || []);
  };

  function heroExtras(sec) {
    // soft orb that follows the mouse
    if (matchMedia("(hover: hover)").matches) {
      const o = el("div", "nw-orb"); document.body.appendChild(o);
      let x = innerWidth / 2, y = innerHeight / 2, tx2 = x, ty = y;
      addEventListener("mousemove", (e) => { tx2 = e.clientX; ty = e.clientY; }, { passive: true });
      (function f() { x += (tx2 - x) * .08; y += (ty - y) * .08; o.style.transform = "translate(" + (x - 160) + "px," + (y - 160) + "px)"; requestAnimationFrame(f); })();
    }
  }

  function confetti(btn) {
    const r = btn.getBoundingClientRect(), cv = el("canvas", "nw-conf"); cv.width = innerWidth; cv.height = innerHeight; document.body.appendChild(cv);
    const g = cv.getContext("2d"), cols = ["#5af0b8", "#7fb0ff", "#ffd479", "#c78bff", "#ff7a9c"];
    const ps = Array.from({ length: 70 }, () => ({ x: r.left + r.width / 2, y: r.top + r.height / 2, vx: (Math.random() - .5) * 11, vy: -Math.random() * 11 - 3, s: Math.random() * 6 + 3, c: cols[Math.random() * cols.length | 0], a: Math.random() * 6, va: (Math.random() - .5) * .4 }));
    let t = 0;
    (function f() { g.clearRect(0, 0, cv.width, cv.height); ps.forEach((p) => { p.vy += .3; p.x += p.vx; p.y += p.vy; p.a += p.va; g.save(); g.translate(p.x, p.y); g.rotate(p.a); g.fillStyle = p.c; g.globalAlpha = Math.max(0, 1 - t / 70); g.fillRect(-p.s / 2, -p.s / 2, p.s, p.s * .6); g.restore(); }); if (++t < 70) requestAnimationFrame(f); else cv.remove(); })();
  }

  function sub(id, c, fallback) {
    const box = document.getElementById(id);
    if (!box || !c || !(c.items || []).length) return;
    box.hidden = false;
    box.querySelector(".sub-title").textContent = c.title;
    box.querySelector(".sub-icon").innerHTML = ICONS[c.icon] || fallback;
  }

  const CHECK = S('<polyline points="20 6 9 17 4 12"/>'), CLOCK = S('<circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 15 14"/>');
  const ICO = [[/recycle/i, "♻️"], [/portfolio/i, "🎨"], [/srs|uml|document/i, "📐"], [/present/i, "🎤"], [/wsl|linux|system call|terminal/i, "🐧"], [/cpu|schedul|round robin/i, "⚙️"], [/react/i, "⚛️"], [/exam|routine|seat/i, "🗓️"], [/ai|ml|machine/i, "🤖"], [/github|git/i, "🐙"]];
  const icon = (t) => { const m = ICO.find(([r]) => r.test(t)); return m ? m[1] : "📰"; };
  const status = (t) => (/^(working|exploring|practic|learning|building|studying|developing)/i.test(t) ? "doing" : "done");

  // ---- news: live ticker + stats donut + filter chips + scroll timeline ----
  function news(items, cfg) {
    const wrap = document.getElementById("newsList");
    if (!items.length) return;
    const max = cfg.visibleCount || 5, ST = items.map((it) => status(it.title));
    const doing = ST.filter((x) => x === "doing").length, done = items.length - doing, pct = Math.round(done / items.length * 100);

    // header block: LIVE ticker + stats
    const tick = (r) => el("div", "tk-row", "", items.flatMap((it) => [el("span", "tk-w", it.title), el("span", "tk-s", "✦")]));
    const ticker = el("div", "tk", "", [el("span", "tk-live", "", [el("i"), document.createTextNode("LIVE")]), el("div", "tk-mask", "", [el("div", "tk-track", "", [tick(), tick()])])]);
    const num = (n, l, cls) => { const b = el("b", "", "0"); cnt(b, n); return el("div", "ns " + (cls || ""), "", [b, el("span", "", l)]); };
    const donut = el("div", "ns-donut"); donut.style.setProperty("--p", "0");
    donut.appendChild(el("b", "", pct + "%")); donut.appendChild(el("span", "", "completed"));
    setTimeout(() => donut.style.setProperty("--p", pct), 300);
    const stats = el("div", "ns-row", "", [num(items.length, "Updates"), num(doing, "In progress", "y"), num(done, "Done", "g"), donut]);
    const filters = el("div", "nf");
    let filter = "all", expanded = false;
    [["all", "All"], ["doing", "In progress"], ["done", "Done"]].forEach(([k, l]) => { const b = el("button", "nf-b" + (k === "all" ? " on" : ""), l); b.type = "button"; b.onclick = () => { if (k === "done") confetti(b); filter = k; expanded = false; filters.querySelectorAll(".nf-b").forEach((x) => x.classList.toggle("on", x === b)); draw(); }; filters.appendChild(b); });
    const head = wrap.parentNode;
    head.insertBefore(ticker, wrap); head.insertBefore(stats, wrap); head.insertBefore(filters, wrap);

    wrap.classList.add("tl", "straight");
    let fill = null;
    function item(it, i, latest) {
      const st = status(it.title);
      const badge = el("span", "tl-badge " + st); badge.innerHTML = (st === "doing" ? CLOCK : CHECK); badge.appendChild(document.createTextNode(st === "doing" ? "In progress" : "Done"));
      const top = el("div", "tl-top", "", [badge, el("span", "tl-date", it.date || "#" + String(items.indexOf(it) + 1).padStart(2, "0"))]);
      const tile = el("div", "tl-ico", icon(it.title)), body = el("div", "tl-body", "", [el("div", "tl-title", it.title)]);
      const card = el("div", "tl-card" + (latest ? " latest" : ""), "", [top, el("div", "tl-main", "", [tile, body])]);
      if (latest) card.appendChild(el("span", "tl-ribbon", "Latest"));
      const desc = it.description ? el("div", "tl-desc", it.description) : null; if (desc) body.appendChild(desc);
      if (st === "doing") card.appendChild(el("div", "tl-prog", "", [el("i")]));
      card.addEventListener("mousemove", (e) => { const r = card.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5; card.style.setProperty("--sx", e.clientX - r.left + "px"); card.style.setProperty("--sy", e.clientY - r.top + "px"); card.style.transform = "perspective(800px) rotateY(" + (x * 5).toFixed(2) + "deg) rotateX(" + (-y * 5).toFixed(2) + "deg) translateY(-4px)"; });
      card.addEventListener("mouseleave", () => (card.style.transform = ""));
      const node = el("span", "tl-node " + st, "", [el("i")]);
      const row = el("div", "tl-item " + (i % 2 ? "r" : "l"), "", [node, card]);
      row.style.transitionDelay = "0s";
      if ("IntersectionObserver" in window) { row.classList.add("pre"); new IntersectionObserver((en, ob) => en.forEach((x) => { if (x.isIntersecting) { row.classList.add("in"); ob.disconnect(); typeIt(desc, it.description); } }), { threshold: .15 }).observe(row); if (desc) desc.textContent = ""; }
      return row;
    }
    function prog() { if (!fill) return; const r = wrap.getBoundingClientRect(), p = Math.max(0, Math.min(1, (innerHeight * .6 - r.top) / r.height)); fill.style.height = p * 100 + "%"; }
    addEventListener("scroll", prog, { passive: true }); addEventListener("resize", prog);
    function draw() {
      wrap.innerHTML = "";
      const list = items.filter((it, i) => filter === "all" || ST[i] === filter);
      fill = el("i", "tl-fill"); wrap.appendChild(el("div", "tl-track", "", [fill, el("i", "tl-comet")]));
      const shown = expanded ? list : list.slice(0, max);
      shown.forEach((it, i) => wrap.appendChild(item(it, i, filter === "all" && i === 0)));
      if (!list.length) wrap.appendChild(el("div", "tl-empty", "Nothing here yet."));
      if (list.length > max) {
        const label = el("span", "", expanded ? (cfg.lessLabel || "See Less") : (cfg.moreLabel || "See More"));
        const btn = el("button", "nl-more"); btn.type = "button"; btn.appendChild(label);
        btn.onclick = () => { expanded = !expanded; draw(); if (!expanded) wrap.scrollIntoView({ behavior: "smooth", block: "start" }); };
        wrap.appendChild(el("div", "nl-more-row", "", [btn]));
      }
      prog();
    }
    draw();
  }
  function typeIt(node, text) { if (!node) return; let i = 0; const cur = el("i", "tl-cur"); node.textContent = ""; node.appendChild(cur); const t = setInterval(() => { i += 2; node.firstChild === cur ? node.insertBefore(document.createTextNode(text.slice(0, i)), cur) : (node.firstChild.nodeValue = text.slice(0, i)); if (i >= text.length) { clearInterval(t); setTimeout(() => cur.remove(), 600); } }, 16); }
  function cnt(n, to) { const t0 = performance.now(); (function f(t) { const k = Math.min(1, (t - t0) / 1200); n.textContent = Math.round(to * (1 - Math.pow(1 - k, 3))); if (k < 1) requestAnimationFrame(f); })(t0); }

  // ---- highlights: 3D coverflow with blurred ambient glow, mouse tilt, lightbox, swipe, autoplay ----
  function slideshow(photos) {
    const wrap = document.getElementById("hlWrap");
    if (!photos.length) return;
    const stage = el("div", "cf-stage"), rig = el("div", "cf-rig"), amb = el("div", "cf-amb"), N = photos.length;
    stage.appendChild(amb); stage.appendChild(rig);
    let idx = 0, timer = null, moved = false;
    const cards = photos.map((src, i) => {
      const img = document.createElement("img"); img.alt = "Highlight " + (i + 1); img.loading = "lazy"; img.draggable = false;
      const ph = el("div", "cf-ph", "", [el("b", "", String(i + 1).padStart(2, "0")), el("span", "", "Photo not added yet")]);
      const c = el("div", "cf-card", "", [ph, img, el("div", "cf-gloss"), el("div", "cf-tag", "Highlight " + String(i + 1).padStart(2, "0"))]);
      img.onload = () => { ph.style.display = "none"; if (i === idx) layout(); }; img.onerror = () => img.remove(); img.src = src;
      c.addEventListener("click", () => { if (moved) return; if (i !== idx) { go(i); start(); } else lightbox(); });
      rig.appendChild(c); return c;
    });
    const counter = el("div", "cf-count", "", [el("b", "", "01"), el("span", "", " / " + String(N).padStart(2, "0"))]);
    const bar = el("div", "cf-bar", "", [el("i")]);
    const dots = photos.map((src, i) => {
      const b = el("button", "cf-dot"), em = el("em", "", String(i + 1)), im = document.createElement("img"); im.alt = ""; im.draggable = false;
      im.onload = () => (em.style.display = "none"); im.onerror = () => im.remove(); im.src = src;
      b.type = "button"; b.setAttribute("aria-label", "Photo " + (i + 1)); b.append(im, em); b.onclick = () => { go(i); start(); }; return b;
    });
    function layout() {
      cards.forEach((c, i) => {
        let o = i - idx; if (o > N / 2) o -= N; if (o < -N / 2) o += N;
        const a = Math.abs(o), vis = a <= 2;
        c.style.transform = "translate(-50%,-50%) translateX(" + (o * 50) + "%) translateZ(" + (-a * 140) + "px) rotateY(" + (-o * 42) + "deg) scale(" + (a === 0 ? 1 : .86) + ")";
        c.style.opacity = vis ? (a === 0 ? 1 : a === 1 ? .75 : .35) : 0; c.style.zIndex = 10 - a; c.style.pointerEvents = vis ? "auto" : "none";
        c.classList.toggle("on", a === 0);
      });
      const im = cards[idx].querySelector("img"); amb.style.backgroundImage = im ? "url('" + im.src + "')" : "none";
      counter.firstChild.textContent = String(idx + 1).padStart(2, "0");
      dots.forEach((d, i) => d.classList.toggle("active", i === idx));
      bar.firstChild.style.animation = "none"; void bar.offsetWidth; bar.firstChild.style.animation = timer ? "cf-bar 3.6s linear" : "none";
    }
    function go(n) { idx = (n + N) % N; layout(); }
    function start() { stop(); if (N > 1) { timer = setInterval(() => go(idx + 1), 3600); layout(); } }
    function stop() { if (timer) clearInterval(timer); timer = null; bar.firstChild.style.animation = "none"; }
    function lightbox() {
      stop();
      const lb = el("div", "lb"), im = document.createElement("img"), cap = el("div", "lb-cap");
      const show = () => { const c = cards[idx].querySelector("img"); im.style.display = c ? "block" : "none"; im.src = c ? c.src : ""; cap.textContent = String(idx + 1).padStart(2, "0") + " / " + String(N).padStart(2, "0") + (c ? "" : " · photo not added yet"); };
      const close = () => { lb.classList.remove("in"); setTimeout(() => lb.remove(), 250); document.removeEventListener("keydown", key); start(); };
      const step = (d) => { go(idx + d); show(); };
      const key = (e) => { if (e.key === "Escape") close(); else if (e.key === "ArrowRight") step(1); else if (e.key === "ArrowLeft") step(-1); };
      const x = el("button", "lb-x", "×"), pv = el("button", "lb-a lb-p"), nx = el("button", "lb-a lb-n");
      pv.innerHTML = ICONS.prev; nx.innerHTML = ICONS.next; x.onclick = close; pv.onclick = () => step(-1); nx.onclick = () => step(1);
      lb.addEventListener("click", (e) => { if (e.target === lb) close(); });
      lb.append(x, pv, im, nx, cap); document.body.appendChild(lb); document.addEventListener("keydown", key); show();
      requestAnimationFrame(() => lb.classList.add("in"));
    }
    const prev = el("button", "cf-arrow cf-prev"); prev.type = "button"; prev.setAttribute("aria-label", "Previous"); prev.innerHTML = ICONS.prev;
    const next = el("button", "cf-arrow cf-next"); next.type = "button"; next.setAttribute("aria-label", "Next"); next.innerHTML = ICONS.next;
    prev.onclick = () => { go(idx - 1); start(); }; next.onclick = () => { go(idx + 1); start(); };
    let sx = null;
    stage.addEventListener("pointerdown", (e) => { sx = e.clientX; moved = false; });
    addEventListener("pointerup", (e) => { if (sx == null) return; const d = e.clientX - sx; sx = null; if (Math.abs(d) > 40) { moved = true; go(idx + (d < 0 ? 1 : -1)); start(); setTimeout(() => (moved = false), 50); } });
    stage.addEventListener("mousemove", (e) => { const r = stage.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5; stage.style.setProperty("--mx", (x * 9).toFixed(2) + "deg"); stage.style.setProperty("--my", (y * -6).toFixed(2) + "deg"); });
    stage.addEventListener("mouseenter", stop);
    stage.addEventListener("mouseleave", () => { stage.style.setProperty("--mx", "0deg"); stage.style.setProperty("--my", "0deg"); start(); });
    wrap.appendChild(el("div", "cf-wrap", "", [stage, prev, next]));
    if (N > 1) { wrap.appendChild(el("div", "cf-foot", "", [counter, el("div", "cf-dots", "", dots)])); wrap.appendChild(bar); }
    layout(); start();
  }
})();
