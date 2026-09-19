import { useCallback, useEffect, useState } from "react";

const DEFAULTS = { textsize: "md", theme: "light", lang: "EN" };
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
  root.lang = prefs.lang.toLowerCase();
}

export default function useSitePrefs() {
  const [prefs, setPrefs] = useState(read);

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
