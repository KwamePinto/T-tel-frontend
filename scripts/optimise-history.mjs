/**
 * One-off: pulls the Our History milestone photos down to a sensible size.
 * They arrived straight off the old WordPress uploads folder at up to 1.9MB.
 *
 *   node scripts/optimise-history.mjs
 */
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const DIR = "public/images/history";
const MAP = {
  "raw-NewsItem21.jpg": "2014-programme-launch.jpg",
  "raw-2-3.jpg": "2018-policy-reform.jpg",
  "raw-AGM-1-1.jpg": "2019-agm.jpg",
  "raw-ttel-about-2.jpg": "2020-established.jpg",
  "raw-DSCF1930.jpg": "2021-operational.jpg",
};

let before = 0;
let after = 0;

for (const [src, out] of Object.entries(MAP)) {
  const from = path.join(DIR, src);
  const to = path.join(DIR, out);
  if (!fs.existsSync(from)) {
    console.log(`skip ${src} (missing)`);
    continue;
  }

  const inBytes = fs.statSync(from).size;
  await sharp(from)
    .resize({ width: 1200, height: 800, fit: "cover", position: "attention", withoutEnlargement: true })
    .jpeg({ quality: 80, mozjpeg: true })
    .toFile(to);

  const outBytes = fs.statSync(to).size;
  before += inBytes;
  after += outBytes;
  fs.unlinkSync(from);
  console.log(`${out.padEnd(28)} ${(inBytes / 1024).toFixed(0)}KB -> ${(outBytes / 1024).toFixed(0)}KB`);
}

console.log(
  `\ntotal ${(before / 1024 / 1024).toFixed(2)}MB -> ${(after / 1024 / 1024).toFixed(2)}MB ` +
  `(${Math.round((1 - after / before) * 100)}% smaller)`,
);
