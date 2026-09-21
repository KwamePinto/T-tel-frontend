# T-TEL Frontend

The public T-TEL (Transforming Teaching, Education & Learning) website and
its admin dashboard — React 19 + Vite, with every piece of content coming
from the backend CMS API. There is no hardcoded content left in this
repository; if something is wrong on the site, it is wrong in the database,
not in this code.

Deployed independently from the API — see
[`ttel-backend`](../ttel-backend) for the Express/MongoDB service this site
calls. Deploy them as two separate services; this repo has no database
connection or file storage of its own.

## Contents

- [Stack](#stack)
- [Project structure](#project-structure)
- [Local setup](#local-setup)
- [Environment variables](#environment-variables)
- [The admin dashboard](#the-admin-dashboard)
- [Maintenance scripts](#maintenance-scripts)
- [Deployment](#deployment)
- [SEO](#seo)

## Stack

- **React 19 + React Router 7** — the public site and the admin dashboard
  are one app, code-split so the admin bundle (`/admin/*`) only loads for
  someone who navigates there
- **Vite 8** — dev server and build
- **CSS Modules** — every component's styling is scoped to itself; there is
  no global stylesheet beyond design tokens and the background pattern
- **`useReveal`** — a small IntersectionObserver hook driving the
  scroll-in animation used across the site (the `.reveal` class)

## Project structure

```
src/
  pages/          one file (or folder) per route — the public site
  admin/          the CMS dashboard, mounted at /admin/*
  components/     shared UI: header, footer, search, the person/team modal, …
  hooks/          useCms (data fetching), useReveal, useSite (settings)
  lib/cms.js      every API call the site makes, in one place
  styles/         design tokens and shared editorial classes
public/
  images/         static assets that aren't uploaded content (hero
                   fallbacks, the background pattern, favicons)
scripts/          build and maintenance tooling — see scripts/README.md
```

Content itself — pages, people, partners, Knowledge Hub documents, media —
lives in the backend's MongoDB, not in this folder. `src/lib/cms.js` is the
one place that knows how to ask for it.

## Local setup

```bash
npm install
cp .env.example .env       # point VITE_API_URL at a running backend
npm run dev                 # http://localhost:5173
```

The backend must be running (see `../ttel-backend/README.md`) for anything
beyond the empty shell to render — this site has no fallback content.

## Environment variables

Every variable is documented inline in **`.env.example`**. All three are
compiled into the built bundle at build time (that's what the `VITE_`
prefix means to Vite) — never put a secret here, only public URLs.

| Variable | Required | Purpose |
|---|---|---|
| `VITE_API_URL` | yes | Where the backend API lives — `http://localhost:5000` locally, the backend's deployed URL in production |
| `VITE_SITE_URL` | recommended | This site's own public URL — used by `scripts/build-sitemap.mjs` when generating `sitemap.xml` |
| `VITE_MEDIA_URL` | optional | The storage bucket's public base URL, so uploaded images load straight from the CDN instead of being redirected through the API. Leave blank if the backend is using local disk storage. Matches the backend's `S3_PUBLIC_BASE_URL`. |

## The admin dashboard

The CMS is part of this same app, at `/admin` — there is no separate
repository or deploy for it. It talks to the same backend as the public
site (`VITE_API_URL`) and is code-split into its own JS/CSS bundle
(`AdminApp-*.js`), so a visitor to the public site never downloads it.

Sign in with the account created by the backend's `npm run seed` (or
whichever admin exists in the database this frontend is pointed at).

## Maintenance scripts

`scripts/` holds the sitemap generator, a CSS-module class-name auditor,
image/PDF optimisers, and a couple of one-off scripts kept for reference.
What each one does and when to run it again is catalogued in
[`scripts/README.md`](scripts/README.md).

## Deployment

Deployed on Render (or any static host) as a static site built from this
repo, separate from the backend service.

1. **Build command:** `npm install && npm run build`
2. **Publish directory:** `dist`
3. Set `VITE_API_URL` (and `VITE_SITE_URL`, `VITE_MEDIA_URL` if used) in the
   host's environment variables **before** the build runs — Vite bakes
   `VITE_*` values into the bundle at build time, so changing one after
   deploying requires a rebuild, not just a restart.
4. **SPA routing:** this is a client-side-routed React app — the host must
   rewrite every path that doesn't match a real static file back to
   `index.html` (Render's "Rewrite rule: `/*` → `/index.html`", or the
   equivalent on another host), or a direct link to e.g.
   `/about-us/our-history` will 404.
5. Once deployed, confirm `CLIENT_ORIGIN` on the **backend** matches this
   site's exact production URL — the API refuses cross-origin requests from
   anywhere else, and a mismatch here is the most common cause of a
   freshly-deployed site showing no content. See
   `../ttel-backend/README.md`'s Troubleshooting section.

## SEO

`src/components/Seo.jsx` sets the page title, meta description and
canonical link per page from each page's own CMS record. `sitemap.xml` is
generated separately — run `npm run sitemap` after a content change (or
wire it into a deploy step) rather than expecting it to update itself; it
is a static file, not generated at request time.
