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

  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const imgSrcs = (p) => (!p ? [] : /^(https?:|\/|assets\/)/.test(p) ? [p] : ["assets/" + p, p]);
  function setImg(img, p, onFail) {
    const list = imgSrcs(p); let k = 0;
    img.onerror = () => { if (++k < list.length) img.src = list[k]; else onFail && onFail(); };
    if (list.length) img.src = list[0]; else onFail && onFail();
  }
  const orgOf = (c) => String(c.issuer || "Other").replace(/\s*\(.*?\)/g, "").split(" / ").pop().trim();
  const pad = (n) => String(n).padStart(2, "0");

  window.renderCertificates = function (cfg) {
    const sec = document.getElementById("certificates");
    if (!sec || !cfg || !(cfg.items || []).length) return;
    sec.hidden = false;
    document.getElementById("certNum").textContent = cfg.number || "";
    document.getElementById("certTitle").textContent = cfg.title || "Certificates";
    document.getElementById("certHeadIcon").innerHTML = ICONS[cfg.icon] || ICONS.award;

    const stage = document.getElementById("czStage"), ring = document.getElementById("czRing");
    const prevB = document.getElementById("czPrev"), nextB = document.getElementById("czNext");
    prevB.innerHTML = ICONS.prev; nextB.innerHTML = ICONS.next;
    const viewB = document.getElementById("czView"), detB = document.getElementById("czDetail");
    viewB.innerHTML = ICONS.eye; viewB.appendChild(el("span", "", cfg.viewLabel || "View Certificate"));
    detB.textContent = cfg.detailLabel || "Detail View";

    // ---- filter chips (issuers with 2+ certificates, the rest grouped as "Others") ----
    const all = cfg.items, counts = {};
    all.forEach((c) => (counts[orgOf(c)] = (counts[orgOf(c)] || 0) + 1));
    const big = Object.keys(counts).filter((k) => counts[k] >= 2).sort((x, y) => counts[y] - counts[x]);
    const groupOf = (c) => (big.indexOf(orgOf(c)) > -1 ? orgOf(c) : "Others");
    const groups = [["all", "All", all.length]].concat(big.map((k) => [k, k, counts[k]]));
    const rest = all.filter((c) => groupOf(c) === "Others").length;
    if (rest && big.length) groups.push(["Others", "Others", rest]);
    const fwrap = document.getElementById("czFilter");
    if (groups.length > 2 || (groups.length === 2 && false)) groups.forEach((g, i) => {
      const b = el("button", "cz-chip" + (i === 0 ? " active" : ""), "", [el("span", "", g[1]), el("em", "", String(g[2]))]); b.type = "button";
      b.addEventListener("click", () => { fwrap.querySelectorAll(".cz-chip").forEach((x) => x.classList.remove("active")); b.classList.add("active"); build(g[0] === "all" ? all : all.filter((c) => groupOf(c) === g[0])); });
      fwrap.appendChild(b);
    }); else fwrap.style.display = "none";

    // ---- date timeline ----
    const tl = document.getElementById("czTimeline");
    const toTime = (c) => {
      const s = String(c.date || "").replace(/(\d+)(st|nd|rd|th)/g, "$1"); let t = Date.parse(s);
      if (isNaN(t)) { const y = (s.match(/\d{4}/) || [])[0]; t = y ? Date.parse(y + "-06-15") : NaN; }
      return t;
    };
    function buildTimeline() {
      if (!tl) return;
      tl.textContent = "";
      const ts = list.map(toTime), ok = ts.filter((t) => !isNaN(t));
      if (ok.length < 2) { tl.style.display = "none"; return; }
      tl.style.display = "";
      const min = Math.min.apply(null, ok), max = Math.max.apply(null, ok), span = Math.max(1, max - min);
      tl.appendChild(el("i", "cz-axis"));
      const y0 = new Date(min).getFullYear(), y1 = new Date(max).getFullYear();
      for (let y = y0; y <= y1; y++) {
        const t = Date.parse(y + "-01-01"); const p = Math.max(0, Math.min(100, (t - min) / span * 100));
        const tk = el("span", "cz-tick", String(y)); tk.style.left = (y === y0 ? 0 : p) + "%"; tl.appendChild(tk);
      }
      list.forEach((c, i) => {
        if (isNaN(ts[i])) return;
        const d = el("button", "cz-dot"); d.type = "button"; d.title = c.title + " — " + (c.date || "");
        d.style.left = ((ts[i] - min) / span * 100) + "%"; d.style.setProperty("--l", i % 3);
        d.addEventListener("click", () => { const dd = ((i - shown) % list.length + list.length) % list.length; const sh = dd > list.length / 2 ? dd - list.length : dd; target += -sh * step; idle = 0; });
        tl.appendChild(d);
      });
    }

    // ---- 3D ring ----
    let list = [], cards = [], step = 20, R = 600, W = 250, angle = 0, target = 0, idle = 0, dragging = false, shown = -1, started = false;
    const mob = () => innerWidth < 640;

    function build(items) {
      list = items; ring.textContent = ""; cards = [];
      W = mob() ? 190 : 250;
      step = 360 / list.length;
      R = Math.max(mob() ? 190 : 300, Math.round((list.length * (W + 26)) / (2 * Math.PI)));
      ring.style.setProperty("--w", W + "px"); ring.style.setProperty("--R", R + "px");
      stage.style.setProperty("--R", R + "px");
      list.forEach((c, i) => {
        const thumb = el("div", "cz-thumb"), img = document.createElement("img");
        img.alt = c.title; img.draggable = false;
        setImg(img, c.image, () => { img.remove(); const ic = el("div", "cz-fb"); ic.innerHTML = ICONS.award; ic.appendChild(el("span", "", "Image not added yet")); thumb.appendChild(ic); });
        thumb.appendChild(img);
        const seal = el("div", "cz-seal"); seal.innerHTML = '<svg viewBox="0 0 100 100"><defs><path id="czp' + i + '" d="M50,50 m-37,0 a37,37 0 1,1 74,0 a37,37 0 1,1 -74,0"/></defs><text class="t"><textPath href="#czp' + i + '" startOffset="0">CERTIFIED • VERIFIED • CERTIFIED • </textPath></text></svg><span></span>';
        seal.querySelector("span").innerHTML = ICONS.award;
        const inn = el("div", "cz-in", "", [
          el("i", "cz-shine"), el("i", "cz-holo"), thumb,
          el("div", "cz-cap", "", [el("b", "", c.title), el("span", "", orgOf(c))]),
          el("em", "cz-n", pad(i + 1)), seal,
        ]);
        const card = el("div", "cz-card", "", [inn]);
        card.addEventListener("click", () => { if (moved > 6) return; const d = ((i - shown) % list.length + list.length) % list.length; const sh = d > list.length / 2 ? d - list.length : d; if (sh !== 0) { target += -sh * step; idle = 0; } else openImage(c.image); });
        ring.appendChild(card); cards.push(card);
      });
      document.getElementById("czTotal").textContent = "/ " + pad(list.length);
      buildTimeline();
      angle = reduce ? 0 : -140; target = 0; shown = -1; idle = 0;
      ring.classList.remove("swap"); void ring.offsetWidth; ring.classList.add("swap");
      frame(true);
    }

    function setInfo(i) {
      const c = list[i]; if (!c) return;
      const info = document.getElementById("czInfo");
      info.classList.remove("flip"); void info.offsetWidth; info.classList.add("flip");
      document.getElementById("czNow").textContent = pad(i + 1);
      document.getElementById("czTitle").textContent = c.title;
      document.getElementById("czIssuer").textContent = [c.issuer, c.date].filter(Boolean).join("  ·  ");
      viewB.onclick = () => openImage(c.image);
      detB.onclick = () => openDetail(c);
    }

    function frame(force) {
      if (!list.length) return;
      angle += (target - angle) * (reduce ? 1 : 0.09);
      if (Math.abs(target - angle) < 0.01) angle = target;
      let best = 0, bd = 1e9;
      cards.forEach((card, i) => {
        const a = i * step + angle, n = ((a % 360) + 540) % 360 - 180, f = (1 + Math.cos(a * Math.PI / 180)) / 2;
        card.style.transform = "rotateY(" + a + "deg) translateZ(" + R + "px)";
        card.style.setProperty("--f", f.toFixed(3));
        card.style.zIndex = Math.round(f * 100);
        if (Math.abs(n) < bd) { bd = Math.abs(n); best = i; }
      });
      if (best !== shown) { shown = best; cards.forEach((c, i) => c.classList.toggle("front", i === best)); setInfo(best); }
    }
    let last = 0;
    (function loop(t) {
      requestAnimationFrame(loop);
      if (document.hidden) return;
      if (!dragging && !reduce) { idle += t - last; if (idle > 4200 && started) { target -= step; idle = 0; } }
      last = t; frame();
    })(0);

    const go = (d) => { target -= d * step; idle = 0; };
    prevB.addEventListener("click", () => go(-1)); nextB.addEventListener("click", () => go(1));
    stage.tabIndex = 0;
    stage.addEventListener("keydown", (e) => { if (e.key === "ArrowLeft") go(-1); if (e.key === "ArrowRight") go(1); });
    stage.addEventListener("mouseenter", () => (idle = -1e9)); stage.addEventListener("mouseleave", () => { idle = 0; cards.forEach((c) => { c.classList.remove("hot"); c.style.setProperty("--tx", "0deg"); c.style.setProperty("--ty", "0deg"); }); });

    // drag / swipe
    let sx = 0, st = 0, moved = 0;
    stage.addEventListener("pointerdown", (e) => { dragging = true; moved = 0; sx = e.clientX; st = target; stage.setPointerCapture(e.pointerId); stage.classList.add("grab"); });
    stage.addEventListener("pointermove", (e) => {
      if (!dragging) {
        const r = stage.getBoundingClientRect(); stage.style.setProperty("--my", ((e.clientY - r.top) / r.height - .5).toFixed(3));
        const f = cards[shown]; if (f && !reduce) { const q = f.getBoundingClientRect(), x = (e.clientX - q.left) / q.width, y = (e.clientY - q.top) / q.height;
          if (x >= 0 && x <= 1 && y >= 0 && y <= 1) { f.style.setProperty("--hx", x * 100 + "%"); f.style.setProperty("--hy", y * 100 + "%"); f.style.setProperty("--tx", ((.5 - y) * 14).toFixed(1) + "deg"); f.style.setProperty("--ty", ((x - .5) * 18).toFixed(1) + "deg"); f.classList.add("hot"); }
          else { f.classList.remove("hot"); f.style.setProperty("--tx", "0deg"); f.style.setProperty("--ty", "0deg"); } }
        return;
      }
      const dx = e.clientX - sx; moved = Math.max(moved, Math.abs(dx)); target = st + dx * 0.28;
    });
    const end = () => { if (!dragging) return; dragging = false; stage.classList.remove("grab"); target = Math.round(target / step) * step; idle = 0; if (moved > 6) setTimeout(() => (moved = 0), 0); };
    stage.addEventListener("pointerup", end); stage.addEventListener("pointercancel", end);

    // build when it scrolls into view so the intro spin is seen
    build(all);
    if ("IntersectionObserver" in window) new IntersectionObserver((es, o) => es.forEach((x) => { if (x.isIntersecting) { started = true; sec.classList.add("in"); o.disconnect(); } }), { threshold: .2 }).observe(stage);
    else { started = true; sec.classList.add("in"); }
    let rw = innerWidth; addEventListener("resize", () => { if (innerWidth !== rw) { rw = innerWidth; build(list); } });
  };

  // ---- full image ----
  function openImage(src) {
    const m = document.getElementById("certModal"), img = document.getElementById("certImage"), fb = document.getElementById("certFallback");
    img.style.display = "none"; fb.style.display = "none";
    if (src) { img.onload = () => (img.style.display = "block"); setImg(img, src, () => (fb.style.display = "block")); }
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
