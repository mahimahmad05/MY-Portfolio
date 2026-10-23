// Contact section. All content comes from data.json -> "contact".
(function () {
  const ICONS = {"beecrowd": "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><polyline points=\"16 18 22 12 16 6\"/><polyline points=\"8 6 2 12 8 18\"/><circle cx=\"12\" cy=\"12\" r=\"2.4\"/></svg>", "mail": "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z\"/><polyline points=\"22 6 12 13 2 6\"/></svg>", "phone": "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.362 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.338 1.85.573 2.81.7A2 2 0 0 1 22 16.92z\"/></svg>", "pin": "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z\"/><circle cx=\"12\" cy=\"10\" r=\"3\"/></svg>", "send": "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><line x1=\"22\" y1=\"2\" x2=\"11\" y2=\"13\"/><polygon points=\"22 2 15 22 11 13 2 9 22 2\"/></svg>", "users": "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2\"/><circle cx=\"9\" cy=\"7\" r=\"4\"/><path d=\"M23 21v-2a4 4 0 0 0-3-3.87\"/><path d=\"M16 3.13a4 4 0 0 1 0 7.75\"/></svg>", "globe": "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><circle cx=\"12\" cy=\"12\" r=\"10\"/><line x1=\"2\" y1=\"12\" x2=\"22\" y2=\"12\"/><path d=\"M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z\"/></svg>", "github": "<svg viewBox=\"0 0 24 24\" fill=\"currentColor\"><path d=\"M12 .5C5.73.5.98 5.24.98 11.52c0 5.02 3.26 9.28 7.77 10.79.57.1.78-.25.78-.55v-2.13c-3.16.69-3.83-1.35-3.83-1.35-.52-1.31-1.26-1.66-1.26-1.66-1.03-.7.08-.69.08-.69 1.14.08 1.74 1.17 1.74 1.17 1.01 1.73 2.65 1.23 3.29.94.1-.73.4-1.23.72-1.51-2.52-.29-5.17-1.26-5.17-5.6 0-1.24.44-2.25 1.17-3.04-.12-.29-.51-1.45.11-3.02 0 0 .96-.31 3.14 1.16a10.9 10.9 0 0 1 5.72 0c2.18-1.47 3.14-1.16 3.14-1.16.62 1.57.23 2.73.11 3.02.73.79 1.17 1.8 1.17 3.04 0 4.35-2.66 5.31-5.19 5.59.41.35.77 1.04.77 2.1v3.11c0 .3.21.66.79.55 4.5-1.51 7.76-5.77 7.76-10.79C23.02 5.24 18.27.5 12 .5z\"/></svg>", "linkedin": "<svg viewBox=\"0 0 24 24\" fill=\"currentColor\"><path d=\"M20.45 20.45h-3.55v-5.57c0-1.33-.02-3.03-1.85-3.03-1.85 0-2.14 1.45-2.14 2.94v5.66H9.36V9h3.41v1.56h.05c.47-.9 1.63-1.85 3.36-1.85 3.6 0 4.27 2.37 4.27 5.45v6.29zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.56V9h3.56v11.45z\"/></svg>", "whatsapp": "<svg viewBox=\"0 0 24 24\" fill=\"currentColor\"><path d=\"M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.372-.01-.571-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413\"/></svg>", "facebook": "<svg viewBox=\"0 0 24 24\" fill=\"currentColor\"><path d=\"M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036 26.805 26.805 0 0 0-.834-.012c-.531 0-1.008.062-1.407.223a1.858 1.858 0 0 0-.918.706c-.201.335-.317.842-.317 1.6v1.454h3.919l-.552 3.667h-3.367v7.98H9.101z\"/></svg>", "twitter": "<svg viewBox=\"0 0 24 24\" fill=\"currentColor\"><path d=\"M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z\"/></svg>"};

  function el(tag, cls, text, kids) {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text) n.textContent = text;
    (kids || []).forEach((k) => n.appendChild(k));
    return n;
  }
  // keep emails / phone numbers from breaking at a hyphen
  function keep(v) {
    if (typeof v !== "string") return v;
    v = v.replace(/-/g, "\u2011");
    return v.includes("@") ? v.replace("@", "\u200B@") : v;
  }
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const BRAND = { github: "201,209,217", linkedin: "59,139,255", facebook: "24,119,242", twitter: "230,236,245", whatsapp: "37,211,102", beecrowd: "245,166,35" };
  function copy(text, label) {
    const done = () => toast(label + " copied");
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(done, done);
    else { const t = document.createElement("textarea"); t.value = text; document.body.appendChild(t); t.select(); try { document.execCommand("copy"); } catch (x) {} t.remove(); done(); }
  }
  function toast(msg) {
    let t = document.getElementById("ctToast"); if (!t) { t = el("div", "ct-toast"); t.id = "ctToast"; document.body.appendChild(t); }
    t.textContent = msg; t.classList.remove("on"); void t.offsetWidth; t.classList.add("on");
  }
  const io = "IntersectionObserver" in window ? new IntersectionObserver((es) => es.forEach((x) => { if (x.isIntersecting) { io.unobserve(x.target); x.target.classList.add("in"); } }), { threshold: 0.12 }) : null;
  const reveal = (n) => { if (io) io.observe(n); else n.classList.add("in"); };
  function spot(n) { n.addEventListener("mousemove", (ev) => { const r = n.getBoundingClientRect(); n.style.setProperty("--mx", (ev.clientX - r.left) + "px"); n.style.setProperty("--my", (ev.clientY - r.top) + "px"); }); }
  function magnet(n) {
    if (reduce || !matchMedia("(hover: hover)").matches) return;
    n.addEventListener("mousemove", (ev) => { const r = n.getBoundingClientRect(); n.style.transform = "translate(" + ((ev.clientX - r.left - r.width / 2) * .22) + "px," + ((ev.clientY - r.top - r.height / 2) * .3) + "px)"; });
    n.addEventListener("mouseleave", () => (n.style.transform = ""));
  }
  const svg = (name, fallback) => ICONS[name] || ICONS[fallback] || "";

  window.renderContact = function (c) {
    const sec = document.getElementById("contact");
    if (!sec || !c) return;
    sec.hidden = false;

    document.getElementById("contactNum").textContent = c.number || "";
    document.getElementById("contactTitle").textContent = c.title || "Contact";
    document.getElementById("contactHeadIcon").innerHTML = svg(c.icon, "send");
    document.getElementById("contactSub").textContent = c.subheading || "";
    document.getElementById("contactInfoTitle").textContent = c.infoTitle || "Contact Information";
    document.getElementById("contactSocialTitle").textContent = c.socialTitle || "Connect With Me";
    document.getElementById("contactFormTitle").textContent = c.formTitle || "Send Message";
    document.getElementById("contactInfoIcon").innerHTML = svg("users");
    document.getElementById("contactSocialIcon").innerHTML = svg("globe");
    document.getElementById("contactFormIcon").innerHTML = svg("send");
    document.getElementById("cfSubmitIcon").innerHTML = svg("send");
    document.getElementById("cfNote").textContent = c.formNote || "";

    // info rows
    const infoWrap = document.getElementById("contactInfoList");
    (c.info || []).forEach((it) => {
      const row = el(it.href ? "a" : "div", "contact-info-row");
      if (it.href) { row.href = it.href; if (/^https?:/.test(it.href)) { row.target = "_blank"; row.rel = "noopener"; } }
      const ic = el("div", "cir-icon"); ic.innerHTML = svg(it.icon, "pin");
      row.appendChild(ic);
      row.appendChild(el("div", "cir-txt", "", [el("div", "cir-label", it.label), el("div", "cir-value", keep(it.value))]));
      if (it.icon === "mail" || it.icon === "phone") {
        const cp = el("button", "cir-copy", "Copy"); cp.type = "button"; cp.title = "Copy " + it.label;
        cp.addEventListener("click", (ev) => { ev.preventDefault(); ev.stopPropagation(); copy(it.value, it.label); cp.textContent = "Copied ✓"; cp.classList.add("ok"); setTimeout(() => { cp.textContent = "Copy"; cp.classList.remove("ok"); }, 1600); });
        row.appendChild(cp);
      }
      row.style.setProperty("--i", infoWrap.children.length);
      infoWrap.appendChild(row);
    });

    // social cards
    const socialWrap = document.getElementById("contactSocialList");
    (c.social || []).forEach((it) => {
      const a = el("a", "social-card glow-border");
      a.href = it.href; a.target = "_blank"; a.rel = "noopener";
      a.appendChild(el("div", "card-topbar"));
      a.appendChild(el("i", "ct-glow"));
      a.style.setProperty("--bc", BRAND[it.icon] || "127,176,255"); a.style.setProperty("--i", socialWrap.children.length);
      const ic = el("span", "social-card-icon"); ic.innerHTML = svg(it.icon, "globe");
      a.appendChild(ic);
      a.appendChild(el("div", "social-card-label", it.label));
      a.appendChild(el("div", "social-card-sub", it.sub || ""));
      a.appendChild(el("span", "social-card-go", "↗"));
      socialWrap.appendChild(a);
    });

    // form: opens the visitor's email app with the message filled in
    const mail = (c.info || []).find((i) => i.icon === "mail");
    document.getElementById("contactForm").addEventListener("submit", (e) => {
      e.preventDefault();
      const v = (id) => document.getElementById(id).value.trim();
      const body = "Name: " + v("cfName") + "\nEmail: " + v("cfEmail") + "\n\n" + v("cfMessage");
      const url = "mailto:" + (mail ? mail.value : "") + "?subject=" + encodeURIComponent(v("cfSubject") || "Portfolio Contact") + "&body=" + encodeURIComponent(body);
      const sb = document.querySelector(".cf-submit"); sb.classList.add("sent");
      setTimeout(() => { location.href = url; }, reduce ? 0 : 1100);
      setTimeout(() => sb.classList.remove("sent"), 3200);
    });

    // bottom call-to-action
    document.getElementById("contactCtaTitle").textContent = c.ctaTitle || "";
    document.getElementById("contactCtaText").textContent = c.ctaText || "";
    const btns = document.getElementById("contactCtaButtons");
    (c.ctaButtons || []).forEach((b, i) => {
      const a = el("a", "cta-btn glow-border " + (i === 0 ? "cta-primary" : "cta-secondary"));
      a.href = b.href;
      a.innerHTML = svg(b.icon);
      a.appendChild(el("span", "", b.label));
      btns.appendChild(a); magnet(a);
    });

    extras(c);
  };

  // ---- status pill, live Dhaka clock, reveals, spotlight, counters ----
  function extras(c) {
    const st = document.getElementById("ctStatus");
    if (st) {
      st.appendChild(el("span", "ct-dot"));
      st.appendChild(el("span", "", c.statusText || "Open to internships, projects & collaboration"));
    }
    const tm = document.getElementById("ctTime");
    if (tm) {
      const tz = c.timezone || "Asia/Dhaka", city = (c.info || []).find((i) => i.icon === "pin");
      const clock = el("div", "ct-clock");
      clock.innerHTML = '<i class="ck-ring"></i>' + [...Array(12)].map((_, k) => '<b style="--k:' + k + '"></b>').join("") + '<i class="ck-h"></i><i class="ck-m"></i><i class="ck-s"></i><i class="ck-c"></i>';
      const dig = el("div", "ct-dig"), tt = el("div", "ct-tt"), sub = el("div", "ct-sub", city ? city.value + " · local time" : "Local time");
      dig.appendChild(tt); dig.appendChild(sub);
      tm.appendChild(clock); tm.appendChild(dig);
      const fmt = new Intl.DateTimeFormat("en-GB", { timeZone: tz, hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false });
      const [h, m, s] = [clock.querySelector(".ck-h"), clock.querySelector(".ck-m"), clock.querySelector(".ck-s")];
      function tick() {
        const p = {}; fmt.formatToParts(new Date()).forEach((x) => (p[x.type] = +x.value));
        const hh = p.hour % 24, mm = p.minute, ss = p.second;
        h.style.transform = "rotate(" + ((hh % 12) * 30 + mm * .5) + "deg)"; m.style.transform = "rotate(" + (mm * 6 + ss * .1) + "deg)"; s.style.transform = "rotate(" + ss * 6 + "deg)";
        const h12 = hh % 12 || 12; tt.textContent = String(h12).padStart(2, "0") + ":" + String(mm).padStart(2, "0") + ":" + String(ss).padStart(2, "0") + " " + (hh >= 12 ? "PM" : "AM");
      }
      tick(); setInterval(tick, 1000);
    }
    document.querySelectorAll(".contact-card, .contact-cta, .ct-status").forEach((n) => { reveal(n); if (n.classList.contains("contact-card")) spot(n); });
    document.querySelectorAll(".social-card").forEach((n) => { reveal(n); spot(n); });
    document.querySelectorAll(".contact-info-row").forEach(reveal);
    const ta = document.getElementById("cfMessage");
    if (ta) {
      const cn = el("div", "cf-count", "0 / 500"); ta.maxLength = 500; ta.parentNode.insertBefore(cn, ta.nextSibling);
      ta.addEventListener("input", () => { cn.textContent = ta.value.length + " / 500"; cn.classList.toggle("hot", ta.value.length > 450); });
    }
    const sb = document.querySelector(".cf-submit"); if (sb) { sb.insertAdjacentHTML("beforeend", '<i class="cf-plane"></i>'); magnet(sb); }
  }
})();
