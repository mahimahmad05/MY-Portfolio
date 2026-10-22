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
    return a;
  }

  function host(u) { try { return new URL(u).hostname; } catch (e) { return "localhost"; } }
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
    const visual = el("div", "pc-visual", "", [el("div", "pc-glow"), win, el("div", "pc-hint", "Click to enlarge")]);

    const btns = el("div", "proj-btns");
    if (p.live) btns.appendChild(link(p.live, ICONS.rocket, cfg.liveLabel || "Live Site"));
    if (p.github) btns.appendChild(link(p.github, ICONS.github, cfg.githubLabel || "GitHub"));
    btns.querySelectorAll(".proj-btn").forEach((b, k) => k === 0 && b.classList.add("primary"));

    const tags = el("div", "pc-tags", "", (p.tags || []).map((t) => el("span", "pc-tag", t)));
    const num = String(i + 1).padStart(2, "0");
    const info = el("div", "pc-info", "", [
      el("div", "pc-num", num),
      el("div", "pc-kicker", "", [el("span", "pc-dot"), document.createTextNode("Project " + num)]),
      el("div", "proj-title", p.title), el("div", "proj-desc", p.description), tags, btns,
    ]);
    const panel = el("div", "pc-panel", "", [el("i", "pc-ring"), visual, info]);
    const c = el("article", "proj-card" + (i % 2 ? " flip" : ""), "", [panel]);
    c.style.setProperty("--i", i);
    visual.addEventListener("click", () => openImage(p.image));
    // 3D tilt that follows the mouse
    visual.addEventListener("mousemove", (e) => {
      const r = visual.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
      win.style.transform = "perspective(900px) rotateY(" + (x * 12).toFixed(2) + "deg) rotateX(" + (-y * 10).toFixed(2) + "deg) scale(1.025)";
      win.style.setProperty("--mx", (x + .5) * 100 + "%"); win.style.setProperty("--my", (y + .5) * 100 + "%");
    });
    visual.addEventListener("mouseenter", () => {
      const d = img.offsetHeight - shot.offsetHeight;
      if (d > 12) { img.style.transition = "transform " + Math.min(9, d / 90).toFixed(2) + "s linear"; img.style.transform = "translateY(-" + d + "px)"; }
    });
    visual.addEventListener("mouseleave", () => { win.style.transform = ""; img.style.transition = "transform .7s ease"; img.style.transform = ""; });
    // reveal on scroll
    if ("IntersectionObserver" in window) {
      c.classList.add("pre");
      new IntersectionObserver((en, ob) => en.forEach((x) => { if (x.isIntersecting) { c.classList.add("in"); ob.disconnect(); } }), { threshold: .18 }).observe(c);
    }
    return c;
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

  // ---- GitHub activity ----
  function github(g) {
    const box = document.getElementById("projGithub");
    box.hidden = false;
    document.getElementById("ghTitle").textContent = g.title || "GitHub Activity";
    document.getElementById("ghIcon").innerHTML = ICONS.github;
    document.getElementById("ghSub").textContent = g.subheading || "";
    const defs = [["publicRepos", "Public Repos", "code"], ["followers", "Followers", "users"], ["totalStars", "Total Stars", "spark"], ["topLanguage", "Top Language", "code"]];
    const nums = {}, grid = document.getElementById("ghStats");
    defs.forEach(([k, label, ic]) => {
      const i = el("div", "gh-stat-icon"); i.innerHTML = ICONS[ic];
      const n = el("div", "gh-stat-num", "—"); nums[k] = n;
      grid.appendChild(el("div", "gh-stat-card", "", [el("div", "card-topbar"), i, n, el("div", "gh-stat-label", label)]));
    });
    const btn = document.getElementById("ghProfileBtn");
    btn.href = "https://github.com/" + g.username;
    btn.innerHTML = ICONS.github; btn.appendChild(el("span", "", g.profileLabel || "View Full GitHub Profile"));
    document.getElementById("ghNote").textContent = g.noteLabel || "";
    const img = document.getElementById("ghChart");
    img.onerror = () => (img.parentNode.style.display = "none");
    img.onload = () => (img.style.display = "block");
    img.src = "https://ghchart.rshah.org/1b1b3a/" + g.username;
    stats(g.username, nums);
  }
  async function stats(u, n) {
    try {
      const r = await fetch("https://api.github.com/users/" + u);
      if (r.ok) { const j = await r.json(); n.publicRepos.textContent = j.public_repos ?? "—"; n.followers.textContent = j.followers ?? "—"; }
      const rr = await fetch("https://api.github.com/users/" + u + "/repos?per_page=100");
      if (rr.ok) {
        const repos = await rr.json();
        if (Array.isArray(repos)) {
          let stars = 0; const lc = {};
          repos.forEach((x) => { stars += x.stargazers_count || 0; if (x.language) lc[x.language] = (lc[x.language] || 0) + 1; });
          n.totalStars.textContent = stars;
          n.topLanguage.textContent = Object.keys(lc).sort((a, b) => lc[b] - lc[a])[0] || "—";
        }
      }
    } catch (e) { /* offline: keep dashes */ }
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
