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
    const hp = el("div", "gh-card", "", [el("div", "gh-card-head", "", [el("span", "", "Contribution graph"), el("span", "gh-card-r", "", [total, document.createTextNode(" in the last year")])]), el("div", "gh-heat-scroll", "", [heat]), foot]);
    box.appendChild(hp);
    const cell = (lvl, tip, col) => { const c = el("i", "gh-c l" + lvl); if (tip) c.title = tip; c.style.setProperty("--c", col); return c; };
    function drawEmpty() { for (let w = 0; w < 53; w++) for (let d = 0; d < 7; d++) heat.appendChild(cell(0, "", w)); foot.firstChild.textContent = "Live contribution data loads when online"; }

    // languages + latest repos
    const langBar = el("div", "gh-langbar"), langLeg = el("div", "gh-langleg"), repoList = el("div", "gh-repos");
    box.appendChild(el("div", "gh-two", "", [
      el("div", "gh-card", "", [el("div", "gh-card-head", "", [el("span", "", "Languages")]), langBar, langLeg]),
      el("div", "gh-card", "", [el("div", "gh-card-head", "", [el("span", "", "Latest repositories")]), repoList]),
    ]));

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
    } else { drawEmpty(); total.textContent = "0"; }
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
