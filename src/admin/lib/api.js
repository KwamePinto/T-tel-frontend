const BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

class ApiError extends Error {
  constructor(status, message, details) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

async function request(path, { method = "GET", body, params, signal } = {}) {
  const url = new URL(`/api${path}`, BASE);
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      if (v !== undefined && v !== null && v !== "") url.searchParams.set(k, v);
    }
  }

  const isForm = body instanceof FormData;
  const res = await fetch(url, {
    method,
    credentials: "include", // auth cookie
    headers: isForm ? undefined : body ? { "Content-Type": "application/json" } : undefined,
    body: isForm ? body : body ? JSON.stringify(body) : undefined,
    signal,
  });

  if (res.status === 204) return null;

  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    // an HTML error page usually means the API is down or the URL is wrong
    throw new ApiError(res.status, `Unexpected response from the server (${res.status})`);
  }

  if (!res.ok) throw new ApiError(res.status, data?.error || "Request failed", data?.details);
  return data;
}

const admin = (path, opts) => request(`/admin${path}`, opts);

/** Standard verbs for a resource, matching the backend's CRUD factory. */
function resource(name) {
  return {
    list: (params) => admin(`/${name}`, { params }),
    get: (id) => admin(`/${name}/${id}`),
    create: (body) => admin(`/${name}`, { method: "POST", body }),
    update: (id, body) => admin(`/${name}/${id}`, { method: "PATCH", body }),
    trash: (id) => admin(`/${name}/${id}`, { method: "DELETE" }),
    restore: (id) => admin(`/${name}/${id}/restore`, { method: "POST" }),
    destroy: (id) => admin(`/${name}/${id}/permanent`, { method: "DELETE" }),
    reorder: (items) => admin(`/${name}/reorder`, { method: "POST", body: { items } }),
  };
}

export const api = {
  auth: {
    login: (email, password) => admin("/auth/login", { method: "POST", body: { email, password } }),
    logout: () => admin("/auth/logout", { method: "POST" }),
    me: () => admin("/auth/me"),
    updateProfile: (body) => admin("/auth/profile", { method: "PATCH", body }),
  },

  dashboard: () => admin("/dashboard"),

  posts: resource("posts"),
  pages: resource("pages"),
  contentTypes: resource("content-types"),
  tags: resource("tags"),
  people: resource("people"),
  personGroups: resource("person-groups"),
  partners: resource("partners"),
  events: resource("events"),
  eventCategories: resource("event-categories"),
  sliders: resource("sliders"),
  documents: resource("documents"),
  documentCategories: resource("document-collections"),
  forms: resource("forms"),
  menus: resource("menus"),

  media: {
    list: (params) => admin("/media", { params }),
    update: (id, body) => admin(`/media/${id}`, { method: "PATCH", body }),
    remove: (id) => admin(`/media/${id}`, { method: "DELETE" }),
    upload: (files, extra = {}) => {
      const fd = new FormData();
      for (const f of files) fd.append("files", f);
      for (const [k, v] of Object.entries(extra)) fd.append(k, v);
      return admin("/media", { method: "POST", body: fd });
    },
    folders: () => admin("/media-folders"),
    createFolder: (name, parent = null) => admin("/media-folders", { method: "POST", body: { name, parent } }),
    deleteFolder: (id) => admin(`/media-folders/${id}`, { method: "DELETE" }),
  },

  menuItems: {
    list: (menuId) => admin(`/menus/${menuId}/items`),
    save: (menuId, items) => admin(`/menus/${menuId}/items`, { method: "PUT", body: { items } }),
  },

  submissions: {
    list: (formId, params) => admin(`/forms/${formId}/submissions`, { params }),
    markRead: (id, isRead = true) => admin(`/submissions/${id}`, { method: "PATCH", body: { isRead } }),
    remove: (id) => admin(`/submissions/${id}`, { method: "DELETE" }),
  },

  users: {
    list: () => admin("/users"),
    create: (body) => admin("/users", { method: "POST", body }),
    update: (id, body) => admin(`/users/${id}`, { method: "PATCH", body }),
    remove: (id, reassignTo) => admin(`/users/${id}`, { method: "DELETE", params: { reassignTo } }),
  },

  trash: {
    list: () => admin("/trash"),
    restore: (type, id) => admin(`/trash/${type}/${id}/restore`, { method: "POST" }),
    destroy: (type, id) => admin(`/trash/${type}/${id}`, { method: "DELETE" }),
    restoreAll: () => admin("/trash/restore-all", { method: "POST" }),
    empty: () => admin("/trash/empty", { method: "DELETE" }),
  },

  settings: {
    get: (group) => admin(`/settings/${group}`),
    schema: (group) => admin(`/settings/${group}/schema`),
    save: (group, body) => admin(`/settings/${group}`, { method: "PUT", body }),
  },
};

export { ApiError, BASE as API_BASE };
