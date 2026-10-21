// Everything on the page comes from data.json.
// To add or change content, edit data.json only.

const $ = (id) => document.getElementById(id);

// ---------- Page loader: curtain with MAHIM letters + % counter. Shows while a page opens / when going to another page ----------
const loader = $("pageload");
const loadStart = Date.now();
let plPct = 0, plRaf = 0, plPctEl = null, plFill = null;
function buildLoader() {
  if (!loader || loader.dataset.ready) return;
  loader.dataset.ready = "1";
  const word = (loader.querySelector(".pageload__name") || {}).textContent || "MAHIM";
  loader.textContent = "";
  const name = document.createElement("div"); name.className = "pageload__name"; name.setAttribute("aria-hidden", "true");
  [...word].forEach((ch, i) => { const s = document.createElement("span"); s.textContent = ch; s.style.animationDelay = i * 0.09 + "s"; name.appendChild(s); });
  const dot = document.createElement("span"); dot.className = "pl-dot"; dot.textContent = "."; dot.style.animationDelay = [...word].length * 0.09 + "s"; name.appendChild(dot);
  const hi = document.createElement("div"); hi.className = "pageload__hi";
  const words = ["👋", "💻", "🚀", "✨", "🔥", "🎯"]; let wi = 0;
  const hs = document.createElement("span"); hs.textContent = words[0]; hi.appendChild(hs);
  setInterval(() => { if (!loader.classList.contains("on")) return; wi = (wi + 1) % words.length; hs.style.animation = "none"; void hs.offsetWidth; hs.style.animation = ""; hs.textContent = words[wi]; }, 180);
  const bar = document.createElement("div"); bar.className = "pageload__bar"; plFill = document.createElement("i"); bar.appendChild(plFill);
  plPctEl = document.createElement("div"); plPctEl.className = "pageload__pct"; plPctEl.textContent = "0";
  loader.append(hi, name, bar, plPctEl);
}
function plSet(p) { plPct = p; if (plFill) plFill.style.width = p + "%"; if (plPctEl) plPctEl.textContent = Math.round(p); }
function plRun() {                                   // eases toward 90% while the page is loading
  cancelAnimationFrame(plRaf);
  const t0 = performance.now();
  (function f(now) { const p = 90 * (1 - Math.exp(-(now - t0) / 180)); if (p > plPct) plSet(p); plRaf = requestAnimationFrame(f); })(t0);
}
buildLoader(); plRun();
function pageReady() {
  if (!loader) return;
  const wait = Math.max(0, 450 - (Date.now() - loadStart));      // show the loader at least a moment
  setTimeout(() => {
    cancelAnimationFrame(plRaf); plSet(100);
    setTimeout(() => loader.classList.remove("on"), 150);
  }, wait);
}
addEventListener("pageshow", (e) => { if (e.persisted && loader) { plSet(100); loader.classList.remove("on"); } });
window.pageLoaderFlash = (mid) => {                      // loader covers the screen, runs mid(), then lifts (for same-page jumps)
  if (!loader) { mid(); return; }
  plSet(0); plRun(); loader.classList.add("on");
  setTimeout(() => { mid(); cancelAnimationFrame(plRaf); plSet(100); setTimeout(() => loader.classList.remove("on"), 150); }, 420);
};
document.addEventListener("click", (e) => {
  const a = e.target.closest && e.target.closest("a[href]");
  if (!a || !loader || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
  if (a.target === "_blank" || a.hasAttribute("download")) return;
  const u = new URL(a.href, location.href);
  if (u.origin !== location.origin || (u.pathname === location.pathname && u.hash)) return;
  if (u.pathname === location.pathname && !u.hash) { e.preventDefault(); return; }   // already on this page
  e.preventDefault();
  plSet(0); plRun(); loader.classList.add("on");
  setTimeout(() => (location.href = u.href), 380);
});

// Small icon set (fixed strings, safe to use as innerHTML)
const ICONS = {
  download: '<path d="M12 3v12m0 0l-4-4m4 4l4-4"/><path d="M4 17v2a2 2 0 002 2h12a2 2 0 002-2v-2"/>',
  arrow:    '<path d="M5 12h14m0 0l-6-6m6 6l-6 6"/>',
  chat:     '<path d="M21 11.5a8.4 8.4 0 01-1 4 8.5 8.5 0 01-7.6 4.6 8.4 8.4 0 01-3.9-.9L3 21l1.9-5.4a8.4 8.4 0 01-.9-3.9 8.5 8.5 0 014.6-7.6 8.4 8.4 0 014-1h.5A8.5 8.5 0 0121 11v.5z"/>',
};
function iconEl(name) {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox", "0 0 24 24");
  svg.setAttribute("aria-hidden", "true");
  svg.innerHTML = ICONS[name] || "";
  return svg;
}

function link(item) {
  const a = document.createElement("a");
  a.href = item.link;
  a.textContent = item.label;
  if (/^https?:/.test(item.link)) { a.target = "_blank"; a.rel = "noopener"; }
  return a;
}


// ---------- Page background video (just drop the file in assets/backgrounds/, see data.json "backgrounds") ----------
function initPageBackground(cfg) {
  if (!cfg || cfg.enabled === false) return;
  const file = (location.pathname.split("/").pop() || "index.html").toLowerCase().replace(/\.html$/, "");
  const key = file === "index" ? "home" : file;
  const pages = cfg.pages || {};
  if (!(key in pages) && (cfg.skip || ["home", "about"]).includes(key)) return;      // home + about keep their own look unless listed in "pages"
  if (pages[key] === false) return;
  const folder = cfg.folder || "assets/backgrounds/";
  const exts = cfg.formats || ["mp4", "webm"];
  const phone = matchMedia("(max-width: 700px)").matches;
  const names = pages[key] ? [pages[key]] : [];
  if (!names.length) {                                    // "news.mp4" / "news.webm" by default; on phones "news-mobile.mp4" is tried first (optional tall clip)
    if (phone) exts.forEach((e) => names.push(folder + key + "-mobile." + e));
    exts.forEach((e) => names.push(folder + key + "." + e));
  }
  const wrap = document.createElement("div"); wrap.className = "page-bg"; wrap.setAttribute("aria-hidden", "true");
  const v = document.createElement("video");
  v.muted = true; v.loop = true; v.playsInline = true; v.autoplay = true; v.preload = "auto"; v.setAttribute("muted", ""); v.setAttribute("playsinline", "");
  const shade = document.createElement("div"); shade.className = "page-bg__shade";
  shade.style.setProperty("--bg-shade", String(cfg.overlay != null ? cfg.overlay : 0.55));
  if (cfg.cardGlass != null) document.body.style.setProperty("--card-glass", String(cfg.cardGlass));
  if (cfg.cardBlur != null) document.body.style.setProperty("--card-blur", cfg.cardBlur + "px");
  if (cfg.blur) v.style.filter = "blur(" + cfg.blur + "px)";
  wrap.append(v, shade);
  let i = 0;
  const next = () => {                                    // try the next file name; no file at all -> nothing is added
    if (i >= names.length) { wrap.remove(); document.body.classList.remove("has-bg"); return; }
    v.src = names[i++];
  };
  v.addEventListener("error", next);
  v.addEventListener("loadeddata", () => {
    document.body.classList.add("has-bg"); wrap.classList.add("on");
    // plays even if the computer has "reduce motion" switched on (many Windows PCs do); set "respectReducedMotion": true in data.json to obey it
    if (cfg.respectReducedMotion && matchMedia("(prefers-reduced-motion: reduce)").matches) v.pause(); else v.play().catch(() => {});
  });
  const kick = () => { if (v.paused && wrap.classList.contains("on")) v.play().catch(() => {}); };
  ["pointerdown", "keydown", "scroll", "touchstart"].forEach((ev) => addEventListener(ev, kick, { once: true, passive: true }));
  document.body.prepend(wrap);
  next();
}

function render(data) {
  const { person, navbar, hero, site } = data;
  const intro = data.intro || {};

  const pageTitle = document.body.dataset.title;
  document.title = pageTitle ? pageTitle + " | " + site.title : site.title;
  initPageBackground(data.backgrounds);

  // Navbar
  const logo = $("logo");
  logo.textContent = "";
  if (person.avatar) {
    const ring = document.createElement("span");
    ring.className = "avatar-ring";
    const av = document.createElement("img");
    av.src = person.avatar; av.alt = "";
    av.addEventListener("error", () => ring.remove());        // missing file -> just the name
    ring.appendChild(av);
    logo.appendChild(ring);
  }
  const nm = document.createElement("span"); nm.textContent = person.logoText; logo.appendChild(nm);
  logo.setAttribute("href", "index.html");
  const nav = $("navLinks");
  const here = (location.pathname.split("/").pop() || "index.html").toLowerCase();
  navbar.forEach((item) => {
    const a = link(item);
    if (item.link.toLowerCase() === here) a.classList.add("active");   // current page = grey pill
    nav.appendChild(a);
  });
  $("navToggle").addEventListener("click", () => nav.classList.toggle("open"));

  if (window.renderSkills) renderSkills(data.skills);
  if (window.renderContact) renderContact(data.contact);
  if (window.renderCertificates) renderCertificates(data.certificates);
  if (window.renderEducation) renderEducation(data.education);
  if (window.renderProjects) renderProjects(data.projects);
  if (window.renderNews) renderNews(data.news);
  if (window.renderAbout) renderAbout(data.about);
  renderPageNav(navbar);
  if (window.renderFooter) renderFooter(data);

  const chatCfg = data.chatbot || {};
  const chat = chatCfg.enabled === false ? null : initChat(chatCfg);
  if ($("home")) {
    renderHome(data, chat, intro);
    // On the home page the chat button lives in the hero; once it scrolls out of view
    // (About section etc.) show the floating one so the chatbot is always reachable.
    if (chat && $("heroActions")) {
      const fab = addChatFab(chat);
      fab.hidden = true;
      new IntersectionObserver((es) => { fab.hidden = es[0].isIntersecting; }).observe($("heroActions"));
    }
  } else if (chat) addChatFab(chat);
  pageReady();
}

// Previous / Next buttons at the bottom of every page, in the same order as the navbar.
// (The home page counts as "About", because About sits right under the hero.)
function renderPageNav(navbar) {
  const main = document.querySelector("main");
  if (!main || !navbar.length) return;
  let file = (location.pathname.split("/").pop() || "index.html").toLowerCase();
  if (file === "index.html") file = "about.html";
  const i = navbar.findIndex((n) => n.link.toLowerCase() === file);
  if (i === -1) return;
  const box = document.createElement("nav");
  box.className = "page-nav"; box.setAttribute("aria-label", "Page navigation");
  const make = (item, dir) => {
    const a = document.createElement("a");
    a.className = "page-nav__btn page-nav__" + dir; a.href = item.link;
    const ic = document.createElement("span"); ic.className = "page-nav__icon"; ic.appendChild(iconEl("arrow"));
    const tx = document.createElement("span"); tx.className = "page-nav__text";
    const lb = document.createElement("span"); lb.className = "page-nav__label"; lb.textContent = dir === "prev" ? "Previous" : "Next";
    const tt = document.createElement("span"); tt.className = "page-nav__title"; tt.textContent = (item.emoji ? item.emoji + " " : "") + item.label;
    tx.append(lb, tt);
    if (dir === "prev") a.append(ic, tx); else a.append(tx, ic);
    return a;
  };
  if (i > 0) box.appendChild(make(navbar[i - 1], "prev"));
  if (navbar[i].fun) {                       // little message with an emoji in the middle
    const f = document.createElement("span"); f.className = "page-nav__fun";
    const em = document.createElement("span"); em.className = "page-nav__emoji"; em.setAttribute("aria-hidden", "true"); em.textContent = navbar[i].emoji || "✨";
    f.append(em, document.createTextNode(" " + navbar[i].fun));
    box.appendChild(f);
  }
  if (i < navbar.length - 1) box.appendChild(make(navbar[i + 1], "next"));
  if (!box.children.length) return;
  main.appendChild(box);
}

// Floating chat button for every page except the home page (home has it in the hero)
function addChatFab(chat) {
  const b = document.createElement("button");
  b.type = "button"; b.className = "btn btn--orb chat-fab"; b.setAttribute("aria-label", "Chatbot");
  b.appendChild(iconEl("chat"));
  const d = document.createElement("span"); d.className = "dot"; b.appendChild(d);
  b.addEventListener("click", chat.open);
  document.body.appendChild(b);
  return b;
}

function renderHome(data, chat, intro) {
  const { person, hero } = data;
  // Hero text
  $("bgName").textContent = person.shortName;
  $("role").textContent = person.role + ".";
  $("subtitle").textContent = person.subtitle;

  hero.actions.forEach((a) => {
    let el;
    if (a.type === "chat") {
      if (!chat) return;
      el = document.createElement("button");
      el.type = "button";
      el.addEventListener("click", chat.open);
    } else {
      el = document.createElement("a");
      el.href = a.link;
      if (a.download) el.setAttribute("download", typeof a.download === "string" ? a.download : "");
      if (/^https?:/.test(a.link)) { el.target = "_blank"; el.rel = "noopener"; }
    }
    const style = a.style || "primary";
    el.classList.add("btn", "btn--" + style);
    el.setAttribute("aria-label", a.label);

    if (style === "orb") {                       // round icon-only button
      el.title = a.label;
      if (a.icon) el.appendChild(iconEl(a.icon));
      if (a.online) { const dot = document.createElement("span"); dot.className = "dot"; dot.setAttribute("aria-hidden", "true"); el.appendChild(dot); }
    } else {
      if (a.icon && a.icon !== "arrow") el.appendChild(iconEl(a.icon));
      const t = document.createElement("span"); t.textContent = a.label; el.appendChild(t);
      if (a.icon === "arrow") el.appendChild(iconEl("arrow"));
    }
    $("heroActions").appendChild(el);
  });

  // ---- Live clock + date (data.json -> hero.clock). timeZone null = the visitor's own time ----
  const ck = hero.clock;
  if (ck && ck.enabled !== false && $("heroClock")) {
    const tz = ck.timeZone || undefined;
    const h12 = ck.hour12 !== false;
    const hm = new Intl.DateTimeFormat("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: h12, timeZone: tz });
    const dt = new Intl.DateTimeFormat("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: tz });
    const tiles = document.querySelectorAll("#heroClock .ck-tile");
    const setTile = (el, ch) => {                         // flip the tile when its digit changes
      if (el.textContent === ch) return;
      const first = el.textContent === "";
      el.textContent = ch;
      if (!first) { el.classList.remove("flip"); void el.offsetWidth; el.classList.add("flip"); }
    };
    const tick = () => {
      const n = new Date(), p = hm.formatToParts(n);
      const g = (t) => (p.find((x) => x.type === t) || {}).value || "";
      const H = g("hour"), M = g("minute");
      setTile(tiles[0], H[0]); setTile(tiles[1], H[1]); setTile(tiles[2], M[0]); setTile(tiles[3], M[1]);
      $("clockAmpm").textContent = h12 ? g("dayPeriod").toUpperCase() : "";
      $("clockSec").textContent = ck.seconds === false ? "" : ":" + g("second");
      $("clockDate").textContent = dt.format(n).replace(/^(\w+),?\s*/, "$1, ");
    };
    tick(); $("heroClock").hidden = false;
    setInterval(tick, 1000);
  }

  // ---- Intro: video (if person.video is set) or text-to-speech ----
  const video = $("heroVideo");
  const voiceBtn = $("voiceBtn");
  const ICON_PLAY  = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>';
  const ICON_PAUSE = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 5h4v14H6zM14 5h4v14h-4z"/></svg>';
  function setIcon(playing) {
    voiceBtn.innerHTML = playing ? ICON_PAUSE : ICON_PLAY;
    voiceBtn.setAttribute("aria-label", playing ? "Pause intro" : "Play intro");
  }
  setIcon(false);
  let hasVideo = false;
  let startedAt = 0;               // time of the last auto start, so the button ignores the same click

  if (person.video) {
    hasVideo = true;
    // transparent WebM (alpha) where the browser supports it; Safari has no WebM alpha, so it gets the MP4 that is already flattened on the page colour
    const isSafari = /^((?!chrome|chromium|android).)*safari/i.test(navigator.userAgent);
    video.src = (person.videoAlpha && !isSafari && video.canPlayType('video/webm; codecs="vp9"')) ? person.videoAlpha : person.video;
    video.addEventListener("error", () => { hasVideo = false; video.hidden = true; });   // no video file -> hero shows no picture
    video.addEventListener("loadeddata", () => { video.hidden = false; });
    video.addEventListener("ended", () => {          // after the spoken intro, go back to a silent loop
      video.muted = true; video.loop = true; video.play().catch(() => {});
      setIcon(false);
    });
  }

  const canSpeak = "speechSynthesis" in window && !!person.voiceIntro;
  if (!hasVideo && !canSpeak) voiceBtn.hidden = true;

  function speak() {
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(person.voiceIntro);
    const voices = speechSynthesis.getVoices();
    u.voice = voices.find((v) => /en-IN/i.test(v.lang)) || voices.find((v) => /^en/i.test(v.lang)) || null;
    u.onstart = () => (setIcon(true));
    u.onend = u.onerror = () => (setIcon(false));
    speechSynthesis.speak(u);
  }

  // Play the intro WITH sound. Must be called from a user gesture (click / key) to be allowed.
  function startIntro() {
    startedAt = Date.now();
    if (hasVideo) {
      video.loop = false; video.muted = false; video.currentTime = 0;
      video.play().then(() => (setIcon(true)))
                  .catch(() => { video.muted = true; video.loop = true; video.play().catch(() => {}); });
    } else if (canSpeak) {
      speak();
    }
  }

  voiceBtn.addEventListener("click", () => {
    if (Date.now() - startedAt < 700) return;        // same click that already started the intro
    if (hasVideo) {
      if (video.muted) startIntro();
      else { video.muted = true; video.loop = true; setIcon(false); }
      return;
    }
    if (speechSynthesis.speaking) { speechSynthesis.cancel(); setIcon(false); }
    else startIntro();
  });

  // Browsers only allow sound after the visitor does something. So:
  //  1) try sound straight away (works if the browser allows it),
  //  2) otherwise start it on the visitor's first click / key press / tap anywhere,
  //  3) or, if intro.splash is true, show a "click to enter" screen.
  const wantsSound = intro.autoPlaySound !== false && (hasVideo || canSpeak);
  if (hasVideo) video.play().catch(() => {});        // muted autoplay as the baseline

  if (wantsSound) {
    if (intro.splash) {
      const splash = $("splash");
      $("splashName").textContent = person.name;
      $("splashBtn").textContent = intro.splashText || "Click to enter";
      splash.hidden = false;
      $("splashBtn").addEventListener("click", () => {
        splash.classList.add("hide");
        setTimeout(() => (splash.hidden = true), 500);
        startIntro();
      });
    } else {
      let done = false;
      const go = (e) => {
        // clicks on buttons / links / inputs (Chatbot, Resume, nav...) must not start the voice by accident
        if (e && e.target && e.target.closest && e.target.closest("a, button, input, textarea, form")) return;
        if (e && e.type === "keydown" && ["Escape", "Tab"].includes(e.key)) return;
        if (done) return; done = true;
        ["pointerdown", "keydown", "touchend"].forEach((t) => window.removeEventListener(t, go, true));
        startIntro();
      };
      ["pointerdown", "keydown", "touchend"].forEach((t) => window.addEventListener(t, go, true));

      if (hasVideo) {                                 // try real autoplay with sound first
        video.muted = false; video.loop = false;
        video.play().then(() => { done = true; setIcon(true); })
                    .catch(() => { video.muted = true; video.loop = true; video.play().catch(() => {}); });
      }
    }
  }
}

// ---------- Chatbot ----------
// Talks to your backend:  POST cfg.apiUrl  { message, history }  ->  { reply }
// history = [{ role: "user" | "assistant", content: "..." }, ...] (earlier turns only)
// Keep API keys on the server, never in this file.
function initChat(cfg) {
  const root = $("chat"), log = $("chatLog"), form = $("chatForm"), input = $("chatInput");
  $("chatTitle").textContent = cfg.title || "Ask AI";
  $("chatSub").textContent = cfg.subtitle || "";
  input.placeholder = cfg.placeholder || "Type your question...";

  const history = [];
  let busy = false, greeted = false;

  function add(role, text) {
    const m = document.createElement("div");
    m.className = "msg msg--" + role;
    m.textContent = text;
    log.appendChild(m);
    log.scrollTop = log.scrollHeight;
    return m;
  }
  function open() {
    root.hidden = false;
    requestAnimationFrame(() => root.classList.add("show"));
    if (!greeted) { greeted = true; add("bot", cfg.welcome || "Hi! How can I help?"); }
    input.focus();
  }
  function close() {
    root.classList.remove("show");
    setTimeout(() => { if (!root.classList.contains("show")) root.hidden = true; }, 220);
  }

  $("chatClose").addEventListener("click", close);
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !root.hidden) close(); });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const text = input.value.trim();
    if (!text || busy) return;
    input.value = "";
    add("user", text);

    if (!cfg.apiUrl) { add("bot", cfg.offlineMessage || "The chatbot is not connected yet."); return; }

    const past = history.slice();
    history.push({ role: "user", content: text });
    busy = true;
    const typing = add("bot", "…");
    typing.classList.add("typing");
    try {
      const res = await fetch(cfg.apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, history: past }),
      });
      if (!res.ok) throw new Error("HTTP " + res.status);
      const out = await res.json();
      const reply = out.reply ?? out.message ?? out.answer ?? "";
      typing.textContent = reply || "(empty reply)";
      history.push({ role: "assistant", content: reply });
    } catch (err) {
      typing.textContent = cfg.errorMessage || "Sorry, something went wrong.";
      history.pop();
    } finally {
      typing.classList.remove("typing");
      busy = false;
      log.scrollTop = log.scrollHeight;
      input.focus();
    }
  });

  return { open, close };
}

fetch("data.json")
  .then((r) => r.json())
  .then(render)
  .catch(() => {
    if (loader) loader.classList.remove("on");
    document.body.insertAdjacentHTML(
      "afterbegin",
      '<p style="padding:90px 24px;font-family:sans-serif">data.json load hoy ni. ' +
      "index.html double-click na kore VS Code er <b>Live Server</b> diye open koro.</p>"
    );
  });

