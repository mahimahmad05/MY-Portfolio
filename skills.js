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

  window.renderSkills = function (cfg) {
    const sec = document.getElementById("skills");
    if (!sec || !cfg || !(cfg.categories || []).length) { if (sec) sec.hidden = true; return; }
    sec.hidden = false;

    document.getElementById("skillsNum").textContent = cfg.number || "";
    document.getElementById("skillsTitle").textContent = cfg.title || "Skills";
    document.getElementById("skillsHeadIcon").innerHTML = ICONS[cfg.icon] || ICONS.tools;
    document.getElementById("skillsIntro").textContent = cfg.intro || "";
    renderServices(cfg.services);

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
        grid.querySelectorAll(".skill-card").forEach((c) => {
          c.style.display = f.id === "all" || c.dataset.category === f.id ? "" : "none";
        });
      });
      filterWrap.appendChild(b);
    });

    cfg.categories.forEach((cat) => {
      const card = el("div", "skill-card glow-border");
      card.dataset.category = cat.id;
      card.appendChild(el("div", "card-topbar"));

      const icon = el("div", "skc-icon"); icon.innerHTML = ICONS[cat.icon] || ICONS.code;
      card.appendChild(el("div", "skc-head", "", [
        icon,
        el("div", "", "", [el("div", "skc-title", cat.title), el("div", "skc-desc", cat.description)]),
      ]));

      const pills = el("div", "skc-pills");
      cat.items.forEach((it) => {
        const p = el("div", "skc-pill");
        p.appendChild(it.logo ? logo(it.logo, "skc-pill-logo") : el("span", "skc-pill-icon"));
        p.appendChild(el("span", "", it.name));
        pills.appendChild(p);
      });
      card.appendChild(pills);

      const btn = el("button", "skc-detail-btn glow-border");
      btn.type = "button";
      btn.innerHTML = ICONS.eye;
      btn.appendChild(el("span", "", cfg.detailLabel || "Detail View"));
      btn.addEventListener("click", () => openModal(cat));
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
    document.getElementById("servicesHeadIcon").innerHTML = ICONS[sv.icon] || ICONS.tools;
    const wrap = document.getElementById("servicesList");
    wrap.textContent = "";
    sv.items.forEach((it) => {
      const icon = el("div", "service-icon"); icon.innerHTML = ICONS[it.icon] || ICONS.spark;
      wrap.appendChild(el("div", "service-card glow-border", "", [
        el("div", "card-topbar"), icon, el("div", "service-title", it.title), el("div", "service-desc", it.description),
      ]));
    });
  }

  // ---- Detail popup with animated bars ----
  function openModal(cat) {
    const m = document.getElementById("skillModal");
    document.getElementById("skillModalIcon").innerHTML = ICONS[cat.icon] || ICONS.code;
    document.getElementById("skillModalTitle").textContent = cat.title;
    document.getElementById("skillModalDesc").textContent = cat.description;

    const rows = document.getElementById("skillModalRows");
    rows.textContent = "";
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
      rows.appendChild(el("div", "skill-row", "", [el("div", "skr-top", "", [left, right]), el("div", "skr-bar", "", [fill])]));
      fills.push([fill, it.percent || 0]);
    });

    m.classList.add("open"); m.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    m.querySelector(".skill-modal-scroll").scrollTop = 0;
    fills.forEach(([n]) => (n.style.width = "0%"));
    void rows.offsetWidth;
    setTimeout(() => fills.forEach(([n, p]) => (n.style.width = p + "%")), 60);
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
