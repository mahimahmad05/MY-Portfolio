// Certificates section. Content: data.json -> "certificates" { number, title, icon, perPage, items[] }.
// Click a card = full image. "Detail View" = details popup. Images go in assets/certificates/.
(function () {
  const I = (p) => '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' + p + "</svg>";
  const ICONS = {
    award: I('<circle cx="12" cy="8" r="6"/><path d="M8.21 13.89L7 23l5-3 5 3-1.21-9.12"/>'),
    eye:   I('<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>'),
    prev:  I('<polyline points="15 18 9 12 15 6"/>'),
    next:  I('<polyline points="9 18 15 12 9 6"/>'),
  };
  function el(tag, cls, text, kids) {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text) n.textContent = text;
    (kids || []).forEach((k) => n.appendChild(k));
    return n;
  }
  const lock = (on) => (document.body.style.overflow = on ? "hidden" : "");

  window.renderCertificates = function (cfg) {
    const sec = document.getElementById("certificates");
    if (!sec || !cfg || !(cfg.items || []).length) return;
    sec.hidden = false;
    document.getElementById("certNum").textContent = cfg.number || "";
    document.getElementById("certTitle").textContent = cfg.title || "Certificates";
    document.getElementById("certHeadIcon").innerHTML = ICONS[cfg.icon] || ICONS.award;

    const track = document.getElementById("certTrack"), dots = document.getElementById("certDots");
    const prev = document.getElementById("certPrev"), next = document.getElementById("certNext");
    prev.innerHTML = ICONS.prev; next.innerHTML = ICONS.next;

    const per = cfg.perPage || 6, pages = [];
    for (let i = 0; i < cfg.items.length; i += per) pages.push(cfg.items.slice(i, i + per));
    pages.forEach((list, i) => {
      const pg = el("div", "cert-page");
      list.forEach((c) => pg.appendChild(card(c)));
      track.appendChild(pg);
      const d = el("button", "cert-dot"); d.type = "button"; d.setAttribute("aria-label", "Page " + (i + 1));
      d.addEventListener("click", () => go(i)); dots.appendChild(d);
    });

    let cur = 0;
    function go(i) {
      cur = Math.max(0, Math.min(i, pages.length - 1));
      track.style.transform = "translateX(-" + cur * 100 + "%)";
      dots.querySelectorAll(".cert-dot").forEach((d, k) => d.classList.toggle("active", k === cur));
      prev.disabled = cur === 0; next.disabled = cur === pages.length - 1;
    }
    prev.addEventListener("click", () => go(cur - 1));
    next.addEventListener("click", () => go(cur + 1));
    if (pages.length <= 1) document.getElementById("certNav").style.display = "none";
    go(0);
  };

  function card(c) {
    const thumb = el("div", "cert-thumb");
    const img = document.createElement("img");
    img.src = c.image || ""; img.alt = c.title; img.loading = "lazy";
    img.onerror = () => {
      img.remove();
      const ic = el("div", "cert-thumb-icon"); ic.innerHTML = ICONS.award;
      thumb.appendChild(el("div", "cert-thumb-fallback", "", [ic, document.createTextNode("Image not added yet")]));
    };
    thumb.appendChild(img);

    const btn = el("button", "cert-detail-btn"); btn.type = "button";
    btn.innerHTML = ICONS.eye; btn.appendChild(el("span", "", "Detail View"));
    btn.addEventListener("click", (e) => { e.stopPropagation(); openDetail(c); });

    const info = el("div", "cert-info", "", [
      el("div", "cert-title", c.title),
      el("div", "cert-issuer", [c.issuer, c.date].filter(Boolean).join(" · ")),
      btn,
    ]);
    const a = el("div", "cert-card", "", [el("div", "card-topbar"), thumb, info]);
    a.title = c.title;
    a.addEventListener("click", () => openImage(c.image));
    return a;
  }

  // ---- full image ----
  function openImage(src) {
    const m = document.getElementById("certModal"), img = document.getElementById("certImage"), fb = document.getElementById("certFallback");
    img.style.display = "none"; fb.style.display = "none";
    if (src) { img.onload = () => (img.style.display = "block"); img.onerror = () => (fb.style.display = "block"); img.src = src; }
    else fb.style.display = "block";
    m.classList.add("open"); lock(true);
  }
  function closeImage() { document.getElementById("certModal").classList.remove("open"); lock(false); }

  // ---- details ----
  function openDetail(c) {
    const m = document.getElementById("certDetailModal");
    document.getElementById("certDetailIcon").innerHTML = ICONS.award;
    document.getElementById("certDetailTitle").textContent = c.title || "";
    document.getElementById("certDetailDesc").textContent = c.issuer || "";
    const rows = document.getElementById("certDetailRows"); rows.textContent = "";
    [["Issuer Name", c.issuer], ["Certificate Name", c.title], ["Certificate ID", c.certificateId], ["Date", c.date]].forEach(([l, v]) => {
      if (v) rows.appendChild(el("div", "", "", [el("div", "cx-label", l), el("div", "cx-value", v)]));
    });
    m.classList.add("open"); m.setAttribute("aria-hidden", "false"); lock(true);
    m.querySelector(".cx-scroll").scrollTop = 0;
  }
  function closeDetail() {
    const m = document.getElementById("certDetailModal");
    m.classList.remove("open"); m.setAttribute("aria-hidden", "true"); lock(false);
  }

  document.addEventListener("DOMContentLoaded", () => {
    const on = (id, fn) => { const n = document.getElementById(id); if (n) n.addEventListener("click", fn); };
    on("certBackdrop", closeImage); on("certClose", closeImage);
    on("certDetailBackdrop", closeDetail); on("certDetailClose", closeDetail);
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") { closeImage(); closeDetail(); } });
  });
})();
