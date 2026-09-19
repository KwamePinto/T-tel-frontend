import { Link, useParams } from "react-router-dom";
import PageHero from "../../components/PageHero";
import Icon from "../../components/Icon";
import { Loading, ErrorState } from "../../components/States";
import { cms, mediaUrl } from "../../lib/cms";
import { useCms } from "../../hooks/useCms";
import PageSections from "../../components/PageSections";
import prose from "../ArticleDetail.module.css";
import styles from "../FocusAreas/FocusAreaDetail.module.css";

export default function ProgrammeDetail() {
  const { slug } = useParams();
  const item = useCms(() => cms.post(slug), [slug]);
  const all = useCms(() => cms.posts({ type: "programmes", limit: 50 }), []);

  if (item.loading) {
    return (
      <section className="section">
        <div className="container"><Loading rows={6} /></div>
      </section>
    );
  }
  if (item.error) {
    return (
      <section className="section">
        <div className="container">
          <ErrorState error={item.error} onRetry={item.reload} label="programme" />
          <Link to="/programmes" className="link-arrow">
            <Icon name="arrowRight" size={16} style={{ transform: "rotate(180deg)" }} />
            All programmes
          </Link>
        </div>
      </section>
    );
  }

  const post = item.data;
  const others = (all.data?.items || []).filter((o) => o.slug !== slug);

  return (
    <>
      <PageHero
        title={post.title}
        crumb={post.title}
        subtitle={post.meta?.description || post.excerpt}
        image={mediaUrl(post.featuredImage) || "/images/focus/leadership-conference.jpg"}
      />

      <section className="section">
        <div className={`container ${styles.layout} ${post.sections?.length ? styles.wide : ""}`}>
          <article className={styles.body}>
            {post.sections?.length ? (
              <PageSections sections={post.sections} />
            ) : (
              <div className={prose.prose} dangerouslySetInnerHTML={{ __html: post.body }} />
            )}
          </article>

          <aside className={styles.aside}>
            <div className={`${styles.asideCard} reveal`} style={{ background: "var(--green-dark)" }}>
              <span className={styles.asideEyebrow}>Programme</span>
              <h3>At a glance</h3>
              <span className={styles.asideRule} />
              <p>{post.meta?.description || post.excerpt}</p>
              <Link to="/about-us/our-partners" className={styles.asideLink}>
                Our partners
                <Icon name="arrowRight" size={16} />
              </Link>
            </div>

            <Link to="/programmes" className={styles.backLink}>
              <Icon name="arrowRight" size={16} style={{ transform: "rotate(180deg)" }} />
              All programmes
            </Link>
          </aside>
        </div>
      </section>

      {others.length > 0 && (
        <section className={`section ${styles.others}`}>
          <div className="container">
            <h2 className={`${styles.othersTitle} reveal`}>Other programmes</h2>
            <div className={styles.othersGrid}>
              {others.map((o, i) => (
                <Link
                  key={o._id}
                  to={`/programmes/${o.slug}`}
                  className={`${styles.otherCard} ${styles.teal} reveal`}
                  data-delay={String(i % 3)}
                >
                  <span className={styles.otherBar} />
                  {o.meta?.description && <span className={styles.otherTag}>{o.meta.description}</span>}
                  <h3>{o.title}</h3>
                  <span className="link-arrow">
                    Learn more
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
