import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useSite } from "../context/SiteContext";
import { mediaUrl } from "../lib/cms";

/**
 * Writes the document title and meta tags for the current page.
 *
 * The Page model already stores meta.title / meta.description / meta.canonical
 * / meta.noindex and the dashboard edits them — nothing was rendering any of
 * it, so every page served the same title and no description at all.
 *
 * React 19 hoists <title> and <meta> from JSX, but only for tags it renders;
 * doing it here keeps one place responsible for cleaning up stale tags when
 * moving between pages.
 */
function upsert(selector, attrs) {
  let el = document.head.querySelector(selector);
  if (!el) {
    el = document.createElement(attrs.tag || "meta");
    document.head.appendChild(el);
  }
  for (const [k, v] of Object.entries(attrs)) {
    if (k === "tag") continue;
    if (v == null || v === "") el.removeAttribute(k);
    else el.setAttribute(k, v);
  }
  return el;
}

export default function Seo({ title, description, image, type = "website", noindex = false }) {
  const { settings } = useSite();
  const { pathname } = useLocation();

  const siteName = settings.site_name || "T-TEL";
  const tagline = settings.site_tagline || "Transforming Teaching, Education and Learning";
  const fullTitle = title ? `${title} | ${siteName}` : `${siteName} | ${tagline}`;
  const desc = (description || settings.footer_text || tagline).replace(/\s+/g, " ").trim().slice(0, 300);
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const url = `${origin}${pathname}`;
  const img = image ? mediaUrl(image) : `${origin}/images/hero/home.jpg`;

  useEffect(() => {
    document.title = fullTitle;

    upsert('meta[name="description"]', { name: "description", content: desc });
    upsert('link[rel="canonical"]', { tag: "link", rel: "canonical", href: url });
    upsert('meta[name="robots"]', { name: "robots", content: noindex ? "noindex,nofollow" : "index,follow" });

    // Open Graph — what Facebook, LinkedIn and WhatsApp read
    upsert('meta[property="og:title"]', { property: "og:title", content: fullTitle });
    upsert('meta[property="og:description"]', { property: "og:description", content: desc });
    upsert('meta[property="og:type"]', { property: "og:type", content: type });
    upsert('meta[property="og:url"]', { property: "og:url", content: url });
    upsert('meta[property="og:image"]', { property: "og:image", content: img });
    upsert('meta[property="og:site_name"]', { property: "og:site_name", content: siteName });

    // Twitter/X reads its own set
    upsert('meta[name="twitter:card"]', { name: "twitter:card", content: "summary_large_image" });
    upsert('meta[name="twitter:title"]', { name: "twitter:title", content: fullTitle });
    upsert('meta[name="twitter:description"]', { name: "twitter:description", content: desc });
    upsert('meta[name="twitter:image"]', { name: "twitter:image", content: img });
  }, [fullTitle, desc, url, img, type, noindex, siteName]);

  return null;
}
