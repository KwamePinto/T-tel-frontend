import { Link } from "react-router-dom";
import Seo from "../../components/Seo";
import CmsHero from "../../components/CmsHero";
import Icon from "../../components/Icon";
import { CardsLoading, ErrorState, EmptyState } from "../../components/States";
import { cms, mediaUrl } from "../../lib/cms";
import { useCms } from "../../hooks/useCms";
import styles from "./Programmes.module.css";
import { t } from "../../i18n";

export default function Programmes() {
  const { data, loading, error, reload } = useCms(
    () => cms.posts({ type: "programmes", limit: 50 }),
    [],
  );
  const items = data?.items ?? [];

  return (
    <>
      <Seo title={t("Programmes")} description="T-TEL's programmes with the Ministry of Education and its agencies, from secondary education reform to district-level change." />
      <CmsHero
        slug="programmes"
        title={t("Programmes")}
        crumb={t("Programmes")}
        subtitle="The projects through which T-TEL delivers technical advice, project management, research and implementation support across Ghana."
        image="/images/focus/students-laptops.jpg"
      />

      <section className="section">
        <div className="container">
          <div className={`${styles.intro} reveal`}>
            <span className="eyebrow">{t("How we work")}</span>
            <h2>{t("Delivered in partnership with government")}</h2>
            <p className="lede">
              We work closely with the Ministry of Education and its agencies &mdash; GES, GTEC,
              NaCCA, NTC and NaSIA &mdash; convening the institutions, funders and researchers
              needed to make reform stick.
            </p>
          </div>

          {loading && <CardsLoading count={4} />}
          {error && <ErrorState error={error} onRetry={reload} label={t("programmes")} />}
          {!loading && !error && !items.length && <EmptyState>{t("No programmes published yet.")}</EmptyState>}

          <div className={styles.list}>
            {items.map((p, i) => (
              <article key={p._id} className={`${styles.row} ${p.featuredImage ? "" : styles.rowNoImage} reveal`} data-delay={String(i % 3)}>
                {p.featuredImage?.url && (
                  <div className={styles.media}>
                    <img src={mediaUrl(p.featuredImage)} alt="" loading="lazy" />
                  </div>
                )}
                <div className={styles.copy}>
                  {p.meta?.description && <span className={styles.partner}>{p.meta.description}</span>}
                  <h3>{p.title}</h3>
                  <p>{p.excerpt}</p>
                  <Link to={`/programmes/${p.slug}`} className="link-arrow">
                    {t("Learn more")}
                    <Icon name="arrowRight" size={17} />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
