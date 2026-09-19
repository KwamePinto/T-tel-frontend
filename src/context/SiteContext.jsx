import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { cms } from "../lib/cms";

const SiteContext = createContext(null);

// Shown until /bootstrap answers, and kept if it never does, so the shell
// still renders with the site's own wording rather than an empty frame.
const FALLBACK_SETTINGS = {
  site_name: "T-TEL",
  site_tagline: "Transforming Teaching, Education and Learning",
  accent_color: "#027f6c",
  logo_url: "/images/logo-ink.png",
  logo_dark_url: "/images/logo-white.png",
  enable_dark_mode: true,
  enable_font_size: true,
  enable_language: true,
  enable_search: true,
  blog_label: "News & Media",
  cta_label: "Contact Us",
  cta_url: "/contact-us",
};

export function SiteProvider({ children }) {
  const [settings, setSettings] = useState(FALLBACK_SETTINGS);
  const [menus, setMenus] = useState({});
  const [ready, setReady] = useState(false);
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    let cancelled = false;

    cms
      .bootstrap()
      .then(({ settings: s, menus: m }) => {
        if (cancelled) return;
        setSettings({ ...FALLBACK_SETTINGS, ...s });
        setMenus(m || {});
        setOffline(false);
      })
      .catch(() => {
        // the API being unreachable must not blank the site
        if (!cancelled) setOffline(true);
      })
      .finally(() => {
        if (!cancelled) setReady(true);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // the accent colour is editable in Theme Settings, so push it into CSS
  useEffect(() => {
    if (settings.accent_color) {
      document.documentElement.style.setProperty("--accent", settings.accent_color);
    }
  }, [settings.accent_color]);

  const value = useMemo(
    () => ({
      settings,
      menus,
      ready,
      offline,
      /** truthy check that treats "false"/"0" strings from settings as false */
      flag: (key, fallback = true) => {
        const v = settings[key];
        if (v === undefined || v === null || v === "") return fallback;
        return v !== false && v !== "false" && v !== 0 && v !== "0";
      },
      menu: (slug) => menus[slug]?.items || [],
    }),
    [settings, menus, ready, offline],
  );

  return <SiteContext.Provider value={value}>{children}</SiteContext.Provider>;
}

export function useSite() {
  const ctx = useContext(SiteContext);
  if (!ctx) throw new Error("useSite must be used inside <SiteProvider>");
  return ctx;
}
