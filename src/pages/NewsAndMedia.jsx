import { useState } from "react";
import Seo from "../components/Seo";
import { Link } from "react-router-dom";
import CmsHero from "../components/CmsHero";
import Icon from "../components/Icon";
import { CardsLoading, ErrorState, EmptyState } from "../components/States";
import { cms, mediaUrl } from "../lib/cms";
import { useCms } from "../hooks/useCms";
import { useSite } from "../context/SiteContext";
import styles from "./NewsAndMedia.module.css";
import { t } from "../i18n";

const CATEGORY_COLOR = {
  Report: "var(--blue)",
  Event: "var(--green-dark)",
  Update: "var(--gold)",
  News: "var(--green-dark)",
};

const formatDate = (value) =>
  value
    ? new Date(value).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })
    : "";

export default function NewsAndMedia() {
  const { settings } = useSite();
  const [tag, setTag] = useState("");
  const [page, setPage] = useState(1);

  const perPage = Number(settings.posts_per_page) || 9;

  const { data, loading, error, reload } = useCms(
    () => cms.posts({ type: "blog", tag: tag || undefined, page, limit: perPage }),
    [tag, page, perPage],
  );

  const items = data?.items ?? [];
  const pages = data?.pages ?? 1;

  // tag filters are derived from what the posts actually carry
  const tags = [...new Map(items.flatMap((p) => p.tags || []).map((t) => [t._id, t])).values()];

  const [featured, ...rest] = items;

  return (
    <>
      <Seo title={t("News &amp; Media")} description="Announcements, field stories and press coverage from T-TEL and its partners across Ghana's education system." />
      <CmsHero
        slug="news-and-media"
        title={settings.blog_label || "News & Media"}
        crumb={settings.blog_label || "News & Media"}
        image="/images/focus/books-children.jpg"
      />

      <section className={`section ${styles.wrap}`}>
        <div className="container">
          <div className={styles.metaBar}>
            <span>
              {new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
            </span>
            <span>
              {data ? `${data.total} article${data.total === 1 ? "" : "s"}` : "Institutional updates & reports"}
            </span>
          </div>

          <div className={styles.filters}>
            <button
              type="button"
              onClick={() => { setTag(""); setPage(1); }}
              className={!tag ? styles.filterOn : styles.filter}
            >
              {t("All")}
            </button>
            {tags.map((t) => (
              <button
                key={t._id}
                type="button"
                onClick={() => { setTag(t._id); setPage(1); }}
                className={tag === t._id ? styles.filterOn : styles.filter}
              >
                {t.name}
              </button>
            ))}
          </div>

          {loading && <CardsLoading count={6} />}
          {error && <ErrorState error={error} onRetry={reload} label={t("articles")} />}
          {!loading && !error && !items.length && <EmptyState>{t("No articles published yet.")}</EmptyState>}

          {!loading && !error && items.length > 0 && (
            <div className={styles.layout}>
              <div className={styles.main}>
                {featured && page === 1 && (
                  <article className={`${styles.featured} reveal`}>
                    <div className={styles.featuredMedia}>
                      {featured.featuredImage?.url && (
                        <img src={mediaUrl(featured.featuredImage)} alt="" />
                      )}
                      {featured.tags?.[0] && (
                        <span
                          className={styles.badge}
                          style={{ background: CATEGORY_COLOR[featured.tags[0].name] || "var(--green-dark)" }}
                        >
                          {featured.tags[0].name}
                        </span>
                      )}
                    </div>
                    <div className={styles.featuredCopy}>
                      <span className={styles.date}>{formatDate(featured.publishedAt)}</span>
                      <h2>{featured.title}</h2>
                      <p>{featured.excerpt}</p>
                      <Link to={`/news-and-media/${featured.slug}`} className="link-arrow">
                        {t("Full story")}
                        <Icon name="arrowRight" size={17} />
                      </Link>
                    </div>
                  </article>
                )}

                <div className={styles.grid}>
                  {(page === 1 ? rest : items).map((n, i) => (
                    <article key={n._id} className={`${styles.card} reveal`} data-delay={String(i % 3)}>
                      <Link to={`/news-and-media/${n.slug}`}>
                        {n.featuredImage?.url && (
                          <img src={mediaUrl(n.featuredImage)} alt="" loading="lazy" />
                        )}
                        <div className={styles.cardMeta}>
                          {n.tags?.[0] && (
                            <>
                              <span style={{ color: CATEGORY_COLOR[n.tags[0].name] || "var(--green-dark)" }}>
                                {n.tags[0].name}
                              </span>
                              <span>&middot;</span>
                            </>
                          )}
                          <span>{formatDate(n.publishedAt)}</span>
                        </div>
                        <h3>{n.title}</h3>
                        <p>{n.excerpt}</p>
                      </Link>
                    </article>
                  ))}
                </div>

                {pages > 1 && (
                  <nav className={styles.pagination} aria-label={t("Pagination")}>
                    <button
                      type="button"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      aria-label={t("Previous page")}
                    >
                      <Icon name="arrowRight" size={17} style={{ transform: "rotate(180deg)" }} />
                    </button>
                    <span>
                      Page {page} of {pages}
                    </span>
                    <button
                      type="button"
                      onClick={() => setPage((p) => Math.min(pages, p + 1))}
                      disabled={page === pages}
                      aria-label={t("Next page")}
                    >
                      <Icon name="arrowRight" size={17} />
                    </button>
                  </nav>
                )}
              </div>

              <aside className={styles.sidebar}>
                <h4 className={styles.sidebarTitle}>{t("Latest Briefing")}</h4>
                <ol className={styles.briefing}>
                  {items.slice(0, 5).map((n, i) => (
                    <li key={n._id}>
                      <span className={styles.ord}>{String(i + 1).padStart(2, "0")}</span>
                      <div>
                        {n.tags?.[0] && (
                          <span style={{ color: CATEGORY_COLOR[n.tags[0].name] || "var(--green-dark)" }}>
                            {n.tags[0].name}
                          </span>
                        )}
                        <p>
                          <Link to={`/news-and-media/${n.slug}`}>{n.title}</Link>
                        </p>
                      </div>
                    </li>
                  ))}
                </ol>

                <div className={styles.press}>
                  <h4>{t("Press &amp; Media")}</h4>
                  <p>{t("Access our digital assets and media kits for institutional coverage.")}</p>
                  <a href={`mailto:${settings.contact_email || "info@t-tel.org"}`} className={styles.pressLink}>
                    {t("Inquiries")}
                    <Icon name="arrowRight" size={16} />
                  </a>
                </div>
              </aside>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
