// Education page: Education cards (+ editable semester GPAs -> CGPA), Languages, Values.
// Content: data.json -> "education". Logos / certificate images go in assets/ (e.g. assets/diu-logo.jpg).
(function () {
  const S = (p) => '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' + p + "</svg>";
  const ICONS = {
    gradcap: S('<path d="M22 10L12 5 2 10l10 5 10-5z"/><path d="M6 12.5V17c0 1.5 2.7 3 6 3s6-1.5 6-3v-4.5"/><path d="M22 10v6"/>'),
    eye: S('<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>'),
    globe: S('<circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>'),
    shield: S('<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>'),
    target: S('<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>'),
    handshake: S('<path d="M11 17l-2.5-2.5a1.5 1.5 0 0 1 0-2.12l4.38-4.38a1.5 1.5 0 0 1 2.12 0L21 14"/><path d="M13 19l1.5 1.5a1.5 1.5 0 0 0 2.12 0l4.38-4.38"/><path d="M8.5 14.5L3 9l3-3 5 5"/>'),
    spark: S('<path d="M12 2l2.4 6.6L21 11l-6.6 2.4L12 20l-2.4-6.6L3 11l6.6-2.4L12 2z"/>'),
    compass: S('<circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/>'),
    rocket: S('<path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 19 3c0 2.5-.5 6.5-3 9a22 22 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/>'),
  };
  function el(tag, cls, text, kids) {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null && text !== "") n.textContent = text;
    (kids || []).forEach((k) => n.appendChild(k));
    return n;
  }
  const bar = () => el("div", "card-topbar");
  const lock = (on) => (document.body.style.overflow = on ? "hidden" : "");

  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const nums = (s) => (String(s || "").match(/\d{4}/g) || []).map(Number);

  // run fn once when node scrolls into view (adds .in)
  const io = "IntersectionObserver" in window ? new IntersectionObserver((es) => es.forEach((x) => {
    if (x.isIntersecting) { io.unobserve(x.target); x.target.classList.add("in"); (x.target._in || []).forEach((f) => f()); }
  }), { threshold: 0.18 }) : null;
  function onIn(n, fn) { (n._in = n._in || []).push(fn); if (io) io.observe(n); else { n.classList.add("in"); fn(); } return n; }

  function count(node, to, dec, dur) {
    if (reduce) { node.textContent = to.toFixed(dec); return; }
    const t0 = performance.now();
    (function f(t) { const k = Math.min(1, (t - t0) / (dur || 1200)), e = 1 - Math.pow(1 - k, 3); node.textContent = (to * e).toFixed(dec); if (k < 1) requestAnimationFrame(f); })(t0);
  }
  function tilt(card) {
    if (reduce) return;
    card.addEventListener("mousemove", (ev) => {
      const r = card.getBoundingClientRect(), x = (ev.clientX - r.left) / r.width, y = (ev.clientY - r.top) / r.height;
      card.style.setProperty("--mx", x * 100 + "%"); card.style.setProperty("--my", y * 100 + "%");
      card.style.setProperty("--ry", (x - .5) * 7 + "deg"); card.style.setProperty("--rx", (.5 - y) * 7 + "deg");
    });
    card.addEventListener("mouseleave", () => { card.style.setProperty("--ry", "0deg"); card.style.setProperty("--rx", "0deg"); });
  }
  function ring(size, label, sub) {
    const num = el("b", "gr-num", "0.00");
    const r = el("div", "gr " + size, "", [el("i", "gr-arc"), el("div", "gr-in", "", [num, el("span", "gr-lab", label)])]);
    if (sub) r.appendChild(el("span", "gr-sub", sub));
    return { r, num };
  }
  function setRing(r, pct) { r.style.setProperty("--ep", Math.max(0, Math.min(100, pct))); }

  window.renderEducation = function (cfg) {
    const root = document.getElementById("education");
    if (!root || !cfg) return;
    root.hidden = false;
    document.getElementById("eduNum").textContent = cfg.number || "";
    document.getElementById("eduTitle").textContent = cfg.title || "Education";
    document.getElementById("eduHeadIcon").innerHTML = ICONS[cfg.icon] || ICONS.gradcap;

    const items = cfg.items || [];

    const list = document.getElementById("eduList");
    items.forEach((e, i) => list.appendChild(stop(e, cfg, i)));
    journeyScroll(list);

    sub("eduLang", cfg.languages, ICONS.globe, "langList", (l) => langCard(l));
    sub("eduValues", cfg.values, ICONS.shield, "valuesList", (v, i) => valueCard(v, i));
  };

  function hero(cfg, items) {
    const box = document.getElementById("eduHero"); if (!box) return;
    const yrs = items.flatMap((e) => nums(e.session)); const now = new Date().getFullYear();
    const span = yrs.length ? Math.max(1, now - Math.min.apply(null, yrs)) : 0;
    const perfect = items.filter((e) => e.type !== "university" && parseFloat(e.gpa) >= 5).length;
    const tag = el("p", "eh-tag"); box.appendChild(tag);
    const line = cfg.tagline || "From SSC to Software Engineering — one step at a time.";
    if (reduce) tag.textContent = line; else { let i = 0; tag.classList.add("typing"); const t = setInterval(() => { tag.textContent = line.slice(0, ++i); if (i >= line.length) { clearInterval(t); tag.classList.remove("typing"); } }, 38); }
    const tiles = [[items.length, "Institutions"], [span, "Years of learning"], [perfect, "Perfect 5.00 GPAs"]].filter((x) => x[0]);
    const row = el("div", "eh-row");
    tiles.forEach((x) => { const n = el("b", "", "0"); const t = el("div", "eh-tile", "", [n, el("span", "", x[1])]); row.appendChild(t); onIn(t, () => count(n, x[0], 0, 1100)); });
    box.appendChild(row);
  }

  function journeyScroll(list) {
    const fill = list.querySelector(".jr-fill");
    function upd() { const r = list.getBoundingClientRect(); const p = (innerHeight * .65 - r.top) / r.height; fill.style.transform = "scaleY(" + Math.max(0, Math.min(1, p)) + ")"; }
    addEventListener("scroll", upd, { passive: true }); addEventListener("resize", upd); upd();
  }

  function stop(e, cfg, i) {
    const uni = e.type === "university";
    const y = nums(e.session);
    const when = /ongoing|present|now/i.test(e.session || "") ? "NOW" : y.length ? (y[0] + (y[y.length - 1] !== y[0] ? " – " + y[y.length - 1] : "")) : "";
    const node = el("div", "jr-node" + (uni ? " live" : ""), "", [el("i")]);
    const lab = el("div", "jr-when", "", [el("span", "", when), el("em", "", e.level || "")]);
    const c = uni ? uniCard(e, cfg) : card(e, cfg);
    const it = el("div", "jr-item " + (i % 2 ? "r" : "l"), "", [c, node, lab]);
    onIn(it, () => {});
    return it;
  }

  function sub(id, c, fallbackIcon, listId, make) {
    const box = document.getElementById(id);
    if (!box || !c || !(c.items || []).length) return;
    box.hidden = false;
    box.querySelector(".sub-title").textContent = c.title;
    box.querySelector(".sub-icon").innerHTML = ICONS[c.icon] || fallbackIcon;
    const wrap = document.getElementById(listId);
    c.items.forEach((x, i) => wrap.appendChild(make(x, i)));
    onIn(box.querySelector(".sub-head"), () => {});
  }

  function head(e) {
    const icon = el("div", "edu-icon"); icon.innerHTML = ICONS.gradcap;
    const row = el("div", "edu-head-row", "", [icon]);
    if (e.logo) {
      const img = document.createElement("img");
      img.className = "edu-logo"; img.alt = e.institution + " logo"; img.src = e.logo;
      img.onerror = () => img.remove();
      row.appendChild(img);
    }
    row.appendChild(el("h4", "edu-inst", e.institution));
    return row;
  }

  function card(e, cfg) {
    const btn = el("button", "edu-cert-btn"); btn.type = "button";
    btn.innerHTML = ICONS.eye; btn.appendChild(el("span", "", cfg.viewLabel || "View Certificate"));
    btn.addEventListener("click", () => openImage(e.certificate));
    const g = ring("sm", "GPA"); const val = parseFloat(e.gpa) || 0;
    const c = el("div", "edu-card", "", [
      el("i", "ec-glow"),
      el("div", "edu-top", "", [el("span", "edu-badge", e.level), g.r]),
      head(e), el("div", "edu-session", e.session), btn,
    ]);
    onIn(c, () => { setRing(g.r, val / 5 * 100); count(g.num, val, 2, 1400); });
    tilt(c);
    return c;
  }

  function uniCard(e, cfg) {
    const g = ring("lg", "CGPA", "out of 4.00");
    let saved = null;
    try { saved = JSON.parse(localStorage.getItem("semesterGPAs")); } catch (x) {}
    const total = e.totalSemesters || 8, vals = [], fills = [];
    for (let i = 0; i < total; i++) {
      if (saved && saved[i] != null) vals.push(saved[i]);
      else if (e.semesterGPAs && e.semesterGPAs[i] != null) vals.push(e.semesterGPAs[i]);
      else vals.push(null);
    }
    let shown = false, cur = 0;
    const avg = () => { const f = vals.filter((v) => v !== null && v !== "" && !isNaN(v)); return f.length ? f.reduce((a, b) => a + Number(b), 0) / f.length : 0; };
    function paint() {
      if (!shown) return;
      const a = avg(); setRing(g.r, a / 4 * 100);
      g.num.textContent = a.toFixed(2); cur = a;
      vals.forEach((v, i) => fills[i].style.setProperty("--h", (v === null || isNaN(v) ? 0 : Math.min(4, v) / 4 * 100) + "%"));
    }
    function save() { try { localStorage.setItem("semesterGPAs", JSON.stringify(vals)); } catch (x) {} }
    const grid = el("div", "sem-grid");
    for (let i = 0; i < total; i++) {
      const inp = document.createElement("input");
      inp.type = "number"; inp.min = "0"; inp.max = "4"; inp.step = "0.01"; inp.className = "sem-input"; inp.placeholder = "—";
      inp.setAttribute("aria-label", "Semester " + (i + 1) + " GPA");
      if (vals[i] !== null) inp.value = vals[i];
      inp.addEventListener("input", () => { const v = inp.value.trim(); vals[i] = v === "" ? null : parseFloat(v); save(); paint(); });
      const fill = el("i", "sem-fill"); fills.push(fill);
      grid.appendChild(el("div", "sem-cell", "", [el("div", "sem-bar", "", [fill]), inp, el("label", "sem-label", "S" + (i + 1))]));
    }
    const live = el("span", "edu-live", "Ongoing");
    const body = el("div", "uni-body", "", [g.r, el("div", "uni-sem", "", [el("div", "uni-sem-title", "Semester-wise GPA"), grid])]);
    const c = el("div", "edu-card uni", "", [
      el("i", "ec-glow"),
      el("div", "edu-top", "", [el("span", "edu-badge", e.level), live]),
      head(e), el("div", "edu-session", e.session), body,
      el("p", "sem-hint", cfg.semesterHint || ""),
    ]);
    onIn(c, () => { shown = true; const a = avg(); paint(); g.num.textContent = "0.00"; count(g.num, a, 2, 1500); });
    tilt(c);
    return c;
  }

  function langCard(l) {
    const p = l.percent || 0, num = el("b", "", "0");
    const dial = el("div", "lg-dial", "", [el("i", "lg-arc"), el("div", "lg-in", "", [el("span", "lg-flag", l.flag || ""), el("span", "lg-pct", "", [num, document.createTextNode("%")])])]);
    const c = el("div", "lang-card", "", [el("i", "ec-glow"), dial, el("div", "lg-txt", "", [el("div", "lang-name", l.name), el("div", "lang-level", l.level)])]);
    onIn(c, () => { dial.style.setProperty("--ep", p); count(num, p, 0, 1500); });
    tilt(c);
    return c;
  }

  function valueCard(v, i) {
    const ic = el("div", "value-icon"); ic.innerHTML = ICONS[v.icon] || ICONS.spark;
    const c = el("div", "value-card", "", [el("i", "ec-glow"), el("span", "value-idx", String((i || 0) + 1).padStart(2, "0")), el("div", "value-ic-wrap", "", [el("i", "value-orbit"), ic]), el("div", "value-title", v.title), el("div", "value-desc", v.description)]);
    c.style.transitionDelay = (i % 3) * 90 + "ms";
    onIn(c, () => {});
    tilt(c);
    return c;
  }

  // ---- certificate image popup ----
  function openImage(src) {
    const m = document.getElementById("eduModal"), img = document.getElementById("eduImage"), fb = document.getElementById("eduFallback");
    img.style.display = "none"; fb.style.display = "none";
    if (src) { img.onload = () => (img.style.display = "block"); img.onerror = () => (fb.style.display = "block"); img.src = src; }
    else fb.style.display = "block";
    m.classList.add("open"); lock(true);
  }
  function closeImage() { document.getElementById("eduModal").classList.remove("open"); lock(false); }
  document.addEventListener("DOMContentLoaded", () => {
    const on = (id) => { const n = document.getElementById(id); if (n) n.addEventListener("click", closeImage); };
    on("eduBackdrop"); on("eduClose");
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeImage(); });
  });
})();
