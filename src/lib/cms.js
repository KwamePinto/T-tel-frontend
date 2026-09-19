const BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

async function get(path, params) {
  const url = new URL(`/api${path}`, BASE);
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      if (v !== undefined && v !== null && v !== "") url.searchParams.set(k, v);
    }
  }
  const res = await fetch(url);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed (${res.status})`);
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

/** Turns a stored media path into something the browser can load. */
export function mediaUrl(value) {
  if (!value) return "";
  const url = typeof value === "string" ? value : value.url;
  if (!url) return "";
  if (/^https?:\/\//i.test(url)) return url;
  // seeded records point at files that ship with the front end
  if (url.startsWith("/images/") || url.startsWith("/video/")) return url;
  return new URL(url, BASE).toString();
}

export { BASE as CMS_BASE };
