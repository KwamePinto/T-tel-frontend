/**
 * The site's current language, held outside React.
 *
 * It lives here rather than in a context because two very different things
 * need it: components, which re-render through useSyncExternalStore, and the
 * plain `cms` fetch helpers in lib/cms.js, which are called from anywhere and
 * have no hooks available. A module-level store with a subscription serves
 * both, and it is what lets every content fetch re-run on a language change
 * without a single call site being touched — useCms subscribes to the version
 * counter and treats it as a dependency.
 */
export const LANGS = [
  { code: "en", label: "English", short: "EN" },
  { code: "fr", label: "Français", short: "FR" },
];

export const DEFAULT_LANG = "en";

/**
 * Read at module load, not in an effect.
 *
 * The fetch helpers in lib/cms.js ask this store for the language, and the
 * first of those calls goes out during the very first render — before any
 * effect has run. Restoring the saved choice here is what stops a reload in
 * French fetching its first few pieces of content in English.
 */
function restore() {
  try {
    const raw = localStorage.getItem("ttel-prefs");
    const saved = raw ? JSON.parse(raw)?.lang : null;
    return LANGS.some((l) => l.code === saved) ? saved : DEFAULT_LANG;
  } catch {
    return DEFAULT_LANG;
  }
}

const listeners = new Set();
let lang = typeof localStorage === "undefined" ? DEFAULT_LANG : restore();
let version = 0;

if (typeof document !== "undefined") document.documentElement.lang = lang;

export function getLang() {
  return lang;
}

/** Bumped on every change, so a cache-keyed hook can depend on it. */
export function getVersion() {
  return version;
}

export function setLang(next) {
  const code = LANGS.some((l) => l.code === next) ? next : DEFAULT_LANG;
  if (code === lang) return;
  lang = code;
  version += 1;
  if (typeof document !== "undefined") document.documentElement.lang = code;
  for (const fn of listeners) fn();
}

export function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}
