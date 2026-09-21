import PageHero from "../../components/PageHero";
import Seo from "../../components/Seo";
import { Loading, ErrorState } from "../../components/States";
import { cms, mediaUrl } from "../../lib/cms";
import { useCms } from "../../hooks/useCms";
import prose from "../ArticleDetail.module.css";
import styles from "./AboutUs.module.css";
import { t } from "../../i18n";

/** Renders the heading with one word picked out in the accent colour. */
function Heading({ text, highlight }) {
  if (!highlight || !text?.includes(highlight)) {
    return <h2 className={styles.identityHeading}>{text}</h2>;
  }
  const [before, ...rest] = text.split(highlight);
  return (
    <h2 className={styles.identityHeading}>
      {before}
      <span className={styles.identityHighlight}>{highlight}</span>
      {rest.join(highlight)}
    </h2>
  );
}

function Identity({ data }) {
  return (
    <section className={styles.identity}>
      <div className={`container ${styles.identityGrid}`}>
        <div className={`${styles.identityIntro} reveal`}>
          {data.eyebrow && <span className="eyebrow">{data.eyebrow}</span>}
          <Heading text={data.heading} highlight={data.highlight} />
        </div>

        <div className="reveal" data-delay="1">
          {data.lead && <p className={styles.identityLead}>{data.lead}</p>}
          <div className={styles.identityBody}>
            {(data.body || []).map((p, i) => <p key={i}>{p}</p>)}
          </div>
        </div>
      </div>
    </section>
  );
}

function VisionMission({ data }) {
  return (
    <section className={styles.split}>
      <div className={styles.vision}>
        <div className={styles.splitInner}>
          <span className={styles.eyebrowLight}>{data.visionEyebrow || "The Vision"}</span>
          <p className={styles.visionText}>{data.vision}</p>
        </div>
      </div>

      <div className={styles.mission}>
        <div className={styles.splitInner}>
          <span className={styles.eyebrowDark}>{data.missionEyebrow || "The Mission"}</span>
          <p className={styles.missionText}>{data.mission}</p>

          {data.steps?.length > 0 && (
            <>
              <hr className={styles.missionRule} />
              <ul className={styles.steps}>
                {data.steps.map((step, i) => (
                  <li key={step}>
                    <span>{String(i + 1).padStart(2, "0")}</span>
                    {step}
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </div>
    </section>
  );
}

function Principles({ data }) {
  return (
    <section className="section">
      <div className="container">
        <div className="reveal">
          {data.eyebrow && <span className={styles.plainEyebrow}>{data.eyebrow}</span>}
          <h2 className={styles.principlesTitle}>{data.heading}</h2>
          <hr className={styles.principlesRule} />
        </div>

        <div className={styles.principles}>
          {(data.principles || []).map((p, i) => (
            <div key={p.title} className={`${styles.principle} reveal`} data-delay={String(i % 3)}>
              <span className={styles.principleNum}>{String(i + 1).padStart(2, "0")}</span>
              <div>
                <h3>{p.title}</h3>
                <p>{p.body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function AboutUs() {
  const { data: page, loading, error, reload } = useCms(() => cms.page("about-us"), []);

  const sections = (page?.sections || []).filter((s) => s.enabled !== false);
  const find = (type) => sections.find((s) => s.type === type);
  const identity = find("identity");
  const visionMission = find("visionMission");
  const principles = find("principles");
  const structured = identity || visionMission || principles;

  return (
    <>
      <Seo title={page?.meta?.title || "Who We Are"} description={page?.meta?.description || identity?.data?.lead} image={page?.heroImage} noindex={page?.meta?.noindex} />
      <PageHero
        title={page?.meta?.heroTitle || page?.title || "Who We Are"}
        crumb={t("Who We Are")}
        subtitle={page?.meta?.heroDescription}
        image={mediaUrl(page?.heroImage) || "/images/photos/team-group.jpg"}
      />

      {loading && <div className="container"><Loading rows={8} /></div>}
      {error && (
        <div className="container">
          <ErrorState error={error} onRetry={reload} label={t("page")} />
        </div>
      )}

      {identity && <Identity data={identity.data} />}
      {visionMission && <VisionMission data={visionMission.data} />}
      {principles && <Principles data={principles.data} />}

      {/* the authored body is the fallback while a page is still being migrated */}
      {!structured && page && (
        <section className="section">
          <div className="container">
            <div
              className={`${prose.prose} ${styles.pageBody}`}
              dangerouslySetInnerHTML={{ __html: page.body }}
            />
          </div>
        </section>
      )}
    </>
  );
}
