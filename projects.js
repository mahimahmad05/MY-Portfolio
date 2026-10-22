// Projects page: project cards with a screenshot (like Certificates) + GitHub Activity.
// Content: data.json -> "projects". Screenshots go in assets/projects/.
(function () {
  const S = (p) => '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' + p + "</svg>";
  const ICONS = {
    rocket: S('<path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 19 3c0 2.5-.5 6.5-3 9a22 22 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/>'),
    code: S('<polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>'),
    users: S('<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>'),
    spark: S('<path d="M12 2l2.4 6.6L21 11l-6.6 2.4L12 20l-2.4-6.6L3 11l6.6-2.4L12 2z"/>'),
    folder: S('<path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>'),
    github: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 .5C5.73.5.98 5.24.98 11.52c0 5.02 3.26 9.28 7.77 10.79.57.1.78-.25.78-.55v-2.13c-3.16.69-3.83-1.35-3.83-1.35-.52-1.31-1.26-1.66-1.26-1.66-1.03-.7.08-.69.08-.69 1.14.08 1.74 1.17 1.74 1.17 1.01 1.73 2.65 1.23 3.29.94.1-.73.4-1.23.72-1.51-2.52-.29-5.17-1.26-5.17-5.6 0-1.24.44-2.25 1.17-3.04-.12-.29-.51-1.45.11-3.02 0 0 .96-.31 3.14 1.16a10.9 10.9 0 0 1 5.72 0c2.18-1.47 3.14-1.16 3.14-1.16.62 1.57.23 2.73.11 3.02.73.79 1.17 1.8 1.17 3.04 0 4.35-2.66 5.31-5.19 5.59.41.35.77 1.04.77 2.1v3.11c0 .3.21.66.79.55 4.5-1.51 7.76-5.77 7.76-10.79C23.02 5.24 18.27.5 12 .5z"/></svg>',
  };
  function el(tag, cls, text, kids) {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null && text !== "") n.textContent = text;
    (kids || []).forEach((k) => n.appendChild(k));
    return n;
  }
  const lock = (on) => (document.body.style.overflow = on ? "hidden" : "");

  window.renderProjects = function (cfg) {
    const sec = document.getElementById("projects");
    if (!sec || !cfg) return;
    sec.hidden = false;
    document.getElementById("projNum").textContent = cfg.number || "";
    document.getElementById("projTitle").textContent = cfg.title || "Projects";
    document.getElementById("projHeadIcon").innerHTML = ICONS[cfg.icon] || ICONS.rocket;
    const grid = document.getElementById("projGrid");
    (cfg.items || []).forEach((p, i) => grid.appendChild(card(p, cfg, i)));
    stack(grid);
    if (cfg.github && cfg.github.username) github(cfg.github);
  };

  function link(href, icon, label) {
    const a = el("a", "proj-btn"); a.href = href; a.target = "_blank"; a.rel = "noopener";
    a.innerHTML = icon; a.appendChild(el("span", "", label));
    a.addEventListener("click", (e) => e.stopPropagation());
    a.addEventListener("mousemove", (e) => { const r = a.getBoundingClientRect(); a.style.translate = ((e.clientX - r.left - r.width / 2) * .22).toFixed(1) + "px " + ((e.clientY - r.top - r.height / 2) * .35).toFixed(1) + "px"; });
    a.addEventListener("mouseleave", () => (a.style.translate = ""));
    return a;
  }

  function host(u) { try { return new URL(u).hostname; } catch (e) { return "localhost"; } }
  const HUES = [218, 262, 188, 292, 160, 332];
  function title(t) {
    const h = el("div", "proj-title");
    t.split(" ").forEach((w, k) => { const o = el("span", "tw"), n = el("span", "tn", w); n.style.transitionDelay = (0.15 + k * 0.08) + "s"; o.appendChild(n); h.appendChild(o); h.appendChild(document.createTextNode(" ")); });
    return h;
  }
  function card(p, cfg, i) {
    const img = document.createElement("img");
    img.src = p.image || ""; img.alt = p.title; img.loading = "lazy";
    const shot = el("div", "pc-shot", "", [img]);
    img.onerror = () => {
      img.remove();
      const ic = el("div", "proj-thumb-icon"); ic.innerHTML = ICONS.folder;
      shot.appendChild(el("div", "proj-thumb-fallback", "", [ic, document.createTextNode("Image not added yet")]));
    };
    const bar = el("div", "pc-bar", "", [el("i"), el("i"), el("i"), el("span", "pc-url", p.live ? host(p.live) : "localhost:3000")]);
    const win = el("div", "pc-window", "", [bar, shot, el("div", "pc-shine")]);
    const floats = (p.tags || []).slice(0, 3).map((t, k) => el("span", "pc-float f" + k, t));
    const visual = el("div", "pc-visual", "", [el("div", "pc-glow"), win, ...floats]);

    const btns = el("div", "proj-btns");
    if (p.live) btns.appendChild(link(p.live, ICONS.rocket, cfg.liveLabel || "Live Site"));
    if (p.github) btns.appendChild(link(p.github, ICONS.github, cfg.githubLabel || "GitHub"));
    btns.querySelectorAll(".proj-btn").forEach((b, k) => k === 0 && b.classList.add("primary"));

    const tags = el("div", "pc-tags", "", (p.tags || []).map((t) => el("span", "pc-tag", t)));
    const num = String(i + 1).padStart(2, "0");
    const info = el("div", "pc-info", "", [
      el("div", "pc-num", num),
      el("div", "pc-kicker", "", [el("span", "pc-dot"), document.createTextNode("Project " + num)]),
      title(p.title), el("div", "proj-desc", p.description), tags, btns,
    ]);
    const panel = el("div", "pc-panel", "", [el("i", "pc-ring"), visual, info]);
    const c = el("article", "proj-card" + (i % 2 ? " flip" : ""), "", [panel]);
    c.style.setProperty("--i", i); c.style.setProperty("--h", HUES[i % HUES.length]);
    visual.addEventListener("click", () => openImage(p.image));
    visual.addEventListener("mouseenter", () => cursor(true, c));
    visual.addEventListener("mouseleave", () => cursor(false));
    // 3D tilt that follows the mouse
    visual.addEventListener("mousemove", (e) => {
      const r = visual.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
      win.style.transform = "perspective(900px) rotateY(" + (x * 12).toFixed(2) + "deg) rotateX(" + (-y * 10).toFixed(2) + "deg) scale(1.025)";
      floats.forEach((f, k) => (f.style.translate = (-x * (18 + k * 10)).toFixed(1) + "px " + (-y * (18 + k * 10)).toFixed(1) + "px"));
      win.style.setProperty("--mx", (x + .5) * 100 + "%"); win.style.setProperty("--my", (y + .5) * 100 + "%");
    });
    visual.addEventListener("mouseenter", () => {
      const d = img.offsetHeight - shot.offsetHeight;
      if (d > 12) { img.style.transition = "transform " + Math.min(9, d / 90).toFixed(2) + "s linear"; img.style.transform = "translateY(-" + d + "px)"; }
    });
    visual.addEventListener("mouseleave", () => { win.style.transform = ""; floats.forEach((f) => (f.style.translate = "")); img.style.transition = "transform .7s ease"; img.style.transform = ""; });
    // reveal on scroll
    if ("IntersectionObserver" in window) {
      c.classList.add("pre");
      new IntersectionObserver((en, ob) => en.forEach((x) => { if (x.isIntersecting) { c.classList.add("in"); ob.disconnect(); } }), { threshold: .18 }).observe(c);
    }
    return c;
  }

  // ---- round "VIEW" cursor that follows the mouse over a project window ----
  let cur = null;
  function cursor(on, card) {
    if (!matchMedia("(hover: hover)").matches) return;
    if (!cur) {
      cur = el("div", "pj-cursor", "View"); document.body.appendChild(cur);
      addEventListener("mousemove", (e) => { cur.style.left = e.clientX + "px"; cur.style.top = e.clientY + "px"; }, { passive: true });
    }
    if (card) cur.style.setProperty("--h", card.style.getPropertyValue("--h"));
    cur.classList.toggle("on", on);
  }
  function marquee(items) {
    const words = []; items.forEach((p) => { words.push(p.title); (p.tags || []).forEach((t) => words.push(t)); });
    const uniq = [...new Set(words)]; if (!uniq.length) return null;
    const row = () => el("div", "pjm-row", "", uniq.flatMap((w) => [el("span", "pjm-w", w), el("span", "pjm-s", "✦")]));
    const live = items.filter((p) => p.live).length, gh = items.filter((p) => p.github).length;
    const stat = (n, l) => el("div", "pjs", "", [el("b", "", String(n).padStart(2, "0")), el("span", "", l)]);
    return el("div", "pj-top", "", [
      el("div", "pj-stats", "", [stat(items.length, "Projects"), stat(live, "Live sites"), stat(gh, "Repositories")]),
      el("div", "pj-marquee", "", [el("div", "pjm-track", "", [row(), row()])]),
    ]);
  }

  // ---- stacked cards: each card sticks, the next one slides over it; side counter shows where you are ----
  function stack(grid) {
    const cards = [...grid.children]; if (!cards.length) return;
    const rail = el("div", "pj-rail", "", [el("b", "pj-cur", "01"), el("span", "pj-line", "", [el("i")]), el("span", "pj-tot", String(cards.length).padStart(2, "0"))]);
    document.body.appendChild(rail);
    const cur = rail.querySelector(".pj-cur"), fill = rail.querySelector("i");
    const wide = () => window.matchMedia("(min-width: 901px)").matches;
    let tick = false;
    function update() {
      tick = false;
      const on = wide(), gr = grid.getBoundingClientRect();
      rail.classList.toggle("show", on && gr.top < innerHeight * .6 && gr.bottom > innerHeight * .4);
      let active = 0;
      cards.forEach((c, i) => {
        const panel = c.firstChild, nx = cards[i + 1];
        const top = 96 + i * 16;
        if (c.getBoundingClientRect().top <= top + 40) active = i;
        if (!on || !nx) { panel.style.transform = ""; panel.style.filter = ""; return; }
        const h = c.offsetHeight, p = Math.max(0, Math.min(1, 1 - (nx.getBoundingClientRect().top - top) / h));
        panel.style.transform = "scale(" + (1 - p * .07).toFixed(4) + ")";
        panel.style.filter = "brightness(" + (1 - p * .5).toFixed(3) + ")";
      });
      cur.textContent = String(active + 1).padStart(2, "0");
      fill.style.height = ((active + 1) / cards.length * 100) + "%";
    }
    const req = () => { if (!tick) { tick = true; requestAnimationFrame(update); } };
    addEventListener("scroll", req, { passive: true }); addEventListener("resize", req); update();
    cards.forEach((c, i) => c.style.setProperty("--top", 96 + i * 16 + "px"));
  }

  // ---- GitHub activity: profile card, count-up stats, real contribution heatmap, language bar, latest repos ----
  function countUp(n, to) {
    if (typeof to !== "number") { n.textContent = to; return; }
    const t0 = performance.now(), dur = 1300;
    (function f(t) { const k = Math.min(1, (t - t0) / dur); n.textContent = Math.round(to * (1 - Math.pow(1 - k, 3))).toLocaleString(); if (k < 1) requestAnimationFrame(f); })(t0);
  }
  let UI = {};
  function github(g) {
    const u = g.username, box = document.getElementById("projGithub");
    box.hidden = false; box.innerHTML = "";
    const ic = (k) => { const i = el("span", "gh-i"); i.innerHTML = ICONS[k]; return i; };

    box.appendChild(el("div", "gh-head", "", [ic("github"), el("span", "gh-title", g.title || "GitHub Activity")]));
    box.appendChild(el("p", "gh-sub", g.subheading || ""));

    // profile + stat tiles
    const av = el("img", "gh-avatar"); av.alt = u; av.src = "https://github.com/" + u + ".png?size=200"; av.onerror = () => av.replaceWith(ic("github"));
    const name = el("div", "gh-name", u), bio = el("div", "gh-bio", g.noteLabel || "");
    const cta = el("a", "proj-btn primary"); cta.href = "https://github.com/" + u; cta.target = "_blank"; cta.rel = "noopener"; cta.innerHTML = ICONS.github; cta.appendChild(el("span", "", g.profileLabel || "View Full GitHub Profile"));
    const me = el("div", "gh-me", "", [el("div", "gh-av-wrap", "", [el("i", "gh-av-ring"), av]), name, el("div", "gh-handle", "@" + u), bio, cta]);
    const defs = [["publicRepos", "Public Repos", "code"], ["followers", "Followers", "users"], ["totalStars", "Total Stars", "spark"], ["topLanguage", "Top Language", "rocket"]];
    const nums = {}, tiles = el("div", "gh-tiles");
    defs.forEach(([k, label, i]) => { const n = el("div", "gh-num", "—"); nums[k] = n; tiles.appendChild(el("div", "gh-tile", "", [ic(i), n, el("div", "gh-lab", label)])); });
    box.appendChild(el("div", "gh-panel", "", [el("i", "pc-ring"), me, tiles]));

    // contribution heatmap
    const total = el("b", "gh-total", "—"), heat = el("div", "gh-heat"), foot = el("div", "gh-heat-foot");
    const legend = el("div", "gh-legend", "", [el("span", "", "Less"), ...[0, 1, 2, 3, 4].map((l) => el("i", "gh-c l" + l)), el("span", "", "More")]);
    foot.appendChild(el("span", "gh-note", "")); foot.appendChild(legend);
    const sky = el("div", "gh-sky"); sky.hidden = true;
    const scroll = el("div", "gh-heat-scroll", "", [heat]);
    const tabH = el("button", "gh-tab on", "Heatmap"), tabS = el("button", "gh-tab", "3D Skyline");
    tabH.type = tabS.type = "button";
    const setTab = (s3d) => { tabH.classList.toggle("on", !s3d); tabS.classList.toggle("on", s3d); scroll.hidden = s3d; legend.hidden = s3d; sky.hidden = !s3d; if (s3d) sky.dispatchEvent(new Event("show")); };
    tabH.onclick = () => setTab(false); tabS.onclick = () => setTab(true);
    const streaks = el("div", "gh-streaks");
    const hp = el("div", "gh-card", "", [el("div", "gh-card-head", "", [el("span", "gh-card-title", "Contribution graph"), el("span", "gh-card-r", "", [total, document.createTextNode(" in the last year")])]), streaks, scroll, foot]);
    box.appendChild(hp);
    const cell = (lvl, tip, col) => { const c = el("i", "gh-c l" + lvl); if (tip) c.title = tip; c.style.setProperty("--c", col); return c; };
    function drawEmpty() { for (let w = 0; w < 53; w++) for (let d = 0; d < 7; d++) heat.appendChild(cell(0, "", w)); foot.firstChild.textContent = "Live contribution data loads when online"; }

    // terminal feed (latest pushes)
    const termBody = el("div", "gh-term-body");
    box.appendChild(el("div", "gh-term", "", [el("div", "gh-term-bar", "", [el("i"), el("i"), el("i"), el("span", "", u + " — recent activity")]), termBody]));
    UI = { sky, streaks, termBody };

    // languages + latest repos
    const langBar = el("div", "gh-langbar"), langLeg = el("div", "gh-langleg"), repoList = el("div", "gh-repos");
    // (languages card removed – elements kept detached so the loader code still works)

    let started = false;
    const start = () => { if (started) return; started = true; load(u, nums, total, heat, cell, drawEmpty, langBar, langLeg, repoList); };
    if ("IntersectionObserver" in window) new IntersectionObserver((e, o) => e.some((x) => x.isIntersecting) && (o.disconnect(), start()), { threshold: .15 }).observe(box); else start();
  }
  async function load(u, nums, total, heat, cell, drawEmpty, langBar, langLeg, repoList) {
    const get = async (url) => { try { const r = await fetch(url); return r.ok ? await r.json() : null; } catch (e) { return null; } };
    const [user, repos, contrib] = await Promise.all([
      get("https://api.github.com/users/" + u),
      get("https://api.github.com/users/" + u + "/repos?per_page=100&sort=pushed"),
      get("https://github-contributions-api.jogruber.de/v4/" + u + "?y=last"),
    ]);
    if (user) { countUp(nums.publicRepos, user.public_repos || 0); countUp(nums.followers, user.followers || 0); if (user.name) document.querySelector(".gh-name").textContent = user.name; if (user.bio) document.querySelector(".gh-me .gh-bio").textContent = user.bio; }
    if (Array.isArray(repos)) {
      let stars = 0; const lc = {};
      repos.forEach((x) => { stars += x.stargazers_count || 0; if (x.language && !x.fork) lc[x.language] = (lc[x.language] || 0) + 1; });
      countUp(nums.totalStars, stars);
      const langs = Object.keys(lc).sort((a, b) => lc[b] - lc[a]), sum = langs.reduce((a, k) => a + lc[k], 0) || 1;
      nums.topLanguage.textContent = langs[0] || "—";
      langs.slice(0, 6).forEach((l, i) => {
        const hue = [215, 265, 190, 292, 160, 332][i], pct = Math.round(lc[l] / sum * 100);
        const seg = el("i", "gh-seg"); seg.style.cssText = "width:" + (lc[l] / sum * 100) + "%;background:hsl(" + hue + " 100% 62%);transition-delay:" + i * .1 + "s"; seg.title = l + " " + pct + "%"; langBar.appendChild(seg);
        const dot = el("i", "gh-ldot"); dot.style.background = "hsl(" + hue + " 100% 62%)";
        langLeg.appendChild(el("span", "gh-lg", "", [dot, document.createTextNode(l + " "), el("b", "", pct + "%")]));
      });
      requestAnimationFrame(() => langBar.classList.add("go"));
      repos.filter((x) => !x.fork).slice(0, 4).forEach((x) => {
        const a = el("a", "gh-repo"); a.href = x.html_url; a.target = "_blank"; a.rel = "noopener";
        a.appendChild(el("div", "gh-repo-top", "", [el("b", "", x.name), el("span", "", "★ " + (x.stargazers_count || 0))]));
        a.appendChild(el("div", "gh-repo-d", x.description || "No description"));
        if (x.language) a.appendChild(el("div", "gh-repo-l", x.language));
        repoList.appendChild(a);
      });
      if (!repoList.children.length) repoList.appendChild(el("div", "gh-repo-d", "No public repositories yet."));
    }
    if (contrib && Array.isArray(contrib.contributions) && contrib.contributions.length) {
      const list = contrib.contributions, pad = new Date(list[0].date + "T00:00:00").getDay();
      for (let i = 0; i < pad; i++) heat.appendChild(cell(0, "", 0));
      list.forEach((d, i) => heat.appendChild(cell(d.level, d.count + " contribution" + (d.count === 1 ? "" : "s") + " · " + d.date, Math.floor((i + pad) / 7))));
      const t = (contrib.total && (contrib.total.lastYear || Object.values(contrib.total)[0])) || list.reduce((a, d) => a + d.count, 0);
      countUp(total, t);
      const sc = heat.parentNode; sc.scrollLeft = sc.scrollWidth;
      streakStats(list);
    } else { drawEmpty(); total.textContent = "0";  }
    const ev = await get("https://api.github.com/users/" + u + "/events/public?per_page=30");
    terminal(Array.isArray(ev) ? ev : []);
  }

  function streakStats(list) {
    let best = 0, run = 0, longest = 0, bestDay = list[0];
    list.forEach((d) => { if (d.count > 0) { run++; longest = Math.max(longest, run); } else run = 0; if (d.count > bestDay.count) bestDay = d; });
    let cur = 0, i = list.length - 1; if (i >= 0 && list[i].count === 0) i--;
    for (; i >= 0 && list[i].count > 0; i--) cur++;
    const active = list.filter((d) => d.count > 0).length;
    const chip = (n, l, suf) => { const b = el("b", "", "0"); countUp(b, n); return el("div", "gh-st", "", [b, el("span", "", l + (suf || ""))]); };
    [chip(cur, "Current streak", " days"), chip(longest, "Longest streak", " days"), chip(bestDay.count, "Best day", " commits"), chip(active, "Active days")].forEach((c) => UI.streaks.appendChild(c));
  }

  // 3D skyline: towers standing on a glowing plate that is cut to fit the data (no long empty plate)
  function skyline(list, pad) {
    const narrow = innerWidth < 700, maxW = narrow ? 26 : 53, minW = narrow ? 12 : 14;
    const lastCol = Math.floor((list.length - 1 + pad) / 7);
    const fi = list.findIndex((d) => d.count > 0), fCol = fi < 0 ? lastCol : Math.floor((fi + pad) / 7);
    const first = Math.max(0, lastCol - maxW + 1, Math.min(fCol - 2, lastCol - minW + 1));
    const weeks = lastCol - first + 1, stageW = (UI.sky.clientWidth || 900);
    const S = Math.max(14, Math.min(30, Math.floor(stageW * (narrow ? .5 : .4) / weeks)));
    const max = Math.max(8, ...list.map((d) => d.count));
    const W = weeks * S, D = 7 * S, m = Math.round(S * 1.1);
    const grid = el("div", "gh-sky-grid"); grid.style.cssText = "width:" + W + "px;height:" + D + "px";
    const base = el("div", "gh-sky-base"); base.style.cssText = "left:" + -m + "px;top:" + -m + "px;right:" + -m + "px;bottom:" + -m + "px;background-size:" + S + "px " + S + "px;background-position:" + m + "px " + m + "px";
    grid.appendChild(base); base.style.setProperty("--g", S + "px");
    let peak = list[0];
    list.forEach((d, i) => {
      const col = Math.floor((i + pad) / 7) - first, row = (i + pad) % 7; if (col < 0) return;
      if (d.count > peak.count) peak = d;
      const h = d.count ? 8 + Math.pow(d.count / max, .8) * S * 5 : 1.5;
      const b = el("div", "gh-bar l" + d.level, "", [el("i", "t"), el("i", "f"), el("i", "r")]);
      b.style.cssText = "left:" + col * S + "px;top:" + row * S + "px;--h:" + h.toFixed(1) + "px;--s:" + (S - 3) + "px;--dl:" + (col * 16) + "ms";
      b.dataset.tip = d.count + " contribution" + (d.count === 1 ? "" : "s") + " · " + d.date;
      grid.appendChild(b);
    });
    const stage = el("div", "gh-sky-stage", "", [grid]), tip = el("div", "gh-sky-tip");
    UI.sky.appendChild(stage); UI.sky.appendChild(tip);
    UI.sky.appendChild(el("div", "gh-sky-hint", "Each tower = one day · taller = more contributions · best day: " + peak.count + " on " + peak.date + " · move the mouse to rotate"));
    const fit = () => { const k = Math.min(1.2, (stage.clientWidth || 900) / ((W + D) * 1.0 + 3 * m)); grid.style.setProperty("--k", k.toFixed(3)); };
    addEventListener("resize", fit); UI.sky.addEventListener("show", () => { fit(); grid.classList.remove("rise"); void grid.offsetWidth; grid.classList.add("rise"); }); fit();
    stage.addEventListener("mousemove", (e) => {
      const r = stage.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
      grid.style.setProperty("--rz", (-40 + x * 46) + "deg"); grid.style.setProperty("--rx", (60 - y * 18) + "deg");
      const bar = e.target.closest && e.target.closest(".gh-bar"), sr = UI.sky.getBoundingClientRect();
      if (bar) { tip.textContent = bar.dataset.tip; tip.style.left = e.clientX - sr.left + "px"; tip.style.top = e.clientY - sr.top - 14 + "px"; tip.classList.add("on"); } else tip.classList.remove("on");
    });
    stage.addEventListener("mouseleave", () => { grid.style.setProperty("--rz", "-40deg"); grid.style.setProperty("--rx", "60deg"); tip.classList.remove("on"); });
  }

  // terminal with typing effect
  async function terminal(events) {
    const ago = (t) => { const m = (Date.now() - new Date(t)) / 60000; return m < 60 ? Math.max(1, Math.round(m)) + "m ago" : m < 1440 ? Math.round(m / 60) + "h ago" : Math.round(m / 1440) + "d ago"; };
    const lines = [], seen = new Set();
    events.forEach((e) => {
      const repo = (e.repo.name.split("/")[1] || e.repo.name), p = e.payload || {}; let msg = "";
      if (e.type === "PushEvent" && p.commits && p.commits.length) msg = p.commits[p.commits.length - 1].message.split("\n")[0];
      else if (e.type === "CreateEvent") msg = "created " + (p.ref_type || "repository") + (p.ref && p.ref !== repo ? " " + p.ref : "");
      else if (e.type === "WatchEvent") msg = "starred ★";
      else if (e.type === "ForkEvent") msg = "forked";
      else return;
      const k = repo + "|" + msg; if (seen.has(k)) return; seen.add(k);
      lines.push({ repo, msg, hash: String(e.id).slice(-7), when: ago(e.created_at), url: "https://github.com/" + e.repo.name });
    });
    const body = UI.termBody, sleep = (ms) => new Promise((r) => setTimeout(r, ms));
    const type = async (node, text, ms) => { for (const ch of text) { node.textContent += ch; await sleep(ms); } };
    const cur = el("span", "gh-cur");
    const cmd = el("div", "gh-tl"); cmd.appendChild(el("span", "gh-p", "$ ")); const ct = el("span"); cmd.appendChild(ct); cmd.appendChild(cur); body.appendChild(cmd);
    await type(ct, "git log --oneline --all -n 6", 28); cur.remove(); await sleep(250);
    if (!lines.length) body.appendChild(el("div", "gh-tl dim", "no public activity yet — start pushing code!"));
    for (const l of lines.slice(0, 6)) {
      const row = el("div", "gh-tl"); row.appendChild(el("span", "gh-hash", l.hash + " "));
      const a = el("a", "gh-repo-n", l.repo + " "); a.href = l.url; a.target = "_blank"; a.rel = "noopener"; row.appendChild(a);
      const t = el("span", "gh-msg"); row.appendChild(t); body.appendChild(row);
      await type(t, l.msg.slice(0, 70), 12); row.appendChild(el("span", "gh-when", "  · " + l.when)); await sleep(120);
    }
    const end = el("div", "gh-tl"); end.appendChild(el("span", "gh-p", "$ ")); end.appendChild(el("span", "gh-cur")); body.appendChild(end);
  }

  // ---- screenshot popup ----
  function openImage(src) {
    const m = document.getElementById("projModal"), img = document.getElementById("projImage"), fb = document.getElementById("projFallback");
    img.style.display = "none"; fb.style.display = "none";
    if (src) { img.onload = () => (img.style.display = "block"); img.onerror = () => (fb.style.display = "block"); img.src = src; }
    else fb.style.display = "block";
    m.classList.add("open"); lock(true);
  }
  function closeImage() { document.getElementById("projModal").classList.remove("open"); lock(false); }
  document.addEventListener("DOMContentLoaded", () => {
    ["projBackdrop", "projClose"].forEach((id) => { const n = document.getElementById(id); if (n) n.addEventListener("click", closeImage); });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeImage(); });
  });
})();
