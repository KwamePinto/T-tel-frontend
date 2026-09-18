import { Link, Navigate, useParams } from "react-router-dom";
import PageHero from "../../components/PageHero";
import Icon from "../../components/Icon";
import { FOCUS_AREAS, getFocusArea } from "../../data/focusAreas";
import styles from "./FocusAreaDetail.module.css";

export default function FocusAreaDetail() {
  const { slug } = useParams();
  const area = getFocusArea(slug);

  if (!area) return <Navigate to="/focus-areas" replace />;

  const others = FOCUS_AREAS.filter((f) => f.slug !== slug).slice(0, 6);
  const bandColor = area.accent === "orange" ? "var(--orange)" : "var(--teal)";

  return (
    <>
      <PageHero
        title={area.title}
        crumb={area.title}
        subtitle={area.blurb}
        image={area.image}
        band={{ label: area.tag, color: bandColor }}
      />

      <section className="section">
        <div className={`container ${styles.layout}`}>
          <article className={styles.body}>
            <p className={`${styles.intro} reveal`}>{area.body[0]}</p>

            <figure className="reveal">
              <img src={area.image} alt="" />
              <figcaption>
                <span style={{ background: bandColor }} />
                T-TEL&rsquo;s work on {area.title.toLowerCase()} in partnership with the Ministry of
                Education.
              </figcaption>
            </figure>

            {area.body.slice(1).map((para, i) => (
              <p key={i} className="reveal">
                {para}
              </p>
            ))}
          </article>

          <aside className={styles.aside}>
            <div className={`${styles.asideCard} reveal`} style={{ background: bandColor }}>
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

      <section className={`section ${styles.others}`}>
        <div className="container">
          <h2 className={`${styles.othersTitle} reveal`}>Explore other areas</h2>
          <div className={styles.othersGrid}>
            {others.map((o, i) => (
              <Link
                key={o.slug}
                to={`/focus-areas/${o.slug}`}
                className={`${styles.otherCard} ${styles[o.accent]} reveal`}
                data-delay={String(i % 3)}
              >
                <span className={styles.otherBar} />
                <span className={styles.otherNum}>{o.number}</span>
                <span className={styles.otherTag}>{o.tag}</span>
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
    </>
  );
}
