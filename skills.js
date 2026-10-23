// Skills section. All content comes from data.json -> "skills".
// Add a category/skill there and it shows up here automatically.
(function () {
  const I = (p) => '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' + p + '</svg>';
  const ICONS = {
    code:  I('<polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>'),
    globe: I('<circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>'),
    brush: I('<path d="M9.06 11.9l8.07-8.06a2.85 2.85 0 1 1 4.03 4.03l-8.06 8.08"/><path d="M7.07 14.94c-1.66 0-3 1.35-3 3.02 0 1.33-2.5 1.52-2 2.02 1.08 1.1 2.49 2.02 4 2.02 2.2 0 4-1.8 4-4.04a3.01 3.01 0 0 0-3-3.02z"/>'),
    tools: I('<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>'),
    users: I('<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>'),
    spark: I('<path d="M12 2l2.4 6.6L21 11l-6.6 2.4L12 20l-2.4-6.6L3 11l6.6-2.4L12 2z"/>'),
    eye:   I('<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>'),
  };

  const canHover = window.matchMedia && matchMedia("(hover: hover) and (pointer: fine)").matches;

  function el(tag, cls, text, kids) {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text) n.textContent = text;
    (kids || []).forEach((k) => n.appendChild(k));
    return n;
  }
  function logo(src, cls) {
    const img = document.createElement("img");
    img.src = src; img.alt = ""; img.className = cls; img.loading = "lazy";
    img.onerror = () => { img.style.display = "none"; };
    return img;
  }

  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const io = "IntersectionObserver" in window ? new IntersectionObserver((es) => es.forEach((x) => {
    if (x.isIntersecting) { io.unobserve(x.target); x.target.classList.add("in"); (x.target._in || []).forEach((f) => f()); }
  }), { threshold: 0.15 }) : null;
  function onIn(n, fn) { if (fn) (n._in = n._in || []).push(fn); if (io) io.observe(n); else { n.classList.add("in"); if (fn) fn(); } return n; }
  function count(node, to, dur) {
    if (reduce) { node.textContent = to; return; }
    const t0 = performance.now();
    (function f(t) { const k = Math.min(1, (t - t0) / (dur || 1200)); node.textContent = Math.round(to * (1 - Math.pow(1 - k, 3))); if (k < 1) requestAnimationFrame(f); })(t0);
  }
  function spot(card) {
    card.addEventListener("mousemove", (ev) => {
      const r = card.getBoundingClientRect();
      card.style.setProperty("--mx", ((ev.clientX - r.left) / r.width * 100) + "%");
      card.style.setProperty("--my", ((ev.clientY - r.top) / r.height * 100) + "%");
    });
  }
  function tilt(card) {
    if (reduce || !canHover) return;
    card.addEventListener("mousemove", (ev) => {
      const r = card.getBoundingClientRect(), x = (ev.clientX - r.left) / r.width, y = (ev.clientY - r.top) / r.height;
      card.style.setProperty("--ry", (x - .5) * 10 + "deg"); card.style.setProperty("--rx", (.5 - y) * 10 + "deg");
    });
    card.addEventListener("mouseleave", () => { card.style.setProperty("--ry", "0deg"); card.style.setProperty("--rx", "0deg"); });
  }

  // ---- orbit hero: logos circling a glowing core ----
  function orbit(cfg) {
    const box = document.getElementById("skillsOrbit"); if (!box) return;
    const by = (id) => ((cfg.categories.find((c) => c.id === id) || {}).items || []).filter((i) => i.logo);
    const all = cfg.categories.flatMap((c) => c.items || []);
    let rings = [by("programming-languages"), by("web-development").concat(by("ai-ml")), by("tools-platforms")].filter((r) => r.length);
    if (!rings.length) { const w = all.filter((i) => i.logo); if (!w.length) return; rings = [w]; }
    box.appendChild(el("i", "or-halo"));
    const core = el("div", "or-core"); const n = el("b", "", "0");
    core.appendChild(n); core.appendChild(el("span", "", "Skills"));
    box.appendChild(core);
    onIn(box, () => count(n, all.length, 1600));
    const radii = [92, 160, 228], durs = [26, 38, 52];
    rings.forEach((items, ri) => {
      const ring = el("div", "or-ring"); ring.style.setProperty("--r", "calc(" + radii[ri] + "px * var(--u))"); ring.style.setProperty("--d", durs[ri] + "s");
      if (ri % 2) ring.classList.add("rev");
      ring.appendChild(el("i", "or-path"));
      items.forEach((it, i) => {
        const a = 360 / items.length * i;
        const chip = el("div", "or-chip"); chip.title = it.name;
        const img = logo(it.logo, "or-img"); img.loading = "eager";
        img.onerror = () => { img.remove(); chip.textContent = it.name.slice(0, 2); };
        chip.appendChild(img); chip.appendChild(el("span", "or-name", it.name));
        const un = el("div", "or-un", "", [chip]); un.style.setProperty("--a", a + "deg");
        const wrap = el("div", "or-it", "", [un]); wrap.style.setProperty("--a", a + "deg");
        ring.appendChild(wrap);
      });
      box.appendChild(ring);
    });
  }

  // ---- radar: average level of every category, click an axis to filter ----
  function radar(cfg) {
    const hero = document.getElementById("skHero"); if (!hero) return;
    const cats = cfg.categories.map((c) => {
      const p = (c.items || []).map((x) => x.percent).filter((x) => x != null);
      return { id: c.id, title: c.title, v: p.length ? Math.round(p.reduce((a, b) => a + b, 0) / p.length) : 0 };
    }).filter((c) => c.v > 0);
    if (cats.length < 3) return;
    const N = cats.length, C = 200, R = 118, pt = (i, k) => { const a = -Math.PI / 2 + i * 2 * Math.PI / N; return [C + Math.cos(a) * R * k, C + Math.sin(a) * R * k]; };
    const poly = (k) => cats.map((_, i) => pt(i, k).map((x) => x.toFixed(1)).join(",")).join(" ");
    let s = '<svg viewBox="0 0 400 400"><defs><linearGradient id="rdG" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#7fb0ff" stop-opacity=".55"/><stop offset="1" stop-color="#2f6bff" stop-opacity=".25"/></linearGradient></defs>';
    [.25, .5, .75, 1].forEach((k) => (s += '<polygon class="rd-grid" points="' + poly(k) + '"/>'));
    cats.forEach((_, i) => { const p = pt(i, 1); s += '<line class="rd-ax" x1="' + C + '" y1="' + C + '" x2="' + p[0].toFixed(1) + '" y2="' + p[1].toFixed(1) + '"/>'; });
    s += '<g class="rd-shape"><polygon class="rd-fill" points="' + cats.map((c, i) => pt(i, c.v / 100).map((x) => x.toFixed(1)).join(",")).join(" ") + '"/>';
    cats.forEach((c, i) => { const p = pt(i, c.v / 100); s += '<circle class="rd-dot" cx="' + p[0].toFixed(1) + '" cy="' + p[1].toFixed(1) + '" r="4.5" style="--i:' + i + '"/>'; });
    s += "</g></svg>";
    const card = el("div", "rd glow-border");
    card.appendChild(el("div", "rd-title", "", [el("span", "", "Skill radar"), el("em", "", "click a label to filter")]));
    const stage = el("div", "rd-stage"); stage.innerHTML = s;
    cats.forEach((c, i) => {
      const p = pt(i, 1.0), a = -Math.PI / 2 + i * 2 * Math.PI / N;
      const lx = C + Math.cos(a) * (R + 36), ly = C + Math.sin(a) * (R + 30);
      const b = el("button", "rd-lab"); b.type = "button";
      b.style.left = lx / 4 + "%"; b.style.top = ly / 4 + "%";
      const nb = el("b", "", "0");
      b.appendChild(el("span", "", c.title)); b.appendChild(el("i", "", "", [nb, document.createTextNode("%")]));
      b.addEventListener("click", () => {
        const btns = [...document.querySelectorAll(".skf-btn")];
        const idx = cfg.categories.findIndex((x) => x.id === c.id) + 1;
        if (btns[idx]) { btns[idx].click(); document.getElementById("skillsFilter").scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "center" }); }
      });
      b.addEventListener("mouseenter", () => stage.classList.add("hov" + i));
      b.addEventListener("mouseleave", () => stage.classList.remove("hov" + i));
      stage.appendChild(b);
      onIn(card, () => count(nb, c.v, 1500));
    });
    card.appendChild(stage);
    hero.appendChild(card);
  }

  window.renderSkills = function (cfg) {
    const sec = document.getElementById("skills");
    if (!sec || !cfg || !(cfg.categories || []).length) { if (sec) sec.hidden = true; return; }
    sec.hidden = false;

    document.getElementById("skillsNum").textContent = cfg.number || "";
    document.getElementById("skillsTitle").textContent = cfg.title || "Skills";
    document.getElementById("skillsHeadIcon").innerHTML = ICONS[cfg.icon] || ICONS.tools;
    document.getElementById("skillsIntro").textContent = cfg.intro || "";
    renderServices(cfg.services);
    orbit(cfg);
    radar(cfg);

    const filterWrap = document.getElementById("skillsFilter");
    const grid = document.getElementById("skillsGrid");
    const filters = [{ id: "all", label: cfg.allLabel || "All Skills" }]
      .concat(cfg.categories.map((c) => ({ id: c.id, label: c.title })));

    filters.forEach((f, i) => {
      const b = el("button", "skf-btn glow-border" + (i === 0 ? " active" : ""));
      b.type = "button";
      b.appendChild(el("span", "", f.label));
      b.addEventListener("click", () => {
        filterWrap.querySelectorAll(".skf-btn").forEach((x) => x.classList.remove("active"));
        b.classList.add("active");
        let k = 0;
        grid.querySelectorAll(".skill-card").forEach((c) => {
          const on = f.id === "all" || c.dataset.category === f.id;
          c.style.display = on ? "" : "none";
          if (on) { c.classList.remove("refl"); void c.offsetWidth; c.style.setProperty("--i", k++ % 6); c.classList.add("refl"); }
        });
      });
      filterWrap.appendChild(b);
    });

    cfg.categories.forEach((cat) => {
      const card = el("div", "skill-card glow-border");
      card.dataset.category = cat.id;
      if ((cat.items || []).length >= 10) card.classList.add("wide");
      card.appendChild(el("div", "card-topbar"));
      card.appendChild(el("i", "sk-glow"));
      card.style.setProperty("--i", cat.__i = (grid.children.length % 3));

      const icon = el("div", "skc-icon"); icon.innerHTML = ICONS[cat.icon] || ICONS.code;
      const head = el("div", "skc-head", "", [
        icon,
        el("div", "skc-txt", "", [el("div", "skc-title", cat.title), el("div", "skc-desc", cat.description)]),
      ]);
      const pc = cat.items.map((x) => x.percent).filter((x) => x != null);
      if (pc.length) {
        const avg = Math.round(pc.reduce((a, b) => a + b, 0) / pc.length), an = el("b", "", "0");
        const av = el("div", "skc-avg", "", [el("i"), el("span", "", "", [an, document.createTextNode("%")])]);
        av.title = "Average level";
        head.appendChild(av);
        onIn(card, () => { av.style.setProperty("--ep", avg); count(an, avg, 1400); });
      } else onIn(card);
      card.appendChild(head);
      spot(card);

      const pills = el("div", "skc-pills");
      cat.items.forEach((it, pi) => {
        const p = el("div", "skc-pill"); p.style.setProperty("--p", pi);
        p.appendChild(it.logo ? logo(it.logo, "skc-pill-logo") : el("span", "skc-pill-icon"));
        p.appendChild(el("span", "", it.name));
        pills.appendChild(p);
      });
      card.appendChild(pills);

      const btn = el("button", "skc-detail-btn glow-border");
      btn.type = "button";
      btn.innerHTML = ICONS.eye;
      btn.appendChild(el("span", "", cfg.detailLabel || "Detail View"));
      btn.addEventListener("click", () => { hidePop(); openModal(cat); });   // click: big popup in the middle, closes with x / backdrop / Esc
      if (canHover) {                                                  // mouse over the card: small popup right on that card
        let t = null;
        card.addEventListener("mouseenter", () => { clearTimeout(t); t = setTimeout(() => showPop(card, cat), 100); });
        card.addEventListener("mouseleave", () => { clearTimeout(t); hidePop(); });
      }
      card.appendChild(btn);

      grid.appendChild(card);
    });
  };

  // ---- Services (below the skills) ----
  function renderServices(sv) {
    const box = document.getElementById("services");
    if (!box || !sv || !(sv.items || []).length) { if (box) box.hidden = true; return; }
    box.hidden = false;
    document.getElementById("servicesTitle").textContent = sv.title || "Services";
    onIn(box.querySelector(".sub-sec-head"));
    document.getElementById("servicesHeadIcon").innerHTML = ICONS[sv.icon] || ICONS.tools;
    const wrap = document.getElementById("servicesList");
    wrap.textContent = "";
    sv.items.forEach((it) => {
      const icon = el("div", "service-icon"); icon.innerHTML = ICONS[it.icon] || ICONS.spark;
      icon.appendChild(el("i", "service-orbit"));
      const sc = el("div", "service-card glow-border", "", [
        el("div", "card-topbar"), el("i", "sk-glow"), icon, el("div", "service-title", it.title), el("div", "service-desc", it.description),
      ]);
      sc.style.setProperty("--i", wrap.children.length);
      onIn(sc); spot(sc); tilt(sc);
      wrap.appendChild(sc);
    });
  }

  // ---- rows with animated bars (used by both popups) ----
  function buildRows(cat, parent) {
    const fills = [];
    cat.items.forEach((it) => {
      const left = el("div", "skr-left", "", [
        it.logo ? logo(it.logo, "skr-logo") : el("div", "skr-logo-fallback"),
        el("span", "skr-name", it.name),
      ]);
      const right = el("div", "skr-right");
      if (it.tag) right.appendChild(el("span", "skr-tag", it.tag));
      right.appendChild(el("span", "skr-pct", (it.percent || 0) + "%"));
      const fill = el("div", "skr-bar-fill");
      parent.appendChild(el("div", "skill-row", "", [el("div", "skr-top", "", [left, right]), el("div", "skr-bar", "", [fill])]));
      fills.push([fill, it.percent || 0]);
    });
    fills.forEach(([n]) => (n.style.width = "0%"));
    void parent.offsetWidth;
    setTimeout(() => fills.forEach(([n, p]) => (n.style.width = p + "%")), 60);
  }

  // ---- Small popup that opens on top of the hovered card ----
  let pop = null;
  function hidePop() { if (pop) { pop.remove(); pop = null; } }
  function showPop(card, cat) {
    hidePop();
    const grid = card.parentElement;
    pop = el("div", "skill-pop");
    const rows = el("div", "skill-pop-rows");
    pop.appendChild(rows);
    // sits right above the "Detail View" button (covers the card's top part), so the button stays visible and clickable
    const g = grid.getBoundingClientRect(), c = card.getBoundingClientRect();
    const btn = card.querySelector(".skc-detail-btn").getBoundingClientRect();
    const bottomY = btn.top - g.top - 10;                       // popup's bottom edge
    pop.style.left = (c.left - g.left) + "px";
    pop.style.width = c.width + "px";
    pop.style.minHeight = (bottomY - (c.top - g.top)) + "px";   // at least as tall as the part of the card above the button
    grid.appendChild(pop);
    buildRows(cat, rows);
    pop.style.top = (bottomY - pop.offsetHeight) + "px";       // taller lists grow upwards
  }

  // ---- Big popup (click) ----
  function openModal(cat) {
    const m = document.getElementById("skillModal");
    document.getElementById("skillModalIcon").innerHTML = ICONS[cat.icon] || ICONS.code;
    document.getElementById("skillModalTitle").textContent = cat.title;
    document.getElementById("skillModalDesc").textContent = cat.description;
    const rows = document.getElementById("skillModalRows");
    rows.textContent = "";
    m.classList.add("open"); m.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    m.querySelector(".skill-modal-scroll").scrollTop = 0;
    buildRows(cat, rows);
  }
  function closeModal() {
    const m = document.getElementById("skillModal");
    m.classList.remove("open"); m.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }
  document.addEventListener("DOMContentLoaded", () => {
    const b = document.getElementById("skillModalBackdrop"), c = document.getElementById("skillModalClose");
    if (b) b.addEventListener("click", closeModal);
    if (c) c.addEventListener("click", closeModal);
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeModal(); });
  });
})();
