import { Link, useParams } from "react-router-dom";
import PageHero from "../../components/PageHero";
import PageSections from "../../components/PageSections";
import Icon from "../../components/Icon";
import { Loading, ErrorState } from "../../components/States";
import { cms, mediaUrl } from "../../lib/cms";
import { useCms } from "../../hooks/useCms";
import CustomPage from "../CustomPage";
import prose from "../ArticleDetail.module.css";
import styles from "./FocusAreaDetail.module.css";

export default function FocusAreaDetail() {
  const { slug } = useParams();
  const area = useCms(() => cms.post(slug), [slug]);
  const all = useCms(() => cms.posts({ type: "focus-areas", limit: 50 }), []);

  if (area.loading) {
    return (
      <section className="section">
        <div className="container"><Loading rows={6} /></div>
      </section>
    );
  }
  if (area.error) {
    // This route also covers custom pages filed under this menu, because a
    // dynamic segment outranks the catch-all and would otherwise swallow
    // them. Nothing here by that name means it is a page, not a focus area — and
    // if it is neither, CustomPage renders the 404 itself.
    if (area.error.status === 404) return <CustomPage />;
    return (
      <section className="section">
        <div className="container">
          <ErrorState error={area.error} onRetry={area.reload} label="focus area" />
          <Link to="/focus-areas" className="link-arrow">
            <Icon name="arrowRight" size={16} style={{ transform: "rotate(180deg)" }} />
            All focus areas
          </Link>
        </div>
      </section>
    );
  }

  const post = area.data;
  const accent = post.accent === "orange" ? "var(--orange)" : "var(--teal)";
  // Written per focus area in the admin. The older pages were all showing one
  // hard-coded partners paragraph, which said the same thing on nine pages;
  // an area that has not been given its own panel now simply goes without.
  const key = post.keyInfo || {};
  const others = (all.data?.items || []).filter((o) => o.slug !== slug).slice(0, 6);

  return (
    <>
      <PageHero
        title={post.title}
        crumb={post.title}
        subtitle={post.excerpt}
        image={mediaUrl(post.featuredImage)}
        band={post.tags?.[0] ? { label: post.tags[0].name, color: accent } : undefined}
      />

      <section className="section">
        {/* One column of text with its pictures set into it, and the panel
            holding its place alongside — the layout stays two columns whether
            or not the post has laid-out blocks, because the panel is the
            point of it. */}
        <div className={`container ${styles.layout}`}>
          <article className={styles.body}>
            {post.sections?.length ? (
              <PageSections sections={post.sections} variant="column" />
            ) : (
              <div className={prose.prose} dangerouslySetInnerHTML={{ __html: post.body }} />
            )}
          </article>

          <aside className={styles.aside}>
            {key.title && (
              <div className={`${styles.asideCard} reveal`} style={{ background: accent }}>
                {key.label && <span className={styles.asideEyebrow}>{key.label}</span>}
                <h3>{key.title}</h3>
                <span className={styles.asideRule} />
                {key.html && (
                  <div
                    className={styles.asideBody}
                    dangerouslySetInnerHTML={{ __html: key.html }}
                  />
                )}
                {key.linkUrl && key.linkLabel && (
                  <Link to={key.linkUrl} className={styles.asideLink}>
                    {key.linkLabel}
                    <Icon name="arrowRight" size={16} />
                  </Link>
                )}
              </div>
            )}

            <Link to="/focus-areas" className={styles.backLink}>
              <Icon name="arrowRight" size={16} style={{ transform: "rotate(180deg)" }} />
              All focus areas
            </Link>
          </aside>
        </div>
      </section>

      {others.length > 0 && (
        <section className={`section ${styles.others}`}>
          <div className="container">
            <h2 className={`${styles.othersTitle} reveal`}>Explore other areas</h2>
            <div className={styles.othersGrid}>
              {others.map((o, i) => (
                <Link
                  key={o._id}
                  to={`/focus-areas/${o.slug}`}
                  className={`${styles.otherCard} ${styles[o.accent || (i % 2 ? "teal" : "orange")]} reveal`}
                  data-delay={String(i % 3)}
                >
                  <span className={styles.otherBar} />
                  <span className={styles.otherNum}>{o.number}</span>
                  {o.tags?.[0] && <span className={styles.otherTag}>{o.tags[0].name}</span>}
                  <h3>{o.title}</h3>
                  <span className="link-arrow">
                    View profile
                    <Icon name="arrowRight" size={16} />
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
