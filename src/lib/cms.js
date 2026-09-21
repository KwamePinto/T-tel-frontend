import { DEFAULT_LANG, getLang } from "../i18n/store";

function resolveApiBase() {
  const configured = import.meta.env.VITE_API_URL || "";
  if (configured && configured !== "http://localhost:5000" && configured !== "http://127.0.0.1:5000") {
    return configured.replace(/\/+$/, "");
  }

  if (typeof window !== "undefined") {
    const hostname = window.location.hostname || "localhost";
    return `http://${hostname}:5000`;
  }

  return configured || "http://localhost:5000";
}

const BASE = resolveApiBase();

async function get(path, params) {
  const url = new URL(`/api${path}`, BASE);
  // The API answers in English unless asked otherwise, and falls back field by
  // field, so a record with no French yet still comes back readable.
  const lang = getLang();
  if (lang !== DEFAULT_LANG) url.searchParams.set("lang", lang);
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      if (v !== undefined && v !== null && v !== "") url.searchParams.set(k, v);
    }
  }
  const res = await fetch(url);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const err = new Error(body.error || `Request failed (${res.status})`);
    // a missing page is an ordinary 404 to be rendered as such, not a fault to
    // report — callers need the code to tell those apart
    err.status = res.status;
    throw err;
  }
  return res.json();
}

export const cms = {
  /** settings + menus in one call, for the site shell */
  bootstrap: () => get("/bootstrap"),

  posts: (params) => get("/posts", params),
  post: (slug) => get(`/posts/${slug}`),
  page: (slug) => get(`/pages/${slug}`),

  people: (group) => get("/people", { group }),
  personGroups: () => get("/person-groups"),

  partners: (params) => get("/partners", params),
  partnerGroups: () => get("/partner-groups"),

  search: (q, limit) => get("/search", { q, limit }),

  documents: (params) => get("/documents", params),
  documentCategories: () => get("/document-collections"),
  trackDownload: (id) =>
    fetch(new URL(`/api/documents/${id}/download`, BASE), { method: "POST" }).then((r) => r.json()),
  /** Same file, asked for with a disposition the browser renders instead of saves. */
  previewUrl: (id) => new URL(`/api/documents/${id}/file?inline=1`, BASE).toString(),

  events: (params) => get("/events", params),
  event: (slug) => get(`/events/${slug}`),

  slider: (slug) => get(`/sliders/${slug}`),

  form: (slug) => get(`/forms/${slug}`),
  submitForm: async (slug, payload) => {
    const res = await fetch(new URL(`/api/forms/${slug}/submit`, BASE), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(body.error || "Could not send your message");
    return body;
  },
};

/**
 * Where uploaded files are served from. Set this to the bucket's public URL
 * and the browser fetches them straight from the CDN.
 *
 * Without it every picture is two round trips: one to the API, which answers
 * with a redirect, and one to the bucket. That roughly doubles the time per
 * image even against a local API, and in production it puts the whole image
 * load of every page through the API host. Leave it unset and uploads are
 * served by the API, which is what local development on disk storage needs.
 */
const MEDIA_BASE = (import.meta.env.VITE_MEDIA_URL || "").replace(/\/+$/, "");

/** Turns a stored media path into something the browser can load. */
export function mediaUrl(value) {
  if (!value) return "";
  const url = typeof value === "string" ? value : value.url;
  if (!url) return "";
  if (/^https?:\/\//i.test(url)) return url;
  // seeded records point at files that ship with the front end
  if (url.startsWith("/images/") || url.startsWith("/video/")) return url;
  if (MEDIA_BASE && url.startsWith("/uploads/")) return MEDIA_BASE + url.slice("/uploads".length);
  return new URL(url, BASE).toString();
}

export { BASE as CMS_BASE };
