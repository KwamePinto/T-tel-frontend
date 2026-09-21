/**
 * Writes public/sitemap.xml from the live API.
 *
 *   node scripts/build-sitemap.mjs [https://t-tel-frontend.onrender.com]
 *
 * Run it after a content change, or as part of the build once the API is
 * reachable from the build environment.
 */
import fs from "node:fs";

const SITE = (
  process.argv[2] || process.env.VITE_SITE_URL || process.env.SITE_URL ||
  "https://t-tel-frontend.onrender.com"
).replace(/\/$/, "");
const API = (process.env.VITE_API_URL || "http://localhost:5000").replace(/\/$/, "");

const get = async (p) => {
  try {
    const r = await fetch(`${API}/api${p}`);
    return r.ok ? await r.json() : null;
  } catch {
    return null;
  }
};

const STATIC = [
  ["/", 1.0], ["/about-us", 0.9], ["/about-us/our-history", 0.7],
  ["/about-us/our-people", 0.7], ["/about-us/our-partners", 0.6],
  ["/about-us/our-policies", 0.5], ["/focus-areas", 0.9], ["/programmes", 0.9],
  ["/knowledge-hub", 0.9], ["/news-and-media", 0.8], ["/contact-us", 0.6], ["/join-us", 0.6],
];

const urls = STATIC.map(([loc, priority]) => ({ loc, priority }));

const posts = await get("/posts?limit=500");
for (const p of posts?.items || []) {
  const type = p.contentType?.slug;
  const base = type === "focus-areas" ? "/focus-areas" : type === "programmes" ? "/programmes" : "/news-and-media";
  urls.push({ loc: `${base}/${p.slug}`, lastmod: p.updatedAt, priority: 0.7 });
}

const cols = await get("/document-collections");
for (const c of cols?.items || []) {
  if (c.slug === "policies") continue;
  urls.push({ loc: `/knowledge-hub/${c.slug}`, priority: 0.7 });
  for (const child of c.children || []) urls.push({ loc: `/knowledge-hub/${child.slug}`, priority: 0.6 });
}

const groups = await get("/person-groups");
for (const g of groups?.items || []) urls.push({ loc: `/about-us/our-people/${g.slug}`, priority: 0.5 });

const xml = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ...urls.map((u) =>
    `  <url><loc>${SITE}${u.loc}</loc>` +
    (u.lastmod ? `<lastmod>${new Date(u.lastmod).toISOString().slice(0, 10)}</lastmod>` : "") +
    `<priority>${u.priority.toFixed(1)}</priority></url>`),
  "</urlset>",
].join("\n");

fs.writeFileSync("public/sitemap.xml", xml);
console.log(`sitemap.xml: ${urls.length} URLs for ${SITE}`);
