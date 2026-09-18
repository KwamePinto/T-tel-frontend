import { useState } from "react";
import PageHero from "../components/PageHero";
import Icon from "../components/Icon";
import { LATEST_NEWS } from "../data/news";
import styles from "./NewsAndMedia.module.css";

const FILTERS = ["All", "Report", "Event", "Update"];

const CATEGORY_COLOR = {
  Report: "var(--blue)",
  Event: "var(--green-dark)",
  Update: "var(--gold)",
};

export default function NewsAndMedia() {
  const [filter, setFilter] = useState("All");

  const items = filter === "All" ? LATEST_NEWS : LATEST_NEWS.filter((n) => n.category === filter);
  const [featured, ...rest] = items;

  return (
    <>
      <PageHero
        title="News & Media"
        crumb="News & Media"
        image="/images/focus/books-children.jpg"
      />

      <section className={`section ${styles.wrap}`}>
        <div className="container">
          <div className={styles.metaBar}>
            <span>
              {new Date().toLocaleDateString("en-GB", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </span>
            <span>Institutional Updates &amp; Global Reports</span>
          </div>

          <div className={styles.filters}>
            {FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={filter === f ? styles.filterOn : styles.filter}
              >
                {f}
              </button>
            ))}
          </div>

          <div className={styles.layout}>
            <div className={styles.main}>
              {featured && (
                <article className={`${styles.featured} reveal`}>
                  <div className={styles.featuredMedia}>
                    <img src={featured.image} alt="" />
                    <span
                      className={styles.badge}
                      style={{ background: CATEGORY_COLOR[featured.category] }}
                    >
                      {featured.category}
                    </span>
                  </div>
                  <div className={styles.featuredCopy}>
                    <span className={styles.date}>{featured.date}</span>
                    <h2>{featured.title}</h2>
                    <p>{featured.excerpt}</p>
                    <span className="link-arrow">
                      Full story
                      <Icon name="arrowRight" size={17} />
                    </span>
                  </div>
                </article>
              )}

              <div className={styles.grid}>
                {rest.map((n, i) => (
                  <article key={n.slug} className={`${styles.card} reveal`} data-delay={String(i % 3)}>
                    <img src={n.image} alt="" loading="lazy" />
                    <div className={styles.cardMeta}>
                      <span style={{ color: CATEGORY_COLOR[n.category] }}>{n.category}</span>
                      <span>&middot;</span>
                      <span>{n.date}</span>
                    </div>
                    <h3>{n.title}</h3>
                    <p>{n.excerpt}</p>
                  </article>
                ))}
              </div>

              {!items.length && <p className={styles.empty}>No stories in this category yet.</p>}
            </div>

            <aside className={styles.sidebar}>
              <h4 className={styles.sidebarTitle}>Latest Briefing</h4>
              <ol className={styles.briefing}>
                {LATEST_NEWS.map((n, i) => (
                  <li key={n.slug}>
                    <span className={styles.ord}>{String(i + 1).padStart(2, "0")}</span>
                    <div>
                      <span style={{ color: CATEGORY_COLOR[n.category] }}>{n.category}</span>
                      <p>{n.title}</p>
                    </div>
                  </li>
                ))}
              </ol>

              <div className={styles.press}>
                <h4>Press &amp; Media</h4>
                <p>Access our digital assets and media kits for institutional coverage.</p>
                <a href="mailto:info@t-tel.org" className={styles.pressLink}>
                  Inquiries
                  <Icon name="arrowRight" size={16} />
                </a>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </>
  );
}
