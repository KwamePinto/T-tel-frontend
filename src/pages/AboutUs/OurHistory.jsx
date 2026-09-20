import PageHero from "../../components/PageHero";
import Seo from "../../components/Seo";
import HistoryPhases from "../../components/HistoryPhases";
import { Loading, ErrorState } from "../../components/States";
import { cms, mediaUrl } from "../../lib/cms";
import { useCms } from "../../hooks/useCms";
import styles from "./OurHistory.module.css";

export default function OurHistory() {
  const { data: page, loading, error, reload } = useCms(
    () => cms.page("about-us/our-history"),
    [],
  );

  // The page is authored as an account followed by a roadmap; the prose body
  // is the fallback for as long as any of it is still being migrated.
  const milestones = (page?.sections || []).find(
    (s) => s.type === "milestones" && s.enabled !== false,
  );
  const data = milestones?.data;
  const story = data?.story || {};
  const intro = story.lead || data?.intro?.[0] || "Transforming Teaching, Education and Learning grew from a nationally owned teacher education programme into an independent Ghanaian institution.";
  const resources = data?.links || [];

  return (
    <>
      <Seo title={page?.meta?.title || "Our History"} description={page?.meta?.description || "How T-TEL grew from a six-year teacher education programme into an independent Ghanaian not-for-profit."} image={page?.heroImage} noindex={page?.meta?.noindex} />
      <PageHero
        title={page?.meta?.heroTitle || page?.title || "Our History"}
        crumb="Our History"
        /* ?? not ||: an editor who clears this field means "no subtitle",
           and an empty string would otherwise fall back to the default. */
        subtitle={page?.meta?.heroDescription ?? "From an externally funded programme to a Ghanaian-owned institution."}
        image={mediaUrl(page?.heroImage) || "/images/photos/team-group.jpg"}
      />

      {loading && <div className="container" style={{ padding: "80px 30px" }}><Loading rows={8} /></div>}
      {error && (
        <div className="container" style={{ padding: "80px 30px" }}>
          <ErrorState error={error} onRetry={reload} label="page" />
        </div>
      )}

      {data && (
        <>
          <section className={styles.intro}>
            <div className={styles.introGrid}>
              <div>
                <span className={styles.eyebrow}>{story.eyebrow || "Institutional origins"}</span>
                <h2>{story.heading || "From an externally funded programme to a Ghanaian-owned institution."}</h2>
              </div>
              <div>
                <p className={styles.introLead}>{intro}</p>
                <div className={styles.stats}>
                  {(story.stats?.length ? story.stats : [
                    { value: "$34m", label: "Programme value" },
                    { value: "7 years", label: "Founding programme" },
                    { value: "2020", label: "Established" },
                  ]).map((stat, index) => (
                    <div key={index}><strong>{stat.value}</strong><span>{stat.label}</span></div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {(story.quote || data.quote?.text) && (
            <section className={styles.quoteBand}>
              <div className={styles.quoteInner}>
                <span className={styles.quoteMark}>“</span>
                <blockquote>{story.quote || data.quote.text}</blockquote>
                <cite>{story.quoteAttrib || data.quote.attribution}</cite>
              </div>
            </section>
          )}

          <HistoryPhases data={data} />

          {resources.length > 0 && (
            <section className={styles.resources}>
              <div className={styles.resourcesInner}>
                <span className={styles.eyebrow}>Explore the full record</span>
                <h2>Explore the full record</h2>
                <div className={styles.resourceGrid}>
                  {resources.map((link, index) => (
                    <a href={link.url} key={index} className={styles.resourceCard}>
                      <strong>{link.label}</strong><span>↗</span>
                    </a>
                  ))}
                </div>
              </div>
            </section>
          )}
        </>
      )}
    </>
  );
}
