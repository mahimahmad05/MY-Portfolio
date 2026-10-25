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

  window.renderAbout = function (cfg, person) {
    const sec = $("about");
    if (!sec || !cfg) return;
    sec.hidden = false;
    const bg = $("abBgImg");
    if (bg && cfg.photo) { bg.onload = () => $("about").classList.add("has-photo"); bg.onerror = () => bg.remove(); bg.src = cfg.photo; }
    $("abEyeIcon").innerHTML = ICONS.spark; $("abTwIcon").innerHTML = ICONS.code;
    $("abEyebrow").textContent = cfg.eyebrow || "";
    nameFx($("abName"), cfg.name || "");
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
    visual(cfg, person || {});
    reveal();
    spy();
  };


  // ---- big name: letters rise one by one, then a light sweep runs across ----
  function nameFx(h, text) {
    h.setAttribute("aria-label", text); h.textContent = "";
    [...text].forEach((ch, i) => { const s = el("span", "ab-ch", ch); s.style.setProperty("--i", i); s.setAttribute("aria-hidden", "true"); h.appendChild(s); });
  }

  // ---- right side of the hero: tilting "developer ID" card, orbiting tech logos, floating tags ----
  function visual(cfg, person) {
    const wrap = document.querySelector("#about .ab-hero .ab-wrap");
    if (!wrap || wrap.querySelector(".ab-visual")) return;
    const info = {}; ((cfg.card || {}).info || []).forEach((i) => (info[i.label.toLowerCase()] = i.value));
    const vis = el("div", "ab-visual"); vis.setAttribute("aria-hidden", "true");
    const stage = el("div", "ab-stage");
    // orbit with tech logos
    const orbit = el("div", "ab-orbit");
    (cfg.tech || []).slice(0, 8).forEach((t, i, arr) => {
      const a = (360 / arr.length) * i, chip = el("div", "ab-chip");
      chip.style.setProperty("--a", a + "deg");
      const img = document.createElement("img"); img.src = t.logo; img.alt = ""; img.onerror = () => (chip.style.display = "none");
      chip.appendChild(el("i", "", "", [img])); orbit.appendChild(chip);
    });
    // the card
    const card = el("div", "ab-id");
    const photo = el("div", "ab-id-photo");
    const img = document.createElement("img"); img.src = person.avatar || "assets/profile.jpg"; img.alt = ""; img.onerror = () => img.remove(); photo.appendChild(img);
    photo.appendChild(el("span", "ab-id-live", "Open to work"));
    const meta = el("div", "ab-id-meta", "", [
      el("strong", "", person.name || cfg.name),
      el("span", "", person.role || ""),
      el("em", "", [info.program, info.batch ? "Batch " + info.batch : ""].filter(Boolean).join(" · ")),
    ]);
    const bar = el("div", "ab-id-bar"); bar.appendChild(el("span", "", "DIU · SE"));
    card.append(el("div", "ab-id-top", "", [el("span", "", "DEVELOPER ID"), el("b", "", "")]), photo, meta, bar, el("div", "ab-id-shine"));
    stage.append(el("i", "ab-glow"), orbit, card);
    (cfg.floats || ["AI / ML", "Full Stack", "DevOps"]).slice(0, 3).forEach((t, i) => stage.appendChild(el("div", "ab-float f" + (i + 1), t)));
    vis.appendChild(stage); wrap.appendChild(vis);
    // 3D tilt following the mouse
    if (matchMedia("(hover: hover)").matches && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const hero = document.querySelector("#about .ab-hero");
      hero.addEventListener("pointermove", (e) => {
        const r = stage.getBoundingClientRect(), x = (e.clientX - (r.left + r.width / 2)) / (innerWidth / 2), y = (e.clientY - (r.top + r.height / 2)) / (innerHeight / 2);
        stage.style.setProperty("--rx", (-y * 9).toFixed(2) + "deg"); stage.style.setProperty("--ry", (x * 12).toFixed(2) + "deg");
        card.style.setProperty("--gx", (50 + x * 40) + "%"); card.style.setProperty("--gy", (50 + y * 40) + "%");
      });
      hero.addEventListener("pointerleave", () => { stage.style.setProperty("--rx", "0deg"); stage.style.setProperty("--ry", "0deg"); });
    }
  }

  // ---- "whoami" terminal: the info lines type themselves in when scrolled into view ----
  function terminal(box, items) {
    if (!box) return;
    box.classList.add("ab-term"); box.textContent = "";
    const head = el("div", "ab-term-head", "", [el("i"), el("i"), el("i"), el("span", "", "mahim@portfolio ~ % whoami")]);
    const body = el("div", "ab-term-body"), rows = [];
    items.forEach((it) => {
      const v = el("span", "v", ""); v.dataset.t = it.value;
      body.appendChild(el("div", "ab-tl", "", [el("span", "k", it.label.toLowerCase()), el("span", "s", " → "), v]));
      rows.push(v);
    });
    const cur = el("div", "ab-tl ab-tl-end", "", [el("span", "k", "$"), el("span", "ab-caret")]);
    body.appendChild(cur); box.append(head, body);
    const quick = matchMedia("(prefers-reduced-motion: reduce)").matches;
    function run() {
      let r = 0;
      (function next() {
        if (r >= rows.length) return;
        const v = rows[r], t = v.dataset.t; let c = 0; v.parentNode.classList.add("on");
        (function type() { c += quick ? t.length : 1; v.textContent = t.slice(0, c); if (c < t.length) setTimeout(type, 16); else { r++; setTimeout(next, 90); } })();
      })();
    }
    rows.forEach((v) => (v.textContent = "\u00a0"));
    new IntersectionObserver((es, o) => es.forEach((e) => { if (e.isIntersecting) { o.disconnect(); run(); } }), { threshold: 0.35 }).observe(box);
  }

  // ---- scroll reveal + card spotlight ----
  function reveal() {
    const sec = $("about");
    const targets = [...sec.querySelectorAll(".ab-heading, .ab-paras p, .ab-term, .ab-stat")];
    targets.forEach((n, i) => { n.classList.add("ab-rv"); n.style.setProperty("--d", (i % 4) * 90 + "ms"); });
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { threshold: 0.15 });
    targets.forEach((n) => io.observe(n));
    const hero = sec.querySelector(".ab-hero");
    if (hero) new IntersectionObserver((es, o) => es.forEach((e) => { if (e.isIntersecting) { hero.classList.add("go"); o.disconnect(); } }), { threshold: 0.2 }).observe(hero);
    const card = sec.querySelector(".ab-card");
    if (card) card.addEventListener("pointermove", (e) => { const r = card.getBoundingClientRect(); card.style.setProperty("--mx", e.clientX - r.left + "px"); card.style.setProperty("--my", e.clientY - r.top + "px"); });
  }

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
    terminal($("abInfo"), c.info || []);
    const st = $("abStats"), nums = [];
    (c.stats || []).forEach((s) => {
      const n = el("div", "ab-stat-num", "0"); n.dataset.target = s.num; n.dataset.suffix = s.suffix || ""; nums.push(n);
      const mx = Math.max.apply(null, (c.stats || []).map((x) => x.num || 1));
      const tile = el("div", "ab-stat", "", [el("div", "ab-ring", "", [n]), el("div", "ab-stat-label", s.label)]);
      tile.style.setProperty("--tp", Math.max(0.18, (s.num || 0) / mx));
      st.appendChild(tile);
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
    const go = () => $("about").scrollIntoView({ behavior: "auto", block: "start" });
    window.pageLoaderFlash ? window.pageLoaderFlash(go) : go();
  });
})();
