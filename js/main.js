const EMAIL = "newhomemlt@gmail.com",
  PHONE = "99992244",
  WA = "35699992244",
  NAME = "NewHome Developments";
const $ = (s) => document.querySelector(s);

const path = location.pathname;
const here =
  path === "/" || path === "/index.html" ? "index.html" : path.split("/").pop();

const nav = [
  ["/", "Home"],
  ["/developments", "Developments"],
  ["/about", "About"],
  ["/contact", "Contact"],
];
const on = (f) =>
  f === here || (f === "developments.html" && here === "project.html")
    ? ' class="on" aria-current="page"'
    : "";
document.addEventListener("click", (e) => {
  const i = e.target.closest ? e.target.closest(".gal img,.row img") : null;
  if (!i) return;
  const o = document.createElement("div");
  o.className = "lightbox";
  o.innerHTML = `<img src="${i.src}" alt="${i.alt}">`;
  o.onclick = () => o.remove();
  document.body.appendChild(o);
});
addEventListener("keydown", (e) => {
  if (e.key === "Escape")
    document.querySelectorAll(".lightbox").forEach((x) => x.remove());
});
const L = (n) => `<a href="${n[0]}"${on(n[0])}>${n[1]}</a>`;
$("header").innerHTML =
  `<div class="wrap hd"><a class="brand" href="/" aria-label="${NAME} home"><img src="images/logo.png" alt="${NAME} logo"></a><nav class="dn" aria-label="Main">${nav.map(L).join("")}</nav><button class="menu" aria-expanded="false">Menu</button><nav class="mob" aria-label="Mobile">${nav.map(L).join("")}</nav></div>`;
$("footer").innerHTML =
  `<div class="wrap"><img src="images/logo.png" alt="${NAME}"><p>Direct from the developer. No agent fees.<br>New residential developments · Energy Performance Certificates · Engineers’ reports</p>
<p><a href="tel:+356${PHONE}">${PHONE}</a> · <a href="https://wa.me/${WA}">WhatsApp</a> · <a href="mailto:${EMAIL}">${EMAIL}</a><br><a href="/privacy">Privacy Policy</a> · © ${new Date().getFullYear()} ${NAME}</p></div>`;
const hd = $("header"),
  home = here === "index.html";
document.body.classList.toggle("home", home);
const sc = () => hd.classList.toggle("sc", !home || scrollY > 40);
sc();
window.__scf = sc;
if (!window.__sc) {
  window.__sc = 1;
  addEventListener("scroll", () => window.__scf && window.__scf(), {
    passive: true,
  });
}
if (home && !window.__intro) {
  window.__intro = 1;
  document.body.classList.add("first");
  const s = document.createElement("div");
  s.id = "splash";
  s.setAttribute("aria-hidden", "true");
  s.innerHTML = '<img src="images/logo.png" alt=""><i></i>';
  document.body.appendChild(s);
  setTimeout(() => s.classList.add("out"), 2300);
  setTimeout(() => {
    s.remove();
    document.body.classList.remove("first");
  }, 3200);
}
const mb = $(".menu");
mb.onclick = () => {
  const o = hd.classList.toggle("open");
  mb.setAttribute("aria-expanded", o);
};
const card = (p) =>
  `<article class="card"><img src="${p.cover}" alt="${p.title}" loading="lazy"><div>${p.status ? `<span class="tag">${p.status}</span>` : ""}<span class="loc">${p.location}</span><h3>${p.title}</h3><p>${p.summary}</p><a class="btn" href="project.html?p=${p.slug}">View Project</a></div></article>`;
const cards = $("#cards");
if (cards) cards.innerHTML = PROJECTS.map(card).join("");
const dn = $("#done");
if (dn)
  dn.innerHTML = PROJECTS.filter(
    (p) => p.status === "Completed" && p.before && p.after,
  )
    .map(
      (p) =>
        `<div class="done"><p class="loc">${p.location}</p><h3>${p.title}</h3><p style="max-width:60ch">${p.summary}</p><div class="ba"><figure><img src="${p.before}" alt="${p.title} before" loading="lazy"><figcaption>Before</figcaption></figure><figure><img src="${p.after}" alt="${p.title} after" loading="lazy"><figcaption>After</figcaption></figure></div>${p.beforeNote ? `<p class="cap">${p.beforeNote}</p>` : ""}<a class="btn" href="project.html?p=${p.slug}">View Project</a></div>`,
    )
    .join("");
const pr = $("#project");
if (pr) {
  const p = PROJECTS.find(
    (x) => x.slug === new URLSearchParams(location.search).get("p"),
  );
  if (!p)
    pr.innerHTML =
      '<div class="wrap sec"><h1>Project not found</h1><p><a href="developments.html">See all developments</a></p></div>';
  else {
    document.title = `${p.title} | ${NAME}`;
    document.querySelector("meta[name=description]").content = p.summary;
    const row = (t, x, i) =>
      `<div class="row"><div><h2>${t}</h2><p>${x}</p></div><div><img src="${i}" alt="${t}"></div></div>`;
    const compare =
      p.before && p.after
        ? `<h2>Before and after</h2>${row(p.beforeTitle, p.beforeText, p.before)}${row(p.afterTitle, p.afterText, p.after)}
<h3>See the difference</h3><p class="hint">Put your finger on the picture and <b>slide it left or right</b> to compare Before and After.</p>
<div class="cmp"><img src="${p.after}" alt="After" draggable="false"><img class="top" src="${p.before}" alt="Before" draggable="false"><span class="lb l">Before</span><span class="lb r">After</span><div class="knob" aria-hidden="true"><span>◀ ▶</span></div><div class="tip">Slide your finger on the picture</div></div>
<input class="rng" type="range" min="0" max="100" value="50" aria-label="Drag to compare before and after">`
        : "";
    const gallery =
      p.gallery && p.gallery.length
        ? `<h3 style="margin-top:48px">${compare ? "Project gallery" : "Project photos"}</h3><div class="gal">${p.gallery.map((g) => `<figure><img src="${g[0]}" alt="${g[1]}" loading="lazy"><figcaption class="cap">${g[1]}</figcaption></figure>`).join("")}</div>`
        : "";
    pr.innerHTML = `<section class="hero"><div class="wrap"><div>${p.status ? `<span class="tag">${p.status}</span>` : ""}<p class="loc">${p.location}</p><h1>${p.title}</h1><p>${p.overview}</p><a class="btn" href="contact.html?project=${encodeURIComponent(p.title)}">Discuss Your Project</a></div>
<div><img src="${p.cover}" alt="${p.title}"><p class="cap">${p.coverNote || ""}</p></div></div></section>
<section class="sec"><div class="wrap">${compare}${gallery}</div></section>
<section class="sec" style="padding-top:0"><div class="wrap"><div class="notes"><h2>Notes for potential clients</h2><ul class="tick">${(p.notes || []).map((n) => `<li>${n}</li>`).join("")}</ul><p>${p.benefits || ""}</p>
<p><a class="btn" href="contact.html?project=${encodeURIComponent(p.title)}">Contact Us</a> <a class="btn alt" href="developments.html">All developments</a></p></div></div></section>`;
    const c = pr.querySelector(".cmp");
    if (c) {
      const ai = c.querySelector("img"),
        fit = () => {
          if (ai.naturalWidth) {
            const r = ai.naturalWidth / ai.naturalHeight,
              cl = (lo, hi) => Math.min(hi, Math.max(lo, r));
            c.style.setProperty("--rn", cl(0.62, 1));
            c.style.setProperty("--rw", cl(0.8, 1.05));
          }
        };
      ai.addEventListener("load", fit);
      fit();
      const t = c.querySelector(".top"),
        k = c.querySelector(".knob"),
        s = pr.querySelector(".rng");
      const set = (v) => {
        v = Math.max(0, Math.min(100, v));
        s.value = v;
        t.style.clipPath = `inset(0 ${100 - v}% 0 0)`;
        k.style.left = v + "%";
      };
      s.oninput = () => set(+s.value);
      const pt = (e) => {
        const r = c.getBoundingClientRect();
        set(((e.clientX - r.left) / r.width) * 100);
      };
      c.onpointerdown = (e) => {
        c.setPointerCapture(e.pointerId);
        c.classList.add("used");
        pt(e);
        c.onpointermove = pt;
      };
      c.onpointerup = c.onpointercancel = () => (c.onpointermove = null);
      set(50);
    }
  }
}
const f = $("#enquiry");
if (f) {
  const q = new URLSearchParams(location.search).get("project");
  if (q) f.message.value = `Hello, I'm interested in ${q}. `;
  f.onsubmit = async (e) => {
    e.preventDefault();
    const b = f.querySelector("button"),
      s = $("#sent");
    b.disabled = true;
    s.textContent = "Sending your enquiry…";
    try {
      const o = Object.fromEntries(new FormData(f));
      o._subject = "New website enquiry from " + o.name;
      o._template = "table";
      const r = await fetch("https://formsubmit.co/ajax/" + EMAIL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(o),
      });
      const d = await r.json();
      if (!r.ok || String(d.success) !== "true") throw 0;
      f.reset();
      s.textContent =
        "Thank you. Your enquiry has been sent and we will contact you soon.";
    } catch (x) {
      s.innerHTML = `We could not send your enquiry. Please call <a href="tel:+${WA}">9999 2244</a> or email <a href="mailto:${EMAIL}">${EMAIL}</a>.`;
    }
    b.disabled = false;
  };
}
