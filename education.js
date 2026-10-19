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

  window.renderEducation = function (cfg) {
    const root = document.getElementById("education");
    if (!root || !cfg) return;
    root.hidden = false;
    document.getElementById("eduNum").textContent = cfg.number || "";
    document.getElementById("eduTitle").textContent = cfg.title || "Education";
    document.getElementById("eduHeadIcon").innerHTML = ICONS[cfg.icon] || ICONS.gradcap;

    const list = document.getElementById("eduList");
    (cfg.items || []).forEach((e) => list.appendChild(e.type === "university" ? uniCard(e, cfg) : card(e, cfg)));

    sub("eduLang", cfg.languages, ICONS.globe, "langList", (l) => langCard(l));
    sub("eduValues", cfg.values, ICONS.shield, "valuesList", (v) => valueCard(v));
  };

  function sub(id, c, fallbackIcon, listId, make) {
    const box = document.getElementById(id);
    if (!box || !c || !(c.items || []).length) return;
    box.hidden = false;
    box.querySelector(".sub-title").textContent = c.title;
    box.querySelector(".sub-icon").innerHTML = ICONS[c.icon] || fallbackIcon;
    const wrap = document.getElementById(listId);
    c.items.forEach((x) => wrap.appendChild(make(x)));
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
    const gpa = el("div", "edu-gpa", "", [el("span", "edu-gpa-num", e.gpa), el("span", "edu-gpa-label", "GPA")]);
    return el("div", "edu-card", "", [
      bar(),
      el("div", "edu-top", "", [el("span", "edu-badge", e.level), gpa]),
      head(e), el("div", "edu-session", e.session), btn,
    ]);
  }

  function uniCard(e, cfg) {
    const num = el("span", "edu-gpa-num", "0.00");
    const gpa = el("div", "edu-gpa", "", [num, el("span", "edu-gpa-label", "CGPA")]);
    let saved = null;
    try { saved = JSON.parse(localStorage.getItem("semesterGPAs")); } catch (x) {}
    const total = e.totalSemesters || 8, vals = [];
    for (let i = 0; i < total; i++) {
      if (saved && saved[i] != null) vals.push(saved[i]);
      else if (e.semesterGPAs && e.semesterGPAs[i] != null) vals.push(e.semesterGPAs[i]);
      else vals.push(null);
    }
    function recalc() {
      const f = vals.filter((v) => v !== null && v !== "" && !isNaN(v));
      num.textContent = (f.length ? f.reduce((a, b) => a + Number(b), 0) / f.length : 0).toFixed(2);
      try { localStorage.setItem("semesterGPAs", JSON.stringify(vals)); } catch (x) {}
    }
    const grid = el("div", "sem-grid");
    for (let i = 0; i < total; i++) {
      const inp = document.createElement("input");
      inp.type = "number"; inp.min = "0"; inp.max = "4"; inp.step = "0.01"; inp.className = "sem-input"; inp.placeholder = "—";
      inp.setAttribute("aria-label", "Semester " + (i + 1) + " GPA");
      if (vals[i] !== null) inp.value = vals[i];
      inp.addEventListener("input", () => { const v = inp.value.trim(); vals[i] = v === "" ? null : parseFloat(v); recalc(); });
      grid.appendChild(el("div", "sem-cell", "", [el("label", "sem-label", "Sem " + (i + 1)), inp]));
    }
    recalc();
    return el("div", "edu-card", "", [
      bar(),
      el("div", "edu-top", "", [el("span", "edu-badge", e.level), gpa]),
      head(e), el("div", "edu-session", e.session), grid,
      el("p", "sem-hint", cfg.semesterHint || ""),
    ]);
  }

  function langCard(l) {
    const fill = el("div", "lang-bar-fill");
    const c = el("div", "lang-card", "", [
      bar(),
      el("div", "lang-top", "", [
        el("span", "lang-flag", l.flag || ""),
        el("div", "", "", [el("div", "lang-name", l.name), el("div", "lang-level", l.level)]),
      ]),
      el("div", "lang-bar", "", [fill]),
      el("div", "lang-pct", (l.percent || 0) + "%"),
    ]);
    requestAnimationFrame(() => setTimeout(() => (fill.style.width = (l.percent || 0) + "%"), 150));
    return c;
  }

  function valueCard(v) {
    const ic = el("div", "value-icon"); ic.innerHTML = ICONS[v.icon] || ICONS.spark;
    return el("div", "value-card", "", [bar(), ic, el("div", "value-title", v.title), el("div", "value-desc", v.description)]);
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
