// ---------- Page loader: curtain with MAHIM letters + % counter. Shows while a page opens / when going to another page ----------
const loader = document.getElementById("pageload");
const loadStart = Date.now();
let plPct = 0, plRaf = 0, plPctEl = null, plFill = null;
// Loader: thousands of glowing particles fly in and assemble into the name; the word "charges up" left -> right as the page loads
let plCv = null, plCx = null, plP = [], plW = 0, plH = 0, plDpr = 1, plMouse = { x: -999, y: -999 }, plBurst = 0, plFoot = null, plWord = "MAHIM";
function plLayout() {
  if (!plCv) return;
  plDpr = Math.min(devicePixelRatio || 1, 1.5); plW = innerWidth; plH = innerHeight;
  plCv.width = plW * plDpr; plCv.height = plH * plDpr; plCv.style.width = plW + "px"; plCv.style.height = plH + "px";
  const fs = Math.min(plW * 0.2, 230), cy = plH * 0.44;
  const off = document.createElement("canvas"); off.width = plW; off.height = Math.ceil(fs * 1.4);
  const o = off.getContext("2d"); o.fillStyle = "#fff"; o.font = "800 " + fs + 'px Inter, "Segoe UI", system-ui, sans-serif'; o.textAlign = "center"; o.textBaseline = "middle";
  if ("letterSpacing" in o) o.letterSpacing = fs * 0.02 + "px";
  o.fillText(plWord, plW / 2, off.height / 2);
  plFs = fs; plCy = cy; const gap = fs > 150 ? 4 : 3, d = o.getImageData(0, 0, off.width, off.height).data, t = [];
  let minX = 1e9, maxX = 0;
  for (let y = 0; y < off.height; y += gap) for (let x = 0; x < off.width; x += gap) if (d[(y * off.width + x) * 4 + 3] > 140) { t.push([x, y + cy - off.height / 2]); if (x < minX) minX = x; if (x > maxX) maxX = x; }
  const old = plP;
  plP = t.map(([tx, ty], i) => { const o = old[i % (old.length || 1)]; return { tx, ty, x: o ? o.x : plW / 2, y: o ? o.y : plH / 2, vx: 0, vy: 0, ox: 0, oy: 0, dl: Math.random() * 110, u: (tx - minX) / Math.max(1, maxX - minX), s: (fs > 150 ? 2 : 1.5) + Math.random() * 0.4, ph: Math.random() * 6.28 }; });
  if (!old.length) plScatter();
  if (plFoot) plFoot.style.top = cy + fs * 0.62 + "px";
}
function plScatter() {
  plBurst = 0; plT0 = performance.now();
  plP.forEach((p) => { const a = Math.random() * 6.283, r = Math.max(plW, plH) * (0.12 + Math.random() * 0.3); p.x = plW / 2 + Math.cos(a) * r; p.y = plH / 2 + Math.sin(a) * r; p.vx = p.vy = 0; p.ox = p.oy = 0; });
}
let plBT = 0, plLast = 0, plFs = 100, plCy = 300, plT0 = 0;
function plFrame(now) {
  requestAnimationFrame(plFrame);
  if (!plCx || !loader.classList.contains("on")) return;
  const dt = Math.min(3, (now - plLast) / 16.7 || 1); plLast = now;
  const c = plCx, t = now / 1000, charge = plPct / 100, age = now - plT0, ease = 1 - Math.pow(1 - 0.22, dt);
  c.setTransform(plDpr, 0, 0, plDpr, 0, 0); c.clearRect(0, 0, plW, plH);
  if (!plBurst) {                                                  // faint solid word under the particles (same font/position) so the word always reads clearly
    c.font = "800 " + plFs + 'px Inter, "Segoe UI", system-ui, sans-serif'; c.textAlign = "center"; c.textBaseline = "middle";
    if ("letterSpacing" in c) c.letterSpacing = plFs * 0.02 + "px";
    c.fillStyle = "rgba(70,120,255,.12)"; c.fillText(plWord, plW / 2, plCy);
  }
  c.globalCompositeOperation = "lighter";
  const beam = ((t * 0.55) % 1.3) - 0.15;                         // soft light beam sweeping across the word
  for (let i = 0; i < plP.length; i++) {
    const p = plP[i];
    if (plBurst) { p.vx += (p.x - plW / 2) * 0.0018 * dt; p.vy += (p.y - plH / 2) * 0.0018 * dt; p.vx *= 0.94; p.vy *= 0.94; p.x += p.vx * dt; p.y += p.vy * dt; }
    else {
      if (age > p.dl) {                                           // glide straight onto the exact target point (no wobble) and snap
        const dx = p.tx - p.x, dy = p.ty - p.y;
        if (dx * dx + dy * dy < 0.2) { p.x = p.tx; p.y = p.ty; } else { p.x += dx * ease; p.y += dy * ease; }
      }
      const mx = p.x + p.ox - plMouse.x, my = p.y + p.oy - plMouse.y, dd = mx * mx + my * my;
      if (dd < 7000) { const f = (1 - dd / 7000) * 2.4, l = Math.sqrt(dd) + 0.01; p.ox += (mx / l) * f; p.oy += (my / l) * f; }
      p.ox *= 0.88; p.oy *= 0.88;                                 // pushed particles always spring back to their exact spot
    }
    const on = p.u <= charge, near = Math.abs(p.u - beam) < 0.05;
    const al = plBurst ? Math.max(0, 0.9 * (1 - (now - plBT) / 300)) : on ? 1 : 0.42 + 0.1 * Math.sin(t * 3 + p.ph);
    c.fillStyle = near ? "rgba(255,255,255," + al + ")" : on ? "rgba(160,205,255," + al + ")" : "rgba(70,120,255," + al + ")";
    c.fillRect(p.x + p.ox, p.y + p.oy, p.s, p.s);
  }
  c.globalCompositeOperation = "source-over";
}
function buildLoader() {
  if (!loader || loader.dataset.ready) return;
  loader.dataset.ready = "1";
  plWord = (loader.querySelector(".pageload__name") || {}).textContent || "MAHIM";
  loader.textContent = "";
  plCv = document.createElement("canvas"); plCv.className = "pl-cv"; plCv.setAttribute("aria-hidden", "true"); plCx = plCv.getContext("2d");
  plFoot = document.createElement("div"); plFoot.className = "pl-foot"; plFoot.setAttribute("aria-hidden", "true");
  const bar = document.createElement("div"); bar.className = "pl-bar"; plFill = document.createElement("i"); bar.appendChild(plFill);
  plPctEl = document.createElement("div"); plPctEl.className = "pl-num"; plPctEl.textContent = "0";
  plStatus = document.createElement("div"); plStatus.className = "pl-status"; plStatus.innerHTML = "<em>&gt;</em> <span></span><u></u>";
  plStatusTx = plStatus.querySelector("span"); plStatusTx.textContent = PL_STEPS[0][1];
  plFoot.append(bar, plPctEl, plStatus);
  loader.append(plCv, plFoot);
  let cont = false; try { cont = Date.now() - Number(sessionStorage.getItem("plNav") || 0) < 6000; sessionStorage.removeItem("plNav"); } catch (e) {}
  plLayout(); if (cont) plP.forEach((p) => { p.x = p.tx; p.y = p.ty; p.dl = 0; });
  addEventListener("resize", plLayout);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(plLayout);
  loader.addEventListener("pointermove", (e) => { plMouse.x = e.clientX; plMouse.y = e.clientY; });
  loader.addEventListener("pointerleave", () => { plMouse.x = plMouse.y = -999; });
  requestAnimationFrame(plFrame);
}
const PL_STEPS = [[0, "booting up…"], [25, "loading skills…"], [50, "compiling projects…"], [75, "polishing pixels…"], [96, "ready ✓"]];
let plStatus = null, plStatusTx = null, plStep = 0;
function plSet(p) {
  if (p === 0 && plPct > 0) plScatter();
  if (p >= 100 && plPct < 100) setTimeout(() => { if (plPct >= 100) { plBurst = 1; plBT = performance.now(); } }, 110);
  plPct = p;
  if (plFill) plFill.style.width = p + "%";
  if (plPctEl) plPctEl.textContent = Math.round(p);
  if (plStatusTx) { let k = 0; PL_STEPS.forEach((s, i) => { if (p >= s[0]) k = i; }); if (p === 0) k = 0; if (k !== plStep) { plStep = k; plStatusTx.textContent = PL_STEPS[k][1]; } }
}
function plRun() {                                   // eases toward 90% while the page is loading
  cancelAnimationFrame(plRaf);
  const t0 = performance.now();
  (function f(now) { const p = 90 * (1 - Math.exp(-(now - t0) / 120)); if (p > plPct) plSet(p); plRaf = requestAnimationFrame(f); })(t0);
}
buildLoader(); plRun();
function pageReady() {
  if (!loader) return;
  const wait = Math.max(0, 650 - (Date.now() - loadStart));      // show the loader at least a moment
  setTimeout(() => {
    cancelAnimationFrame(plRaf); plSet(100);
    setTimeout(() => loader.classList.remove("on"), 330);
  }, wait);
}
addEventListener("pageshow", (e) => { if (e.persisted && loader) { plSet(100); loader.classList.remove("on"); } });
window.pageLoaderFlash = (mid) => {                      // loader covers the screen, runs mid(), then lifts (for same-page jumps)
  if (!loader) { mid(); return; }
  plSet(0); plRun(); loader.classList.add("on");
  setTimeout(() => { mid(); cancelAnimationFrame(plRaf); plSet(100); setTimeout(() => loader.classList.remove("on"), 330); }, 650);
};
document.addEventListener("click", (e) => {
  const a = e.target.closest && e.target.closest("a[href]");
  if (!a || !loader || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
  if (a.target === "_blank" || a.hasAttribute("download")) return;
  const u = new URL(a.href, location.href);
  if (u.origin !== location.origin || (u.pathname === location.pathname && u.hash)) return;
  if (u.pathname === location.pathname && !u.hash) { e.preventDefault(); return; }   // already on this page
  e.preventDefault();
  try { sessionStorage.setItem("plNav", String(Date.now() + 420)); } catch (e) {}
  plSet(0); plRun(); loader.classList.add("on");
  setTimeout(() => (location.href = u.href), 420);
});

