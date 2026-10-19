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

  function news(items, cfg) {
    const wrap = document.getElementById("newsList");
    if (!items.length) return;
    const max = cfg.visibleCount || 5;
    function row(it) {
      const col = el("div", "nl-col", "", [el("div", "nl-title", it.title)]);
      if (it.description) col.appendChild(el("div", "nl-desc", it.description));
      const r = el("div", "nl-row", "", [el("span", "nl-dot"), col]);
      if (it.date) r.appendChild(el("span", "nl-date", it.date));
      return r;
    }
    items.slice(0, max).forEach((it) => wrap.appendChild(row(it)));
    if (items.length <= max) return;
    const label = el("span", "", cfg.moreLabel || "See More");
    const btn = el("button", "nl-more"); btn.type = "button"; btn.appendChild(label);
    const more = el("div", "nl-more-row", "", [btn]);
    wrap.appendChild(more);
    let open = false;
    btn.addEventListener("click", () => {
      open = !open;
      if (open) { items.slice(max).forEach((it) => wrap.insertBefore(row(it), more)); label.textContent = cfg.lessLabel || "See Less"; }
      else { wrap.querySelectorAll(".nl-row").forEach((r, i) => { if (i >= max) r.remove(); }); label.textContent = cfg.moreLabel || "See More"; more.scrollIntoView({ behavior: "smooth", block: "nearest" }); }
    });
  }

  function slideshow(photos) {
    const wrap = document.getElementById("hlWrap");
    if (!photos.length) return;
    const frame = el("div", "hl-frame");
    const fb = el("div", "hl-fallback", "Highlight photos not added yet");
    frame.appendChild(fb);
    let broken = 0, idx = 0, timer = null;
    const imgs = photos.map((src, i) => {
      const img = document.createElement("img");
      img.className = "hl-img" + (i === 0 ? " active" : ""); img.alt = "Highlight " + (i + 1); img.loading = "lazy";
      img.onerror = () => { img.remove(); imgs[i] = null; if (++broken === photos.length) { dots.forEach((d) => d.remove()); stop(); prev.style.display = next.style.display = "none"; } };
      img.onload = () => (fb.style.display = "none");
      img.src = src; frame.appendChild(img); return img;
    });
    const prev = el("button", "hl-arrow hl-prev"); prev.type = "button"; prev.setAttribute("aria-label", "Previous"); prev.innerHTML = ICONS.prev;
    const next = el("button", "hl-arrow hl-next"); next.type = "button"; next.setAttribute("aria-label", "Next"); next.innerHTML = ICONS.next;
    wrap.appendChild(frame);
    const row = el("div", "hl-dots"); const dots = [];
    function go(n) {
      const live = imgs.map((x, i) => (x ? i : -1)).filter((i) => i >= 0);
      if (!live.length) return;
      if (!imgs[n]) n = live.find((i) => i > n) ?? live[0];
      imgs[idx] && imgs[idx].classList.remove("active"); dots[idx] && dots[idx].classList.remove("active");
      idx = n;
      imgs[idx].classList.add("active"); dots[idx].classList.add("active");
    }
    const step = (d) => { const live = imgs.map((x, i) => (x ? i : -1)).filter((i) => i >= 0); if (!live.length) return; const p = live.indexOf(idx); go(live[(p + d + live.length) % live.length]); };
    function start() { stop(); if (photos.length > 1) timer = setInterval(() => step(1), 2800); }
    function stop() { if (timer) clearInterval(timer); timer = null; }
    photos.forEach((_, i) => {
      const b = el("button", "hl-dot" + (i === 0 ? " active" : ""), String(i + 1)); b.type = "button"; b.setAttribute("aria-label", "Photo " + (i + 1));
      b.addEventListener("click", () => { go(i); start(); }); dots.push(b); row.appendChild(b);
    });
    prev.addEventListener("click", () => { step(-1); start(); });
    next.addEventListener("click", () => { step(1); start(); });
    if (photos.length > 1) { frame.appendChild(prev); frame.appendChild(next); wrap.appendChild(row); }
    frame.addEventListener("mouseenter", stop); frame.addEventListener("mouseleave", start);
    start();
  }
})();
