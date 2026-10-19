// Everything on the page comes from data.json.
// To add or change content, edit data.json only.

const $ = (id) => document.getElementById(id);

// ---------- Page loader: shows while a page opens / when going to another page ----------
const loader = $("pageload");
const loadStart = Date.now();
function pageReady() {
  if (!loader) return;
  const wait = Math.max(0, 650 - (Date.now() - loadStart));      // show the loader at least a moment
  setTimeout(() => loader.classList.remove("on"), wait);
}
addEventListener("pageshow", (e) => { if (e.persisted && loader) loader.classList.remove("on"); });
document.addEventListener("click", (e) => {
  const a = e.target.closest && e.target.closest("a[href]");
  if (!a || !loader || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
  if (a.target === "_blank" || a.hasAttribute("download")) return;
  const u = new URL(a.href, location.href);
  if (u.origin !== location.origin || (u.pathname === location.pathname && u.hash)) return;
  if (u.pathname === location.pathname && !u.hash) { e.preventDefault(); return; }   // already on this page
  e.preventDefault();
  loader.classList.add("on");
  setTimeout(() => (location.href = u.href), 450);
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

function render(data) {
  const { person, navbar, hero, site } = data;
  const intro = data.intro || {};

  const pageTitle = document.body.dataset.title;
  document.title = pageTitle ? pageTitle + " | " + site.title : site.title;

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
  if (window.renderFooter) renderFooter(data);

  const chatCfg = data.chatbot || {};
  const chat = chatCfg.enabled === false ? null : initChat(chatCfg);
  if ($("home")) renderHome(data, chat, intro);
  else if (chat) addChatFab(chat);
  pageReady();
}

// Floating chat button for every page except the home page (home has it in the hero)
function addChatFab(chat) {
  const b = document.createElement("button");
  b.type = "button"; b.className = "btn btn--orb chat-fab"; b.setAttribute("aria-label", "Chatbot");
  b.appendChild(iconEl("chat"));
  const d = document.createElement("span"); d.className = "dot"; b.appendChild(d);
  b.addEventListener("click", chat.open);
  document.body.appendChild(b);
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
    video.src = person.video;
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
