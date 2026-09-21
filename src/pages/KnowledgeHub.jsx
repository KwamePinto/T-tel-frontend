import { Link } from "react-router-dom";
import Seo from "../components/Seo";
import CmsHero from "../components/CmsHero";
import Icon from "../components/Icon";
import { CardsLoading, ErrorState, EmptyState } from "../components/States";
import { cms } from "../lib/cms";
import { useCms } from "../hooks/useCms";
import styles from "./KnowledgeHub.module.css";
import { t } from "../i18n";

const TINTS = ["mint", "blue", "cream"];

export default function KnowledgeHub() {
  const { data, loading, error, reload } = useCms(() => cms.documentCategories(), []);

  // Policies has its own page; it isn't part of the Knowledge Hub browse
  const collections = (data?.items || []).filter((c) => c.slug !== "policies");
  const totalFiles = collections.reduce((n, c) => n + (c.count || 0), 0);

  return (
    <>
      <Seo title={t("Knowledge Hub")} description="Course manuals, handbooks, evaluation reports and policy documents from a decade of education reform in Ghana — free to download." />
      <CmsHero
        slug="knowledge-hub"
        title={t("Knowledge Hub")}
        crumb={t("Knowledge Hub")}
        subtitle="Research, teaching resources, evaluation reports and publications from a decade of education reform in Ghana."
        image="/images/focus/library-review.jpg"
      />

      <section className="section">
        <div className="container">
          <div className={`${styles.intro} reveal`}>
            <span className="eyebrow">{t("Resources")}</span>
            <h2>{t("Browse the collections")}</h2>
            <p className="lede">
              Our library brings together {totalFiles > 0 ? `${totalFiles} ` : ""}course manuals,
              handbooks, datasets and reports produced with the Ministry of Education and its
              agencies.
            </p>
          </div>

          {loading && <CardsLoading count={4} />}
          {error && <ErrorState error={error} onRetry={reload} label={t("collections")} />}
          {!loading && !error && collections.length === 0 && (
            <EmptyState>{t("No collections published yet.")}</EmptyState>
          )}

          <div className={styles.grid}>
            {collections.map((c, i) => (
              <article
                key={c._id}
                className={`${styles.card} ${styles[TINTS[i % TINTS.length]]} reveal`}
                data-delay={String(i % 3)}
              >
                <div className={styles.cardTop}>
                  <span className={styles.num}>{String(i + 1).padStart(2, "0")}</span>
                  <Icon name="document" size={24} />
                </div>

                <h3>
                  <Link to={`/knowledge-hub/${c.slug}`}>{c.name}</Link>
                </h3>

                <p>
                  {c.description ||
                    `${c.count} document${c.count === 1 ? "" : "s"} in this collection.`}
                </p>

                {c.children?.length > 0 && (
                  <ul className={styles.subList}>
                    {c.children.map((child) => (
                      <li key={child._id}>
                        <Link to={`/knowledge-hub/${child.slug}`}>
                          {child.name}
                          <span className={styles.subCount}>{child.count}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}

                <Link to={`/knowledge-hub/${c.slug}`} className="link-arrow">
                  {t("Browse collection")}
                  <Icon name="arrowRight" size={16} />
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
