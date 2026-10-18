// Everything on the page comes from data.json.
// To add or change content, edit data.json only.

const $ = (id) => document.getElementById(id);

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

  document.title = site.title;

  // Navbar
  $("logo").textContent = person.logoText;
  const nav = $("navLinks");
  navbar.forEach((item) => {
    const a = link(item);
    a.addEventListener("click", () => nav.classList.remove("open"));
    nav.appendChild(a);
  });
  $("navToggle").addEventListener("click", () => nav.classList.toggle("open"));

  // Hero text
  $("bgName").textContent = person.shortName;
  $("role").textContent = person.role + ".";
  $("subtitle").textContent = person.subtitle;

  // Photo (falls back to a placeholder box if the file is missing)
  const img = $("photo");
  const wrap = img.parentElement;
  img.addEventListener("error", () => wrap.classList.add("no-photo"));
  img.src = person.photo;

  // Buttons and links
  const btn = $("primaryBtn");
  btn.textContent = hero.primaryButton.label;
  btn.href = hero.primaryButton.link;
  hero.links.forEach((l) => $("heroLinks").appendChild(link(l)));
  hero.social.forEach((l) => $("heroSocial").appendChild(link(l)));

  // ---- Intro: video (if person.video is set) or text-to-speech ----
  const video = $("heroVideo");
  const voiceBtn = $("voiceBtn");
  let hasVideo = false;
  let startedAt = 0;               // time of the last auto start, so the button ignores the same click

  if (person.video) {
    hasVideo = true;
    video.poster = person.photo;
    video.src = person.video;
    video.addEventListener("error", () => { hasVideo = false; video.hidden = true; img.hidden = false; });
    video.addEventListener("loadeddata", () => { img.hidden = true; video.hidden = false; });
    video.addEventListener("ended", () => {          // after the spoken intro, go back to a silent loop
      video.muted = true; video.loop = true; video.play().catch(() => {});
      voiceBtn.textContent = "🔊 Listen";
    });
  }

  const canSpeak = "speechSynthesis" in window && !!person.voiceIntro;
  if (!hasVideo && !canSpeak) voiceBtn.hidden = true;

  function speak() {
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(person.voiceIntro);
    const voices = speechSynthesis.getVoices();
    u.voice = voices.find((v) => /en-IN/i.test(v.lang)) || voices.find((v) => /^en/i.test(v.lang)) || null;
    u.onstart = () => (voiceBtn.textContent = "⏹ Stop");
    u.onend = u.onerror = () => (voiceBtn.textContent = "🔊 Listen");
    speechSynthesis.speak(u);
  }

  // Play the intro WITH sound. Must be called from a user gesture (click / key) to be allowed.
  function startIntro() {
    startedAt = Date.now();
    if (hasVideo) {
      video.loop = false; video.muted = false; video.currentTime = 0;
      video.play().then(() => (voiceBtn.textContent = "🔇 Mute"))
                  .catch(() => { video.muted = true; video.loop = true; video.play().catch(() => {}); });
    } else if (canSpeak) {
      speak();
    }
  }

  voiceBtn.addEventListener("click", () => {
    if (Date.now() - startedAt < 700) return;        // same click that already started the intro
    if (hasVideo) {
      if (video.muted) startIntro();
      else { video.muted = true; video.loop = true; voiceBtn.textContent = "🔊 Listen"; }
      return;
    }
    if (speechSynthesis.speaking) { speechSynthesis.cancel(); voiceBtn.textContent = "🔊 Listen"; }
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
      const go = () => {
        if (done) return; done = true;
        ["pointerdown", "keydown", "touchend"].forEach((t) => window.removeEventListener(t, go, true));
        startIntro();
      };
      ["pointerdown", "keydown", "touchend"].forEach((t) => window.addEventListener(t, go, true));

      if (hasVideo) {                                 // try real autoplay with sound first
        video.muted = false; video.loop = false;
        video.play().then(() => { done = true; voiceBtn.textContent = "🔇 Mute"; })
                    .catch(() => { video.muted = true; video.loop = true; video.play().catch(() => {}); });
      }
    }
  }
}

fetch("data.json")
  .then((r) => r.json())
  .then(render)
  .catch(() => {
    document.body.insertAdjacentHTML(
      "afterbegin",
      '<p style="padding:90px 24px;font-family:sans-serif">data.json load hoy ni. ' +
      "index.html double-click na kore VS Code er <b>Live Server</b> diye open koro.</p>"
    );
  });
