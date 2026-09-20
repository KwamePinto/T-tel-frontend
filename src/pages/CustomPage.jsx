import { useLocation } from "react-router-dom";
import PageHero from "../components/PageHero";
import Seo from "../components/Seo";
import { Loading, ErrorState } from "../components/States";
import { cms, mediaUrl } from "../lib/cms";
import { useCms } from "../hooks/useCms";
import NotFound from "./NotFound";
import prose from "./ArticleDetail.module.css";
import styles from "./CustomPage.module.css";

/**
 * Renders any page the admin creates: a hero and a block of rich text.
 *
 * This sits on the catch-all route, after every page with a component of its
 * own, so it only ever sees an address nothing else claimed. Before it existed
 * a page created in the admin had no route and so appeared nowhere on the
 * site — it saved, it looked fine in the list, and the address 404'd.
 *
 * Anything not found here really is a 404: the API only serves published
 * pages, so a draft correctly falls through to the same screen as a bad
 * address rather than leaking.
 */
export default function CustomPage() {
  const { pathname } = useLocation();
  const slug = pathname.replace(/^\/+|\/+$/g, "");

  const { data: page, loading, error, reload } = useCms(() => cms.page(slug), [slug]);

  if (loading) {
    return (
      <div className="container" style={{ paddingTop: "calc(var(--header-h) + 60px)" }}>
        <Loading rows={8} />
      </div>
    );
  }

  // 404 is the ordinary outcome for an address nobody has made a page for;
  // anything else is worth showing as an error with a way to retry
  if (error) {
    if (error.status === 404) return <NotFound />;
    return (
      <div className="container" style={{ paddingTop: "calc(var(--header-h) + 60px)" }}>
        <ErrorState error={error} onRetry={reload} label="page" />
      </div>
    );
  }

  if (!page) return <NotFound />;

  return (
    <>
      <Seo
        title={page.meta?.title || page.title}
        description={page.meta?.description}
        image={page.heroImage}
        noindex={page.meta?.noindex}
      />
      <PageHero
        title={page.meta?.heroTitle || page.title}
        crumb={page.title}
        subtitle={page.meta?.heroDescription}
        image={mediaUrl(page.heroImage) || "/images/photos/team-group.jpg"}
      />

      {page.body && (
        <section className="section">
          <div className="container">
            <div
              className={`${prose.prose} ${styles.body}`}
              dangerouslySetInnerHTML={{ __html: page.body }}
            />
          </div>
        </section>
      )}
    </>
  );
}
