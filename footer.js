// Footer. Content comes from data.json ("footer", plus navbar / contact / person).
// To show it on a page: add <footer class="site-footer" id="siteFooter"></footer> before the scripts and load footer.js + footer.css.
(function () {
  const ICONS = {"beecrowd": "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><polyline points=\"16 18 22 12 16 6\"/><polyline points=\"8 6 2 12 8 18\"/><circle cx=\"12\" cy=\"12\" r=\"2.4\"/></svg>", "twitter": "<svg viewBox=\"0 0 24 24\" fill=\"currentColor\"><path d=\"M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z\"/></svg>", "facebook": "<svg viewBox=\"0 0 24 24\" fill=\"currentColor\"><path d=\"M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036 26.805 26.805 0 0 0-.834-.012c-.531 0-1.008.062-1.407.223a1.858 1.858 0 0 0-.918.706c-.201.335-.317.842-.317 1.6v1.454h3.919l-.552 3.667h-3.367v7.98H9.101z\"/></svg>", "mail": "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z\"/><polyline points=\"22 6 12 13 2 6\"/></svg>", "phone": "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.362 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.338 1.85.573 2.81.7A2 2 0 0 1 22 16.92z\"/></svg>", "pin": "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z\"/><circle cx=\"12\" cy=\"10\" r=\"3\"/></svg>", "globe": "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><circle cx=\"12\" cy=\"12\" r=\"10\"/><line x1=\"2\" y1=\"12\" x2=\"22\" y2=\"12\"/><path d=\"M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z\"/></svg>", "github": "<svg viewBox=\"0 0 24 24\" fill=\"currentColor\"><path d=\"M12 .5C5.73.5.98 5.24.98 11.52c0 5.02 3.26 9.28 7.77 10.79.57.1.78-.25.78-.55v-2.13c-3.16.69-3.83-1.35-3.83-1.35-.52-1.31-1.26-1.66-1.26-1.66-1.03-.7.08-.69.08-.69 1.14.08 1.74 1.17 1.74 1.17 1.01 1.73 2.65 1.23 3.29.94.1-.73.4-1.23.72-1.51-2.52-.29-5.17-1.26-5.17-5.6 0-1.24.44-2.25 1.17-3.04-.12-.29-.51-1.45.11-3.02 0 0 .96-.31 3.14 1.16a10.9 10.9 0 0 1 5.72 0c2.18-1.47 3.14-1.16 3.14-1.16.62 1.57.23 2.73.11 3.02.73.79 1.17 1.8 1.17 3.04 0 4.35-2.66 5.31-5.19 5.59.41.35.77 1.04.77 2.1v3.11c0 .3.21.66.79.55 4.5-1.51 7.76-5.77 7.76-10.79C23.02 5.24 18.27.5 12 .5z\"/></svg>", "linkedin": "<svg viewBox=\"0 0 24 24\" fill=\"currentColor\"><path d=\"M20.45 20.45h-3.55v-5.57c0-1.33-.02-3.03-1.85-3.03-1.85 0-2.14 1.45-2.14 2.94v5.66H9.36V9h3.41v1.56h.05c.47-.9 1.63-1.85 3.36-1.85 3.6 0 4.27 2.37 4.27 5.45v6.29zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.56V9h3.56v11.45z\"/></svg>", "whatsapp": "<svg viewBox=\"0 0 24 24\" fill=\"currentColor\"><path d=\"M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.372-.01-.571-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413\"/></svg>", "users": "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2\"/><circle cx=\"9\" cy=\"7\" r=\"4\"/><path d=\"M23 21v-2a4 4 0 0 0-3-3.87\"/><path d=\"M16 3.13a4 4 0 0 1 0 7.75\"/></svg>", "spark": "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M12 2l2.4 6.6L21 11l-6.6 2.4L12 20l-2.4-6.6L3 11l6.6-2.4L12 2z\"/></svg>", "gradcap": "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M22 10L12 5 2 10l10 5 10-5z\"/><path d=\"M6 12.5V17c0 1.5 2.7 3 6 3s6-1.5 6-3v-4.5\"/><path d=\"M22 10v6\"/></svg>", "tools": "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z\"/></svg>", "rocket": "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z\"/><path d=\"M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 19 3c0 2.5-.5 6.5-3 9a22 22 0 0 1-4 2z\"/><path d=\"M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0\"/><path d=\"M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5\"/></svg>", "award": "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><circle cx=\"12\" cy=\"8\" r=\"6\"/><path d=\"M8.21 13.89L7 23l5-3 5 3-1.21-9.12\"/></svg>", "message": "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z\"/></svg>"};
  const UP = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></svg>';

  function el(tag, cls, text, kids) {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text) n.textContent = text;
    (kids || []).forEach((k) => n.appendChild(k));
    return n;
  }
  function keep(v) {
    if (typeof v !== "string") return v;
    v = v.replace(/-/g, "\u2011");
    return v.includes("@") ? v.replace("@", "\u200B@") : v;
  }
  const icon = (n, f) => { const s = el("span", "footer-link-icon"); s.innerHTML = ICONS[n] || ICONS[f] || ""; return s; };

  window.renderFooter = function (data) {
    const box = document.getElementById("siteFooter");
    if (!box) return;
    const f = data.footer || {}, c = data.contact || {}, person = data.person || {};

    // brand + social
    const brand = el("div", "footer-brand", "", [
      el("div", "footer-brand-name", person.name || ""),
      el("p", "footer-brand-tagline", f.tagline || ""),
    ]);
    const soc = el("div", "footer-social");
    (c.social || []).forEach((s) => {
      const a = el("a", "footer-social-link"); a.href = s.href; a.target = "_blank"; a.rel = "noopener";
      a.setAttribute("aria-label", s.label); a.innerHTML = ICONS[s.icon] || ICONS.globe; soc.appendChild(a);
    });
    brand.appendChild(soc);

    // quick links (same pages as the navbar)
    const links = el("ul", "footer-links");
    ((f.extraLinks || []).concat(data.navbar || [])).forEach((it) => {
      if (it.icon) (f.linkIcons = f.linkIcons || {})[it.label] = it.icon;
      const a = el("a", ""); a.href = it.link;
      a.appendChild(icon((f.linkIcons || {})[it.label], "spark")); a.appendChild(el("span", "", it.label));
      links.appendChild(el("li", "", "", [a]));
    });

    // contact
    const cl = el("ul", "footer-links footer-contact");
    (c.info || []).forEach((it) => {
      const val = el("span", "footer-contact-value", keep(it.value));
      if (it.href) { const a = el("a", ""); a.href = it.href; a.appendChild(icon(it.icon, "pin")); a.appendChild(val); cl.appendChild(el("li", "", "", [a])); }
      else cl.appendChild(el("li", "", "", [icon(it.icon, "pin"), val]));
    });

    const credit = el("span", "footer-credit");
    const parts = String(f.credit || "").split("♥");
    credit.appendChild(document.createTextNode(parts[0]));
    if (parts.length > 1) { credit.appendChild(el("span", "footer-heart", "♥")); credit.appendChild(document.createTextNode(parts.slice(1).join("♥"))); }

    const top = el("div", "footer-top", "", [
      brand,
      el("div", "footer-col", "", [el("h4", "footer-col-title", f.quickLinksTitle || "Quick Links"), links]),
      el("div", "footer-col", "", [el("h4", "footer-col-title", f.contactTitle || "Get In Touch"), cl]),
    ]);
    const bottom = el("div", "footer-bottom", "", [el("span", "", f.copyright || ""), credit]);
    const up = el("button", "back-to-top"); up.type = "button"; up.setAttribute("aria-label", "Back to top"); up.innerHTML = UP;
    up.addEventListener("click", () => scrollTo({ top: 0, behavior: "smooth" }));
    addEventListener("scroll", () => up.classList.toggle("show", scrollY > 500), { passive: true });

    box.append(top, el("div", "footer-divider"), bottom, up);
  };
})();
