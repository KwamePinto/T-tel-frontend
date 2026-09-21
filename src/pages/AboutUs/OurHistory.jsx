import PageHero from "../../components/PageHero";
import Seo from "../../components/Seo";
import HistoryStory from "../../components/HistoryStory";
import HistoryPhases from "../../components/HistoryPhases";
import { Loading, ErrorState } from "../../components/States";
import { cms, mediaUrl } from "../../lib/cms";
import { useCms } from "../../hooks/useCms";
import prose from "../ArticleDetail.module.css";
import styles from "./AboutUs.module.css";
import historyStyles from "./OurHistory.module.css";

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
  const resources = data?.links || [];

  return (
    <>
      <Seo title={page?.meta?.title || "Our History"} description={page?.meta?.description || "How T-TEL grew from a six-year teacher education programme into an independent Ghanaian not-for-profit."} image={page?.heroImage} noindex={page?.meta?.noindex} />
      <PageHero
        title={page?.meta?.heroTitle || page?.title || "Our History"}
        crumb="Our History"
        /* ?? not ||: an editor who clears this field means "no subtitle",
           and an empty string would otherwise fall back to the default. */
        subtitle={
          page?.meta?.heroDescription ??
          "From a decade-long bilateral aid programme to an independent Ghanaian institution."
        }
        image={mediaUrl(page?.heroImage) || "/images/photos/team-group.jpg"}
      />

      {loading && <div className="container" style={{ padding: "80px 30px" }}><Loading rows={8} /></div>}
      {error && (
        <div className="container" style={{ padding: "80px 30px" }}>
          <ErrorState error={error} onRetry={reload} label="page" />
        </div>
      )}

      {/* Both halves run full-bleed and carry their own vertical rhythm, so
          they sit outside the shared .section padding. */}
      {data && <HistoryStory data={data.story} />}
      {data && <HistoryPhases data={data} />}

      {resources.length > 0 && (
        <section className={historyStyles.resources}>
          <div className={historyStyles.resourcesInner}>
            <span className={historyStyles.eyebrow}>Explore the full record</span>
            <h2>Explore the full record</h2>
            <div className={historyStyles.resourceGrid}>
              {resources.map((link, index) => (
                <a href={link.url} key={index} className={historyStyles.resourceCard}>
                  <strong>{link.label}</strong><span>↗</span>
                </a>
              ))}
            </div>
          </div>
        </section>
      )}

      {page && !data && (
        <section className="section">
          <div className="container">
            <div
              className={`${prose.prose} ${styles.pageBody} reveal`}
              dangerouslySetInnerHTML={{ __html: page.body }}
            />
          </div>
        </section>
      )}
    </>
  );
}
