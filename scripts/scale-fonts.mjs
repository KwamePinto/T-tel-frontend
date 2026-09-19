/**
 * Scales every hardcoded font-size in the public site's stylesheets.
 *
 *   node scripts/scale-fonts.mjs [factor] [--dry]
 *
 * Most of the site sets font sizes in px/clamp() inside CSS modules rather
 * than through the --fs-* tokens, so bumping the tokens alone moves almost
 * nothing. This walks the declarations instead.
 *
 * Skips src/admin (the dashboard's density is deliberate) and leaves
 * relative units (em/rem/%) alone, since those already inherit.
 */
import fs from "node:fs";
import path from "node:path";

const factor = Number(process.argv[2]) || 1.12;
const dry = process.argv.includes("--dry");
const SKIP = ["src/admin"];

const files = [];
(function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (SKIP.some((s) => p.replace(/\\/g, "/").startsWith(s))) continue;
    if (entry.isDirectory()) walk(p);
    else if (entry.name.endsWith(".css")) files.push(p);
  }
})("src");

/** 15 -> 16.8, trimmed of trailing zeros. */
const scale = (n) => {
  const out = Math.round(Number(n) * factor * 10) / 10;
  return String(out);
};

let changed = 0;
let decls = 0;

for (const file of files) {
  const before = fs.readFileSync(file, "utf8");

  const after = before.replace(/font-size:\s*([^;}]+)/g, (whole, value) => {
    // leave inherit/initial and relative units untouched
    if (/inherit|initial|unset|currentColor|em\b|rem\b|%/.test(value)) return whole;
    if (!/\d/.test(value)) return whole;

    const next = value.replace(/(-?[\d.]+)(px|vw)/g, (_, n, unit) => scale(n) + unit);
    if (next === value) return whole;
    decls++;
    return `font-size: ${next}`;
  });

  if (after !== before) {
    changed++;
    if (!dry) fs.writeFileSync(file, after);
  }
}

console.log(
  `${dry ? "[dry run] " : ""}scaled ${decls} declaration(s) by ${factor}x across ${changed} file(s) ` +
  `(${files.length} scanned, src/admin skipped)`,
);
