import { Link } from "react-router-dom";
import Seo from "../../components/Seo";
import CmsHero from "../../components/CmsHero";
import Icon from "../../components/Icon";
import { CardsLoading, ErrorState, EmptyState } from "../../components/States";
import { cms } from "../../lib/cms";
import { useCms } from "../../hooks/useCms";
import { useSite } from "../../context/SiteContext";
import styles from "./FocusAreas.module.css";

export default function FocusAreas() {
  const { settings } = useSite();
  const { data, loading, error, reload } = useCms(
    () => cms.posts({ type: "focus-areas", limit: 50 }),
    [],
  );
  const areas = data?.items ?? [];

  return (
    <>
      <Seo title="Focus Areas" description="The areas T-TEL works in: curriculum and assessment, teacher professional development, leadership, inclusion, data and digital learning." />
      <CmsHero
        slug="focus-areas"
        title={settings.home_focus_heading || "Focus Areas"}
        crumb="Focus Areas"
        subtitle={settings.home_focus_intro}
        image="/images/focus/leadership-conference.jpg"
      />

      <section className="section">
        <div className="container">
          <div className={`${styles.intro} reveal`}>
            <span className="eyebrow">What we focus on</span>
            <h2>Where our technical assistance goes to work</h2>
            <p className="lede">
              Each focus area brings together policy support, capacity building and evidence, and is
              delivered in partnership with the Ministry of Education and its agencies.
            </p>
          </div>

          {loading && <CardsLoading count={6} />}
          {error && <ErrorState error={error} onRetry={reload} label="focus areas" />}
          {!loading && !error && !areas.length && <EmptyState>No focus areas published yet.</EmptyState>}

          <div className={styles.grid}>
            {areas.map((area, i) => (
              <Link
                key={area._id}
                to={`/focus-areas/${area.slug}`}
                className={`${styles.card} ${styles[area.accent || (i % 2 ? "teal" : "orange")]} reveal`}
                data-delay={String(i % 3)}
              >
                <span className={styles.bar} />
                <span className={styles.num}>{area.number || String(i + 1).padStart(2, "0")}</span>
                {area.tags?.[0] && <span className={styles.tag}>{area.tags[0].name}</span>}
                <h3>{area.title}</h3>
                <p>{area.excerpt}</p>
                <span className="link-arrow">
                  View profile
                  <Icon name="arrowRight" size={17} />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
