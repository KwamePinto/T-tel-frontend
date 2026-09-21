# Build & maintenance scripts

Node/Python utilities that support the site but aren't part of the app
itself — nothing here runs in the browser or is imported by `src/`.

| Script | Run it with | What it does |
|---|---|---|
| `build-sitemap.mjs` | `npm run sitemap` | Writes `public/sitemap.xml` from the live API. Reads `VITE_SITE_URL` for the domain and `VITE_API_URL` for where to fetch content from — run it against production once the API is reachable, or pass a URL directly: `node scripts/build-sitemap.mjs https://t-tel.org`. |
| `audit-css-modules.mjs` | `npm run audit:css` | Flags any `styles.foo` a component references that its `.module.css` doesn't define — the fastest way to catch a typo'd class name that silently does nothing. Run it after any CSS-module edit. |
| `optimise-assets.mjs` | `node scripts/optimise-assets.mjs` | Resizes and recompresses everything in `public/images` to the largest size the UI actually renders it at. Safe to re-run — an already-optimised file just stays the same size. |
| `optimise-history.mjs` | `node scripts/optimise-history.mjs` | One-off: shrank the Our History milestone photos to a sensible size after import. Kept for reference; re-run only if a similarly oversized batch is added the same way. |
| `scale-fonts.mjs` | `node scripts/scale-fonts.mjs` | One-off: scaled every hardcoded `font-size` in the stylesheets up by a fixed factor, during a pass to make body text more readable. Not meant to be run again without checking what it would touch first. |
| `survey-docs.mjs` | `node scripts/survey-docs.mjs <dir>` | Surveys a folder of Knowledge Hub PDFs before ingesting them into the backend — duplicate detection, size totals, filename issues. Run this against any future batch of documents before `ttel-backend`'s `ingestDocs.js`. |
| `compress_pdfs.py` | `python scripts/compress_pdfs.py <dir>` | Shrinks scanned PDFs by downsampling their page images — most Knowledge Hub source files are 300dpi scans, far higher resolution than a screen needs. Requires `pikepdf` and `Pillow` (`pip install pikepdf pillow`). `--dry` first to see the size estimate before committing to a batch. |

## Which of these will I actually need again?

**Recurring, as content grows:** `audit:css` after any styling change,
`sitemap` after a deploy or a content change, and `survey-docs.mjs` +
`compress_pdfs.py` before ingesting any future batch of Knowledge Hub PDFs.

**One-off, kept for reference:** `optimise-history.mjs` and
`scale-fonts.mjs` solved a specific problem once. Read the comment at the
top of either before running it again — they were not written to be safe
against today's content, only against what existed when they ran.

**`optimise-assets.mjs`** sits in between: reusable in shape, but only
worth running again after a genuinely large batch of new images lands in
`public/images` — day-to-day uploads go through the CMS's own R2 storage
and are unaffected by this script.
