// Generates static, crawlable pages for each project in js/projects.js, pre-renders
// the project cards on the homepage and developments page, and writes sitemap.xml and robots.txt.
// Run from the repo root after editing js/projects.js:
//   node scripts/build-seo.mjs
// The browser JavaScript still works on top of the generated HTML.
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SITE = "https://newhome.mt";
const NAME = "NewHome Developments";
const TODAY = new Date().toISOString().slice(0, 10);
const PHONE_INTL = "+35699992244";
const EMAIL = "newhomemlt@gmail.com";

const src = fs.readFileSync(path.join(root, "js/projects.js"), "utf8");
const PROJECTS = vm.runInNewContext(`${src}\n;PROJECTS`);

const esc = (s = "") =>
  String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
const jsonLd = (o) =>
  JSON.stringify(o, null, 2).replace(/</g, "\\u003c");
const locality = (p) => p.location.replace(/, Malta$/, "").split(",").pop().trim();
const projectUrl = (p) => `${SITE}/developments/${p.slug}`;
const abs = (f) => `${SITE}/${f}`;

// ----- Card markup (same as js/main.js) -----
const card = (p) =>
  `<article class="card"><img src="${p.cover}" alt="${p.title}" loading="lazy"><div>${p.status ? `<span class="tag">${p.status}</span>` : ""}<span class="loc">${p.location}</span><h3>${p.title}</h3><p>${p.summary}</p><a class="btn" href="/developments/${p.slug}">View Project</a></div></article>`;
const done = (p) =>
  `<div class="done"><p class="loc">${p.location}</p><h3>${p.title}</h3><p style="max-width:60ch">${p.summary}</p><div class="ba"><figure><img src="${p.before}" alt="${p.title} before" loading="lazy"><figcaption>Before</figcaption></figure><figure><img src="${p.after}" alt="${p.title} after" loading="lazy"><figcaption>After</figcaption></figure></div>${p.beforeNote ? `<p class="cap">${p.beforeNote}</p>` : ""}<a class="btn" href="/developments/${p.slug}">View Project</a></div>`;

const isDone = (p) => p.status === "Completed" && p.before && p.after;
const replaceBetween = (html, start, end, body) => {
  const re = new RegExp(`${start}[\\s\\S]*?${end}`);
  if (!re.test(html)) throw new Error(`Marker ${start} not found`);
  return html.replace(re, `${start}${body}${end}`);
};

// ----- Project page body (same structure as js/main.js renders) -----
const row = (t, x, i) =>
  `<div class="row"><div><h2>${t}</h2><p>${x}</p></div><div><img src="${i}" alt="${t}"></div></div>`;

function projectBody(p) {
  const compare =
    p.before && p.after
      ? `<h2>Before and after</h2>${row(p.beforeTitle, p.beforeText, p.before)}${row(p.afterTitle, p.afterText, p.after)}
<h3>See the difference</h3><p class="hint">Put your finger on the picture and <b>slide it left or right</b> to compare Before and After.</p>
<div class="cmp"><img src="${p.after}" alt="After" draggable="false"><img class="top" src="${p.before}" alt="Before" draggable="false"><span class="lb l">Before</span><span class="lb r">After</span><div class="knob" aria-hidden="true"><span>◀ ▶</span></div><div class="tip">Slide your finger on the picture</div></div>
<input class="rng" type="range" min="0" max="100" value="50" aria-label="Drag to compare before and after">`
      : "";
  const gallery =
    p.gallery && p.gallery.length
      ? `<h3 style="margin-top:48px">${compare ? "Project gallery" : "Project photos"}</h3><div class="gal">${p.gallery.map((g) => `<figure><img src="${g[0]}" alt="${esc(g[1])}" loading="lazy"><figcaption class="cap">${g[1]}</figcaption></figure>`).join("")}</div>`
      : "";
  const enc = encodeURIComponent(p.title);
  return `<section class="hero"><div class="wrap"><div>${p.status ? `<span class="tag">${p.status}</span>` : ""}<p class="loc">${p.location}</p><h1>${p.title}</h1><p>${p.overview}</p><a class="btn" href="contact.html?project=${enc}">Discuss Your Project</a></div>
<div><img src="${p.cover}" alt="${esc(p.title)}"><p class="cap">${p.coverNote || ""}</p></div></div></section>
<section class="sec"><div class="wrap">${compare}${gallery}</div></section>
<section class="sec" style="padding-top:0"><div class="wrap"><div class="notes"><h2>Notes for potential clients</h2><ul class="tick">${(p.notes || []).map((n) => `<li>${n}</li>`).join("")}</ul><p>${p.benefits || ""}</p>
<p><a class="btn" href="contact.html?project=${enc}">Contact Us</a> <a class="btn alt" href="developments.html">All developments</a></p></div></div></section>`;
}

function projectPage(p) {
  const loc = locality(p);
  const title =
    p.status === "Completed"
      ? `${p.title} | Completed Development in ${loc}, Malta | ${NAME}`
      : `${p.title} | New Homes in ${loc}, Malta | ${NAME}`;
  const ld = [
    {
      "@context": "https://schema.org",
      "@type": "ApartmentComplex",
      name: p.title,
      description: p.summary,
      url: projectUrl(p),
      image: abs(p.cover),
      address: { "@type": "PostalAddress", addressLocality: loc, addressCountry: "MT" },
      provider: { "@type": "Organization", name: NAME, url: `${SITE}/` },
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: `${SITE}/` },
        { "@type": "ListItem", position: 2, name: "Developments", item: `${SITE}/developments` },
        { "@type": "ListItem", position: 3, name: p.title, item: projectUrl(p) },
      ],
    },
  ];
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover" />
    <base href="/" />
    <title>${esc(title)}</title>
    <meta name="description" content="${esc(p.summary)}" />
    <link rel="canonical" href="${projectUrl(p)}" />
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="${NAME}" />
    <meta property="og:title" content="${esc(title)}" />
    <meta property="og:description" content="${esc(p.summary)}" />
    <meta property="og:url" content="${projectUrl(p)}" />
    <meta property="og:image" content="${abs(p.cover)}" />
    <link rel="icon" href="images/logo.png" />
    <script type="application/ld+json">
${jsonLd(ld)}
    </script>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link href="https://fonts.googleapis.com/css2?family=Hanken+Grotesk:wght@400;600&family=Newsreader:wght@400;500&display=swap" rel="stylesheet" />
    <link rel="stylesheet" href="css/style.css" />
  </head>
  <body>
    <header></header>
    <main id="project" data-slug="${p.slug}">
${projectBody(p)}
    </main>
    <footer></footer>
    <script src="js/projects.js"></script>
    <script src="js/main.js"></script>
  </body>
</html>
`;
}

// ----- Write project pages -----
const devDir = path.join(root, "developments");
fs.mkdirSync(devDir, { recursive: true });
for (const p of PROJECTS) {
  fs.writeFileSync(path.join(devDir, `${p.slug}.html`), projectPage(p));
}

// ----- Pre-render listings on index.html and developments.html -----
const cardsHtml = PROJECTS.map(card).join("");
const doneHtml = PROJECTS.filter(isDone).map(done).join("");

const indexPath = path.join(root, "index.html");
let index = fs.readFileSync(indexPath, "utf8");
index = replaceBetween(index, "<!--cards:start-->", "<!--cards:end-->", cardsHtml);
index = replaceBetween(index, "<!--done:start-->", "<!--done:end-->", doneHtml);
fs.writeFileSync(indexPath, index);

const devPath = path.join(root, "developments.html");
let dev = fs.readFileSync(devPath, "utf8");
dev = replaceBetween(dev, "<!--cards:start-->", "<!--cards:end-->", cardsHtml);
fs.writeFileSync(devPath, dev);

// ----- sitemap.xml and robots.txt -----
const staticPages = ["/", "/developments", "/about", "/contact", "/privacy"];
const urls = [...staticPages.map((u) => `${SITE}${u}`), ...PROJECTS.map(projectUrl)];
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${u}</loc><lastmod>${TODAY}</lastmod></url>`).join("\n")}
</urlset>
`;
fs.writeFileSync(path.join(root, "sitemap.xml"), sitemap);

const robots = `# Search and AI search crawlers may read the whole site.
User-agent: *
Allow: /

# OpenAI's search crawler, used for ChatGPT search answers.
User-agent: OAI-SearchBot
Allow: /

Sitemap: ${SITE}/sitemap.xml
`;
fs.writeFileSync(path.join(root, "robots.txt"), robots);

console.log(`Wrote ${PROJECTS.length} project pages, updated index.html and developments.html, sitemap.xml (${urls.length} URLs) and robots.txt.`);
