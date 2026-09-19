/**
 * Flags CSS-module classes that a component references but the stylesheet
 * never defines. Those render as the literal string "undefined" in class
 * lists and silently lose their styling.
 *
 *   node scripts/audit-css-modules.mjs
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = "src";
const files = [];

(function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== "node_modules") walk(p);
    } else if (/\.jsx?$/.test(entry.name)) {
      files.push(p);
    }
  }
})(ROOT);

const IMPORT_RE = /import\s+(\w+)\s+from\s+["']([^"']+\.module\.css)["']/g;
const SELECTOR_RE = /\.(-?[A-Za-z_][\w-]*)/g;
// CSS Modules also export @keyframes names, so those are legitimate lookups
const KEYFRAMES_RE = /@keyframes\s+(-?[A-Za-z_][\w-]*)/g;

let problems = 0;

for (const file of files) {
  const src = fs.readFileSync(file, "utf8");

  for (const [, ident, rel] of src.matchAll(IMPORT_RE)) {
    const cssPath = path.resolve(path.dirname(file), rel);
    if (!fs.existsSync(cssPath)) {
      console.log(`MISSING CSS  ${file} -> ${rel}`);
      problems++;
      continue;
    }

    const css = fs.readFileSync(cssPath, "utf8");
    const defined = new Set([
      ...[...css.matchAll(SELECTOR_RE)].map((m) => m[1]),
      ...[...css.matchAll(KEYFRAMES_RE)].map((m) => m[1]),
    ]);

    // `styles.foo` — including inside template literals such as `${styles.foo}`
    const useRe = new RegExp(String.raw`\b${ident}\.([A-Za-z_][A-Za-z0-9_]*)`, "g");
    const used = new Set([...src.matchAll(useRe)].map((m) => m[1]));

    for (const name of used) {
      if (!defined.has(name)) {
        console.log(`UNDEFINED    ${file}: ${ident}.${name}  (not in ${path.basename(cssPath)})`);
        problems++;
      }
    }
  }
}

console.log(
  problems
    ? `\n${problems} problem(s) across ${files.length} files`
    : `\nclean — ${files.length} files checked`,
);
process.exit(problems ? 1 : 0);
