// Resizes and recompresses everything in public/images to the largest size the
// UI actually renders. Photographic PNGs with no transparency are rewritten as
// JPEG and the team JSON is repointed at the new filenames.
// Safe to re-run: already-optimised files simply get smaller or stay put.
import sharp from "sharp";
import fs from "node:fs";
import path from "node:path";

const PUBLIC = path.resolve("public");
const IMAGES = path.join(PUBLIC, "images");

// widest each group is ever painted, doubled for high-density screens
const RULES = [
  { match: /images[/\\]team[/\\]/, width: 420 },
  { match: /images[/\\]logos[/\\]/, width: 340 },
  { match: /images[/\\]focus[/\\]/, width: 1400 },
  { match: /images[/\\]work[/\\]/, width: 1200 },
  { match: /images[/\\]photos[/\\]/, width: 1920 },
  { match: /images[/\\]hero[/\\]/, width: 1600 },
  { match: /about-teaser-bg\.png$/, width: 2000 },
  { match: /logo-(ink|white)\.png$/, width: 440 },
  { match: /cloth-strip\.png$/, width: 600 },
  { match: /favicon\.png$/, width: 180 },
];

function ruleFor(file) {
  return RULES.find((r) => r.match.test(file));
}

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const full = path.join(dir, e.name);
    return e.isDirectory() ? walk(full) : [full];
  });
}

const renames = new Map();
let before = 0;
let after = 0;

for (const file of walk(IMAGES)) {
  if (!/\.(jpe?g|png)$/i.test(file)) continue;

  const rule = ruleFor(file);
  if (!rule) continue;

  // read to a buffer first: on Windows sharp keeps a handle on the source
  // path, which blocks writing the optimised file back over it
  const source = fs.readFileSync(file);
  const startBytes = source.length;
  before += startBytes;

  const img = sharp(source, { failOn: "none" });
  const meta = await img.metadata();

  // only downscale — never upscale a small source
  const width = Math.min(meta.width ?? rule.width, rule.width);
  const resized = img.resize({ width, withoutEnlargement: true });

  const isPng = /\.png$/i.test(file);
  // a PNG that carries no real transparency is just a heavy JPEG
  const opaquePng = isPng && !meta.hasAlpha;

  let outPath = file;
  let pipeline;

  if (opaquePng) {
    outPath = file.replace(/\.png$/i, ".jpg");
    pipeline = resized.jpeg({ quality: 78, mozjpeg: true, progressive: true });
  } else if (isPng) {
    pipeline = resized.png({ compressionLevel: 9, palette: true, quality: 82 });
  } else {
    pipeline = resized.jpeg({ quality: 78, mozjpeg: true, progressive: true });
  }

  const buf = await pipeline.toBuffer();

  // keep the original if our version somehow came out larger
  if (buf.length >= startBytes && outPath === file) {
    after += startBytes;
    continue;
  }

  fs.writeFileSync(outPath, buf);
  if (outPath !== file) {
    fs.unlinkSync(file);
    renames.set(
      "/" + path.relative(PUBLIC, file).split(path.sep).join("/"),
      "/" + path.relative(PUBLIC, outPath).split(path.sep).join("/"),
    );
  }
  after += buf.length;
}

// repoint every source reference at any renamed photos
if (renames.size) {
  const sources = walk(path.resolve("src")).filter((f) =>
    /\.(jsx?|tsx?|css|json)$/i.test(f),
  );
  for (const p of sources) {
    let text = fs.readFileSync(p, "utf8");
    let touched = false;
    for (const [from, to] of renames) {
      if (text.includes(from)) {
        text = text.split(from).join(to);
        touched = true;
      }
    }
    if (touched) fs.writeFileSync(p, text);
  }
}

const mb = (n) => (n / 1024 / 1024).toFixed(2) + " MB";
console.log(`images: ${mb(before)} -> ${mb(after)}`);
console.log(`png->jpg conversions: ${renames.size}`);
