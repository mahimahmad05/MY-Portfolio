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
    const vis = el("div", "ab-visual");
    const stage = el("div", "ab-stage");
    // orbit with tech logos
    const orbit = el("div", "ab-orbit");
    (cfg.tech || []).slice(0, 8).forEach((t, i, arr) => {
      const a = (360 / arr.length) * i, chip = el("div", "ab-chip");
      chip.style.setProperty("--a", a + "deg");
      const img = document.createElement("img"); img.src = t.logo; img.alt = ""; img.onerror = () => (chip.style.display = "none");
      chip.appendChild(el("i", "", "", [img])); orbit.appendChild(chip);
    });
    // photo pile: cards stacked under each other; hover (tap on phones) fans them out, click one to view it full screen. Photos: data.json -> about.photos
    const deck = el("div", "ab-deck");
    const list = (cfg.photos && cfg.photos.length ? cfg.photos : [person.avatar || "assets/profile.jpg"]).map((p) => (typeof p === "string" ? { src: p } : p));
    let cards = [];
    function mk(ph, idx) {
      const card = el("div", "ab-id");
      const photo = el("div", "ab-id-photo");
      const img = document.createElement("img"); img.src = ph.src; img.alt = ph.caption || ""; img.draggable = false; if (ph.pos) img.style.objectPosition = ph.pos;
      img.onerror = () => { const i = cards.indexOf(card); if (i > -1 && cards.length > 1) { cards.splice(i, 1); card.remove(); layout(); } else img.remove(); };
      photo.appendChild(img);
      if (idx === 0) photo.appendChild(el("span", "ab-id-live", "Open to work"));
      const meta = el("div", "ab-id-meta", "", [
        el("strong", "", person.name || cfg.name),
        el("span", "", person.role || ""),
        el("em", "", [info.program, info.batch ? "Batch " + info.batch : ""].filter(Boolean).join(" · ")),
      ]);
      const bar = el("div", "ab-id-bar"); bar.appendChild(el("span", "", "DIU · SE"));
      card.append(el("div", "ab-id-top", "", [el("span", "", "DEVELOPER ID"), el("b", "", "")]), photo, meta, bar, el("div", "ab-id-shine"));
      card._ph = ph; return card;
    }
    cards = list.map(mk); cards.forEach((c) => deck.appendChild(c));
    const ctrl = el("div", "ab-hint", "", [el("span", "", "")]);
    function layout() {
      const n = cards.length, cw = deck.offsetWidth || 270, room = Math.max(40, Math.min(170, (innerWidth - cw) / 2 - 14)), dx = n > 1 ? Math.min(92, (2 * room) / (n - 1)) : 0;
      cards.forEach((c, i) => {
        const t = i - (n - 1) / 2;
        c.dataset.pos = Math.min(i, 3);
        c.style.setProperty("--tx", (t * dx).toFixed(1) + "px"); c.style.setProperty("--ty", (Math.abs(t) * 12).toFixed(1) + "px");
        c.style.setProperty("--rot", (t * Math.min(7, (22 / Math.max(1, n - 1)) * 1.6)).toFixed(2) + "deg");
        c.style.setProperty("--zs", String(50 - Math.round(Math.abs(t) * 2)));
        c.style.zIndex = 20 - i;
      });
      deck.classList.toggle("single", n < 2);
      ctrl.firstChild.textContent = n > 1 ? (matchMedia("(hover: hover)").matches ? "Hover to spread · click a photo" : "Tap to spread · tap a photo") : "Click to view";
    }
    layout(); addEventListener("resize", layout);
    function spread(on) { deck.classList.toggle("spread", on); }
    deck.addEventListener("pointerenter", (e) => { if (e.pointerType === "mouse") spread(true); });
    deck.addEventListener("pointerleave", (e) => { if (e.pointerType === "mouse") spread(false); });
    deck.addEventListener("click", (e) => {
      const c = e.target.closest(".ab-id"); if (!c) return;
      if (cards.length > 1 && !deck.classList.contains("spread")) { spread(true); return; }
      lightbox().open(cards.map((k) => ({ src: k._ph.src, cap: k._ph.caption || "" })), cards.indexOf(c));
    });
    document.addEventListener("click", (e) => { if (!deck.contains(e.target)) spread(false); });
    stage.append(el("i", "ab-glow"), orbit, deck, ctrl);
    (cfg.floats || ["AI / ML", "Full Stack", "DevOps"]).slice(0, 3).forEach((t, i) => stage.appendChild(el("div", "ab-float f" + (i + 1), t)));
    vis.appendChild(stage); wrap.appendChild(vis);
    // 3D tilt following the mouse
    if (matchMedia("(hover: hover)").matches && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const hero = document.querySelector("#about .ab-hero");
      hero.addEventListener("pointermove", (e) => {
        const r = stage.getBoundingClientRect(), x = (e.clientX - (r.left + r.width / 2)) / (innerWidth / 2), y = (e.clientY - (r.top + r.height / 2)) / (innerHeight / 2);
        stage.style.setProperty("--rx", (-y * 4).toFixed(2) + "deg"); stage.style.setProperty("--ry", (x * 5).toFixed(2) + "deg");
        stage.style.setProperty("--gx", (50 + x * 40) + "%"); stage.style.setProperty("--gy", (50 + y * 40) + "%");
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


  // ---- neural-network canvas behind the hero: drifting nodes, links, travelling pulses, reacts to the mouse ----
  function network(hero) {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches || hero.querySelector(".ab-net")) return;
    const cv = el("canvas", "ab-net"); cv.setAttribute("aria-hidden", "true"); hero.insertBefore(cv, hero.firstChild);
    const c = cv.getContext("2d"); let W = 0, H = 0, N = [], dpr = 1, mouse = { x: -999, y: -999 }, pulses = [], vis = true;
    function size() {
      dpr = Math.min(devicePixelRatio || 1, 1.5); W = hero.clientWidth; H = hero.clientHeight;
      cv.width = W * dpr; cv.height = H * dpr; cv.style.width = W + "px"; cv.style.height = H + "px";
      const n = Math.max(24, Math.min(80, Math.round((W * H) / 20000)));
      N = Array.from({ length: n }, () => ({ x: Math.random() * W, y: Math.random() * H, vx: (Math.random() - .5) * .35, vy: (Math.random() - .5) * .35, r: 1.2 + Math.random() * 1.6 }));
    }
    size(); addEventListener("resize", size);
    hero.addEventListener("pointermove", (e) => { const r = hero.getBoundingClientRect(); mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top; });
    hero.addEventListener("pointerleave", () => (mouse.x = mouse.y = -999));
    new IntersectionObserver((es) => (vis = es[0].isIntersecting)).observe(hero);
    const L = 150;
    (function frame() {
      requestAnimationFrame(frame);
      if (!vis) return;
      c.setTransform(dpr, 0, 0, dpr, 0, 0); c.clearRect(0, 0, W, H);
      for (const p of N) {
        p.x += p.vx; p.y += p.vy; if (p.x < 0 || p.x > W) p.vx *= -1; if (p.y < 0 || p.y > H) p.vy *= -1;
        const dx = p.x - mouse.x, dy = p.y - mouse.y, d = dx * dx + dy * dy;
        if (d < 14000) { const f = (1 - d / 14000) * .6, l = Math.sqrt(d) + .01; p.x += (dx / l) * f * 2; p.y += (dy / l) * f * 2; }
      }
      for (let i = 0; i < N.length; i++) {
        const a = N[i];
        for (let j = i + 1; j < N.length; j++) {
          const b = N[j], dx = a.x - b.x, dy = a.y - b.y, d = dx * dx + dy * dy;
          if (d < L * L) { const al = (1 - Math.sqrt(d) / L) * .38; c.strokeStyle = "rgba(110,160,255," + al + ")"; c.lineWidth = 1; c.beginPath(); c.moveTo(a.x, a.y); c.lineTo(b.x, b.y); c.stroke();
            if (pulses.length < 14 && Math.random() < 0.0009) pulses.push({ a, b, t: 0 }); }
        }
        const dm = Math.hypot(a.x - mouse.x, a.y - mouse.y);
        if (dm < 190) { c.strokeStyle = "rgba(160,205,255," + (1 - dm / 190) * .7 + ")"; c.beginPath(); c.moveTo(a.x, a.y); c.lineTo(mouse.x, mouse.y); c.stroke(); }
        c.fillStyle = dm < 190 ? "#cfe2ff" : "rgba(127,176,255,.75)"; c.beginPath(); c.arc(a.x, a.y, a.r * (dm < 190 ? 1.6 : 1), 0, 6.283); c.fill();
      }
      pulses = pulses.filter((p) => (p.t += 0.018) < 1);
      for (const p of pulses) { const x = p.a.x + (p.b.x - p.a.x) * p.t, y = p.a.y + (p.b.y - p.a.y) * p.t; c.fillStyle = "#fff"; c.shadowColor = "#5b8dff"; c.shadowBlur = 12; c.beginPath(); c.arc(x, y, 2.4, 0, 6.283); c.fill(); c.shadowBlur = 0; }
    })();
  }

  // ---- floating code window, types itself out ----
  function codeWin(stage, cfg) {
    const role = (cfg.roles || ["Developer"])[1] || (cfg.roles || ["Developer"])[0], focus = (cfg.floats || ["AI/ML", "DevOps"]).filter((x) => !/stack/i.test(x)).slice(0, 2);
    const lines = [
      [["k", "const "], ["v", "mahim"], ["p", " = {"]],
      [["p", "  role: "], ["s", '"' + role + '"'], ["p", ","]],
      [["p", "  focus: ["], ["s", focus.map((f) => '"' + f + '"').join(", ")], ["p", "],"]],
      [["p", "  coffee: "], ["n", "Infinity"], ["p", ","]],
      [["p", "  status: "], ["s", '"building…"']],
      [["p", "};"]],
    ];
    const win = el("div", "ab-code"), body = el("div", "ab-code-body");
    win.appendChild(el("div", "ab-code-head", "", [el("i"), el("i"), el("i"), el("span", "", "about.js")])); win.appendChild(body); stage.appendChild(win);
    const flat = []; lines.forEach((ln, li) => ln.forEach(([cls, tx]) => flat.push([li, cls, tx])));
    let li = -1, row = null, span = null, k = 0, ci = 0;
    function step() {
      if (k >= flat.length) { body.appendChild(el("span", "ab-caret")); return; }
      const [l, cls, tx] = flat[k];
      if (l !== li) { li = l; row = el("div", "ab-cl"); body.appendChild(row); }
      if (ci === 0) { span = el("span", "c-" + cls); row.appendChild(span); }
      span.textContent = tx.slice(0, ++ci);
      if (ci >= tx.length) { ci = 0; k++; }
      setTimeout(step, 24);
    }
    setTimeout(step, 1400);
  }

  // ---- paragraphs light up word by word as you scroll ----
  function wordScroll() {
    const ps = [...document.querySelectorAll("#about .ab-paras p")];
    if (!ps.length) return;
    const calm = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const items = ps.map((p) => {
      const words = p.textContent.split(/\s+/).filter(Boolean); p.textContent = "";
      const sp = words.map((w) => { const s = el("span", "w", w); p.appendChild(s); p.appendChild(document.createTextNode(" ")); return s; });
      return { p, sp };
    });
    if (calm) { items.forEach((it) => it.sp.forEach((s) => s.classList.add("lit"))); return; }
    let tick = false;
    function upd() {
      tick = false;
      items.forEach((it) => {
        const r = it.p.getBoundingClientRect();
        const pr = Math.min(1, Math.max(0, (innerHeight * 0.9 - r.top) / (r.height + innerHeight * 0.3)));
        const n = Math.round(pr * it.sp.length * 1.08);
        it.sp.forEach((s, i) => s.classList.toggle("lit", i < n));
      });
    }
    addEventListener("scroll", () => { if (!tick) { tick = true; requestAnimationFrame(upd); } }, { passive: true }); addEventListener("resize", upd); upd();
  }

  function scrollCue() {
    const hero = document.querySelector("#about .ab-hero");
    if (!hero || hero.querySelector(".ab-scroll")) return;
    const cue = el("button", "ab-scroll", "", [el("i", "", "", [el("b")]), el("span", "", "scroll")]); cue.type = "button"; cue.setAttribute("aria-label", "Scroll down");
    cue.addEventListener("click", () => { const m = $("abMarquee") || $("about"); m.scrollIntoView({ behavior: "smooth", block: "start" }); });
    hero.appendChild(cue);
  }


  // ---- full-screen photo viewer (arrows, keyboard, swipe) ----
  let LB = null;
  function lightbox() {
    if (LB) return LB;
    const viewer = el("div", "ab-view"), vimg = document.createElement("img"), vcap = el("div", "ab-view-cap"), vn = el("div", "ab-view-n");
    const bx = el("button", "ab-view-x", "✕"), bp = el("button", "ab-view-p", "‹"), bn = el("button", "ab-view-nx", "›");
    [bx, bp, bn].forEach((b) => (b.type = "button")); bx.setAttribute("aria-label", "Close"); bp.setAttribute("aria-label", "Previous"); bn.setAttribute("aria-label", "Next");
    viewer.append(vimg, vcap, vn, bx, bp, bn); document.body.appendChild(viewer);
    let items = [], vi = 0;
    function show(i) { vi = (i + items.length) % items.length; vimg.classList.remove("in"); vimg.src = items[vi].src; vcap.textContent = items[vi].cap || ""; vn.textContent = (vi + 1) + " / " + items.length; requestAnimationFrame(() => requestAnimationFrame(() => vimg.classList.add("in"))); }
    function close() { viewer.classList.remove("open"); document.documentElement.style.overflow = ""; }
    bx.onclick = close; bp.onclick = (e) => { e.stopPropagation(); show(vi - 1); }; bn.onclick = (e) => { e.stopPropagation(); show(vi + 1); };
    viewer.addEventListener("click", (e) => { if (e.target === viewer) close(); });
    addEventListener("keydown", (e) => { if (!viewer.classList.contains("open")) return; if (e.key === "Escape") close(); else if (e.key === "ArrowLeft") show(vi - 1); else if (e.key === "ArrowRight") show(vi + 1); });
    let sx = 0; viewer.addEventListener("touchstart", (e) => (sx = e.touches[0].clientX), { passive: true });
    viewer.addEventListener("touchend", (e) => { const dx = e.changedTouches[0].clientX - sx; if (Math.abs(dx) > 50) show(vi + (dx < 0 ? 1 : -1)); });
    LB = { open(list, i) { items = list; show(i); viewer.classList.add("open"); document.documentElement.style.overflow = "hidden"; } };
    return LB;
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
    const fill = (tr, list) => { list.forEach((t) => tr.appendChild(make(t))); list.forEach((t) => { const x = make(t); x.setAttribute("aria-hidden", "true"); tr.appendChild(x); }); };
    fill(track, items);

    // Scroll with JS (not CSS) so it keeps moving even if the computer has "reduce animations" turned on. Row 2 runs the other way.
    let pos = 0, last = performance.now(), paused = false;
    wrap.addEventListener("mouseenter", () => (paused = true));
    wrap.addEventListener("mouseleave", () => (paused = false));
    (function frame(now) {
      const dt = Math.min(now - last, 100); last = now;
      const half = track.scrollWidth / 2;
      if (!paused && half > 0) {
        pos += (half / 32) * (dt / 1000); if (pos >= half) pos -= half;
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
