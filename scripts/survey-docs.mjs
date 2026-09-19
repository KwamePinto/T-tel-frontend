/**
 * Surveys the Knowledge Hub source folders before ingest: duplicates by
 * content hash, size distribution, and the worst offenders.
 *
 *   node scripts/survey-docs.mjs [sourceDir]
 */
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const SRC = process.argv[2] || "KnowledgeHubFiles";

const files = [];
(function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p);
    else if (/\.pdf$/i.test(e.name)) files.push(p);
  }
})(SRC);

const mb = (n) => (n / 1024 / 1024).toFixed(1);
const byHash = new Map();
let total = 0;

for (const f of files) {
  const buf = fs.readFileSync(f);
  const hash = crypto.createHash("sha1").update(buf).digest("hex");
  total += buf.length;
  if (!byHash.has(hash)) byHash.set(hash, { size: buf.length, paths: [] });
  byHash.get(hash).paths.push(f);
}

const dupes = [...byHash.values()].filter((v) => v.paths.length > 1);
const wastedBytes = dupes.reduce((n, d) => n + d.size * (d.paths.length - 1), 0);
const unique = [...byHash.values()];
const uniqueBytes = unique.reduce((n, d) => n + d.size, 0);

console.log(`${files.length} PDFs, ${mb(total)}MB on disk`);
console.log(`${unique.length} unique by content, ${mb(uniqueBytes)}MB`);
console.log(`${dupes.length} duplicated file(s) wasting ${mb(wastedBytes)}MB\n`);

if (dupes.length) {
  console.log("duplicates (first 12):");
  for (const d of dupes.slice(0, 12)) {
    console.log(`  ${mb(d.size)}MB x${d.paths.length}`);
    d.paths.forEach((p) => console.log(`      ${p}`));
  }
  console.log();
}

const sorted = unique.sort((a, b) => b.size - a.size);
console.log("largest unique files:");
sorted.slice(0, 12).forEach((d) => console.log(`  ${mb(d.size).padStart(7)}MB  ${d.paths[0]}`));

const buckets = { "<1MB": 0, "1-5MB": 0, "5-20MB": 0, "20-50MB": 0, ">50MB": 0 };
for (const d of unique) {
  const m = d.size / 1024 / 1024;
  if (m < 1) buckets["<1MB"]++;
  else if (m < 5) buckets["1-5MB"]++;
  else if (m < 20) buckets["5-20MB"]++;
  else if (m < 50) buckets["20-50MB"]++;
  else buckets[">50MB"]++;
}
console.log("\nsize distribution (unique):");
for (const [k, v] of Object.entries(buckets)) console.log(`  ${k.padEnd(8)} ${v}`);
