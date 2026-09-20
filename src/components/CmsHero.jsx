import PageHero from "./PageHero";
import { cms, mediaUrl } from "../lib/cms";
import { useCms } from "../hooks/useCms";

/**
 * A PageHero that takes its content from the page's own record, falling back
 * to whatever the component passes in.
 *
 * The listing pages — Knowledge Hub, Programmes, Our People and the rest — are
 * built around a collection rather than around their own text, so their Page
 * record went unread and editing them in the admin changed nothing. This is
 * what connects the one part of those pages that is genuinely theirs.
 *
 * The props stay as the fallback rather than being deleted, so a page whose
 * record is missing, unpublished or yet to be filled in still renders exactly
 * as it was designed.
 */
export default function CmsHero({ slug, title, crumb, subtitle, image, band }) {
  const { data: page } = useCms(() => cms.page(slug), [slug]);

  return (
    <PageHero
      title={page?.meta?.heroTitle || title}
      crumb={crumb || title}
      subtitle={page?.meta?.heroDescription || subtitle}
      image={mediaUrl(page?.heroImage) || image}
      band={band}
    />
  );
}
