import { Link, useParams } from "react-router-dom";
import PageHero from "../../components/PageHero";
import Icon from "../../components/Icon";
import { Loading, ErrorState } from "../../components/States";
import { cms, mediaUrl } from "../../lib/cms";
import { useCms } from "../../hooks/useCms";
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
        <div className={`container ${styles.layout}`}>
          <article className={styles.body}>
            <div className={prose.prose} dangerouslySetInnerHTML={{ __html: post.body }} />
          </article>

          <aside className={styles.aside}>
            <div className={`${styles.asideCard} reveal`} style={{ background: accent }}>
              <span className={styles.asideEyebrow}>Institutional Links</span>
              <h3>Delivery Partners</h3>
              <span className={styles.asideRule} />
              <p>
                Delivered with the Ministry of Education, Ghana Education Service, GTEC, NaCCA, the
                National Teaching Council and NaSIA, alongside our funding and research partners.
              </p>
              <Link to="/about-us/our-partners" className={styles.asideLink}>
                All partners
                <Icon name="arrowRight" size={16} />
              </Link>
            </div>

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
