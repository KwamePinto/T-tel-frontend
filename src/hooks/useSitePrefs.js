import { useCallback, useEffect, useState } from "react";
import { DEFAULT_LANG, getLang, setLang, subscribe } from "../i18n/store";

const DEFAULTS = { textsize: "md", theme: "light", lang: DEFAULT_LANG };
const KEY = "ttel-prefs";

function read() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? { ...DEFAULTS, ...JSON.parse(raw) } : DEFAULTS;
  } catch {
    return DEFAULTS;
  }
}

function apply(prefs) {
  const root = document.documentElement;
  root.dataset.textsize = prefs.textsize;
  root.dataset.theme = prefs.theme;
  // the language lives in its own store as well, because the plain fetch
  // helpers in lib/cms.js need it and have no hooks available
  setLang(prefs.lang);
  root.lang = prefs.lang;
}

export default function useSitePrefs() {
  const [prefs, setPrefs] = useState(read);

  // Two components call this hook — the layout and the settings panel — so
  // each holds its own copy. Subscribing to the shared language store keeps
  // them showing the same answer when the other one changes it.
  useEffect(() => subscribe(() => {
    setPrefs((p) => (p.lang === getLang() ? p : { ...p, lang: getLang() }));
  }), []);

  useEffect(() => {
    apply(prefs);
    try {
      localStorage.setItem(KEY, JSON.stringify(prefs));
    } catch {
      /* storage unavailable — settings just won't persist */
    }
  }, [prefs]);

  const setPref = useCallback((key, value) => {
    setPrefs((p) => ({ ...p, [key]: value }));
  }, []);

  const reset = useCallback(() => setPrefs(DEFAULTS), []);

  return { prefs, setPref, reset };
}
