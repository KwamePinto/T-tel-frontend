import PageHero from "../../components/PageHero";
import Seo from "../../components/Seo";
import HistoryTimeline from "../../components/HistoryTimeline";
import { Loading, ErrorState } from "../../components/States";
import { cms, mediaUrl } from "../../lib/cms";
import { useCms } from "../../hooks/useCms";
import prose from "../ArticleDetail.module.css";
import styles from "./AboutUs.module.css";

export default function OurHistory() {
  const { data: page, loading, error, reload } = useCms(
    () => cms.page("about-us/our-history"),
    [],
  );

  // The page is authored as dated milestones; the prose body is the fallback
  // for as long as any of it is still being migrated.
  const milestones = (page?.sections || []).find(
    (s) => s.type === "milestones" && s.enabled !== false,
  );

  return (
    <>
      <Seo title={page?.meta?.title || "Our History"} description={page?.meta?.description || "How T-TEL grew from a six-year teacher education programme into an independent Ghanaian not-for-profit."} image={page?.heroImage} noindex={page?.meta?.noindex} />
      <PageHero
        title={page?.meta?.heroTitle || page?.title || "Our History"}
        crumb="Our History"
        subtitle={
          page?.meta?.heroDescription ||
          "From a decade-long bilateral aid programme to an independent Ghanaian institution."
        }
        image={mediaUrl(page?.heroImage) || "/images/photos/team-group.jpg"}
      />

      {/* The milestone bricks run full-bleed, so they sit outside .container
          and manage their own gutters; the prose fallback keeps the container. */}
      <section className="section">
        {loading && <div className="container"><Loading rows={8} /></div>}
        {error && (
          <div className="container">
            <ErrorState error={error} onRetry={reload} label="page" />
          </div>
        )}

        {milestones ? (
          <HistoryTimeline data={milestones.data} />
        ) : (
          page && (
            <div className="container">
              <div
                className={`${prose.prose} ${styles.pageBody} reveal`}
                dangerouslySetInnerHTML={{ __html: page.body }}
              />
            </div>
          )
        )}
      </section>
    </>
  );
}
