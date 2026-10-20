// About section: intro + typewriter, tech marquee, about card. Content: data.json -> "about".
// Used on about.html AND under the hero on the home page (scroll down to see it; the nav "About" pill lights up).
(function () {
  const S = (p) => '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' + p + "</svg>";
  const ICONS = {
    message: S('<path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>'),
    download: S('<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>'),
    spark: S('<path d="M12 2l2.4 6.6L21 11l-6.6 2.4L12 20l-2.4-6.6L3 11l6.6-2.4L12 2z"/>'),
    code: S('<polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>'),
    user: S('<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>'),
  };
  function el(tag, cls, text, kids) {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null && text !== "") n.textContent = text;
    (kids || []).forEach((k) => n.appendChild(k));
    return n;
  }
  const $ = (id) => document.getElementById(id);

  window.renderAbout = function (cfg) {
    const sec = $("about");
    if (!sec || !cfg) return;
    sec.hidden = false;
    const bg = $("abBgImg");
    if (bg && cfg.photo) { bg.onload = () => $("about").classList.add("has-photo"); bg.onerror = () => bg.remove(); bg.src = cfg.photo; }
    $("abEyeIcon").innerHTML = ICONS.spark; $("abTwIcon").innerHTML = ICONS.code;
    $("abEyebrow").textContent = cfg.eyebrow || "";
    $("abName").textContent = cfg.name || "";
    typewriter($("abType"), cfg.roles || []);

    const tag = $("abTagline");
    (cfg.tagline || []).forEach((s) => tag.appendChild(s.hl ? el("span", "hl " + s.hl, s.text) : document.createTextNode(s.text)));

    const cta = $("abCta");
    (cfg.buttons || []).forEach((b, i) => {
      const a = el("a", "ab-btn" + (i === 0 ? " primary" : ""));
      a.href = b.href; if (b.download) a.setAttribute("download", "");
      a.innerHTML = ICONS[b.icon] || ""; a.appendChild(el("span", "", b.label));
      cta.appendChild(a);
    });

    marquee(cfg.tech || []);
    card(cfg.card);
    spy();
  };

  function typewriter(target, roles) {
    if (!target || !roles.length) return;
    let r = 0, c = 0, del = false;
    (function tick() {
      const cur = roles[r];
      if (!del) { c++; target.textContent = cur.slice(0, c); if (c === cur.length) { del = true; return setTimeout(tick, 1400); } setTimeout(tick, 70); }
      else { c--; target.textContent = cur.slice(0, c); if (c === 0) { del = false; r = (r + 1) % roles.length; return setTimeout(tick, 300); } setTimeout(tick, 35); }
    })();
  }

  function marquee(items) {
    const wrap = $("abMarquee"), track = $("abTrack");
    if (!items.length) { wrap.hidden = true; return; }
    const make = (t) => {
      const img = document.createElement("img");
      img.src = t.logo; img.alt = ""; img.loading = "lazy";
      img.onerror = () => img.remove();
      return el("div", "ab-tech", "", [img, el("span", "", t.name)]);
    };
    items.forEach((t) => track.appendChild(make(t)));
    items.forEach((t) => { const x = make(t); x.setAttribute("aria-hidden", "true"); track.appendChild(x); });

    // Scroll with JS (not CSS) so it keeps moving even if the computer has "reduce animations" turned on.
    let pos = 0, last = performance.now(), paused = false;
    wrap.addEventListener("mouseenter", () => (paused = true));
    wrap.addEventListener("mouseleave", () => (paused = false));
    (function frame(now) {
      const dt = Math.min(now - last, 100); last = now;
      const half = track.scrollWidth / 2;
      if (!paused && half > 0) {
        pos += (half / 32) * (dt / 1000);          // one full loop every 32 seconds
        if (pos >= half) pos -= half;
        track.style.transform = "translate3d(" + -pos + "px,0,0)";
      }
      requestAnimationFrame(frame);
    })(last);
  }

  function card(c) {
    if (!c) return;
    $("abHeading").textContent = c.heading || "";
    const ps = $("abParas"); (c.paragraphs || []).forEach((p) => ps.appendChild(el("p", "", p)));
    const info = $("abInfo");
    (c.info || []).forEach((i) => info.appendChild(el("div", "ab-info-item", "", [el("div", "ab-info-label", i.label), el("div", "ab-info-value", i.value)])));
    const st = $("abStats"), nums = [];
    (c.stats || []).forEach((s) => {
      const n = el("div", "ab-stat-num", "0"); n.dataset.target = s.num; n.dataset.suffix = s.suffix || ""; nums.push(n);
      st.appendChild(el("div", "ab-stat", "", [n, el("div", "ab-stat-label", s.label)]));
    });
    const io = new IntersectionObserver((es) => {
      es.forEach((e) => { if (e.isIntersecting) { nums.forEach(count); io.disconnect(); } });
    }, { threshold: 0.4 });
    io.observe(st);
  }
  function count(n) {
    const t = parseFloat(n.dataset.target) || 0, suf = n.dataset.suffix, t0 = performance.now();
    (function f(now) {
      const p = Math.min((now - t0) / 900, 1), e = 1 - Math.pow(1 - p, 3);
      n.textContent = (t % 1 === 0 ? Math.round(t * e) : (t * e).toFixed(1)) + suf;
      if (p < 1) requestAnimationFrame(f);
    })(t0);
  }

  // On the home page: "About" pill lights up while the About section is on screen; clicking it scrolls down.
  function spy() {
    if (!$("home")) return;
    const link = document.querySelector('#navLinks a[href="about.html"]');
    if (!link) return;
    new IntersectionObserver((es) => es.forEach((e) => link.classList.toggle("active", e.isIntersecting)),
      { rootMargin: "-45% 0px -45% 0px" }).observe($("about"));
  }
  document.addEventListener("click", (e) => {
    if (!$("home") || !$("about") || $("about").hidden) return;
    const a = e.target.closest && e.target.closest('#navLinks a[href="about.html"]');
    if (!a) return;
    e.preventDefault();
    $("navLinks").classList.remove("open");
    $("about").scrollIntoView({ behavior: "smooth", block: "start" });
  });
})();
