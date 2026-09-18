// One-off import: extracts team roster data + photos from the HTTrack mirror
// into src/data/team/*.json + public/images/team/. Re-run if the mirror changes.
import { load } from "cheerio";
import fs from "node:fs";
import path from "node:path";

const MIRROR_ROOT = path.resolve(
  "..",
  "T-tel_mirror/T-Tel/t-tel.org/about-us/our-people",
);
const DATA_OUT = path.resolve("src/data/team");
const IMAGES_OUT = path.resolve("public/images/team");

const CATEGORIES = [
  { slug: "board-of-directors", label: "Board of Directors" },
  { slug: "subscribers", label: "Subscribers" },
  { slug: "key-advisors", label: "Key Advisors" },
  { slug: "senior-management", label: "Senior Management" },
  { slug: "technical-pool", label: "Technical Pool" },
  { slug: "finance-and-operations", label: "Finance and Operations" },
];

fs.mkdirSync(DATA_OUT, { recursive: true });
fs.mkdirSync(IMAGES_OUT, { recursive: true });

function slugifyName(name) {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function resolveMirrorPath(pageDir, relSrc) {
  return path.resolve(pageDir, relSrc);
}

for (const { slug, label } of CATEGORIES) {
  const pageDir = path.join(MIRROR_ROOT, slug);
  const htmlPath = path.join(pageDir, "index.html");
  if (!fs.existsSync(htmlPath)) {
    console.warn(`SKIP ${slug}: no index.html`);
    continue;
  }
  const html = fs.readFileSync(htmlPath, "utf-8");
  const $ = load(html);

  const items = $(".eael-team-item").toArray();
  const modals = $('[id^="modal-"]').toArray();

  const people = items.map((el, i) => {
    const $el = $(el);
    const name = $el.find(".eael-team-member-name").first().text().trim();
    const position = $el
      .find(".eael-team-member-position")
      .first()
      .text()
      .trim();
    const imgSrc = $el.find("figure img").first().attr("src") || "";

    let bio = "";
    const modalEl = modals[i];
    if (modalEl) {
      const $modal = $(modalEl);
      $modal.find(".uael-modal-text img").remove();
      bio = $modal
        .find(".uael-modal-text p")
        .map((_, p) => $(p).text().trim())
        .get()
        .filter(Boolean)
        .join("\n\n");
    }

    let photo = null;
    if (imgSrc) {
      const abs = resolveMirrorPath(pageDir, imgSrc);
      if (fs.existsSync(abs)) {
        const ext = path.extname(abs);
        const fileName = `${slug}-${slugifyName(name)}${ext}`;
        fs.copyFileSync(abs, path.join(IMAGES_OUT, fileName));
        photo = `/images/team/${fileName}`;
      }
    }

    return { name, position, bio, photo };
  });

  fs.writeFileSync(
    path.join(DATA_OUT, `${slug}.json`),
    JSON.stringify({ slug, label, people }, null, 2),
  );
  console.log(`${slug}: ${people.length} people`);
}
