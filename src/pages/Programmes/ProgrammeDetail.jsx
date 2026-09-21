import { Link, useParams } from "react-router-dom";
import PageHero from "../../components/PageHero";
import Icon from "../../components/Icon";
import { Loading, ErrorState } from "../../components/States";
import { cms, mediaUrl } from "../../lib/cms";
import { useCms } from "../../hooks/useCms";
import CustomPage from "../CustomPage";
import PageSections from "../../components/PageSections";
import prose from "../ArticleDetail.module.css";
import e from "../../styles/editorial.module.css";
import cards from "../FocusAreas/FocusAreaDetail.module.css";
import styles from "./ProgrammeDetail.module.css";
import { t } from "../../i18n";

/**
 * A programme is nearly all text — these pages carry no pictures of their own
 * and mostly never will — so the work here is done by the typography rather
 * than by imagery: a heading held to one side of the reading column, a large
 * initial opening the narrative, and the project's figures set apart on their
 * own band instead of being buried in the prose.
 *
 * Blocks still run through PageSections, so the moment an admin adds a
 * picture to a programme it appears between the paragraphs with no change
 * here.
 */
export default function ProgrammeDetail() {
  const { slug } = useParams();
  const item = useCms(() => cms.post(slug), [slug]);
  const all = useCms(() => cms.posts({ type: "programmes", limit: 50 }), []);

  if (item.loading) {
    return (
      <section className="section">
        <div className="container"><Loading rows={6} /></div>
      </section>
    );
  }
  if (item.error) {
    // This route also covers custom pages filed under this menu, because a
    // dynamic segment outranks the catch-all and would otherwise swallow
    // them. Nothing here by that name means it is a page, not a programme — and
    // if it is neither, CustomPage renders the 404 itself.
    if (item.error.status === 404) return <CustomPage />;
    return (
      <section className="section">
        <div className="container">
          <ErrorState error={item.error} onRetry={item.reload} label={t("programme")} />
          <Link to="/programmes" className="link-arrow">
            <Icon name="arrowRight" size={16} style={{ transform: "rotate(180deg)" }} />
            {t("All programmes")}
          </Link>
        </div>
      </section>
    );
  }

  const post = item.data;
  const others = (all.data?.items || []).filter((o) => o.slug !== slug);
  const sections = post.sections || [];

  // The project's figures live on the "facts" blocks as a side panel. They are
  // pulled out to their own band below, so the blocks are handed on as plain
  // text — otherwise the same figures would render twice.
  const details = sections.map((s) => s.aside).filter(Boolean).join("");
  const narrative = sections.map((s) =>
    s.type === "facts" ? { ...s, type: "prose", aside: "" } : s,
  );

  return (
    <>
      <PageHero
        title={post.title}
        crumb={post.title}
        subtitle={post.meta?.description || post.excerpt}
        image={mediaUrl(post.featuredImage) || "/images/focus/leadership-conference.jpg"}
      />

      <section className={styles.band}>
        <div className={`container ${styles.grid}`}>
          <div className={styles.head}>
            <div className={styles.headInner}>
              <span className={e.eyebrow}>{t("Overview")}</span>
              <h2 className={e.display}>{post.title}</h2>
              {post.excerpt && <p className={styles.standfirst}>{post.excerpt}</p>}
            </div>
          </div>

          <article className={`${styles.read} reveal`}>
            {narrative.length ? (
              <PageSections sections={narrative} variant="column" />
            ) : (
              <div
                className={`${prose.prose} ${e.dropCap}`}
                dangerouslySetInnerHTML={{ __html: post.body }}
              />
            )}
          </article>
        </div>
      </section>

      {details && (
        <section className={`${styles.band} ${styles.bandAlt}`}>
          <div className={`container ${styles.grid}`}>
            <div className={styles.head}>
              <div className={styles.headInner}>
                <span className={e.eyebrow}>{t("The Project")}</span>
                <h2 className={e.display}>{t("At a glance")}</h2>
              </div>
            </div>

            <div
              className={`${styles.details} reveal`}
              dangerouslySetInnerHTML={{ __html: details }}
            />
          </div>
        </section>
      )}

      {others.length > 0 && (
        <section className={`section ${cards.others}`}>
          <div className="container">
            <h2 className={`${cards.othersTitle} reveal`}>{t("Other programmes")}</h2>
            <div className={cards.othersGrid}>
              {others.map((o, i) => (
                <Link
                  key={o._id}
                  to={`/programmes/${o.slug}`}
                  className={`${cards.otherCard} ${cards.teal} reveal`}
                  data-delay={String(i % 3)}
                >
                  <span className={cards.otherBar} />
                  {o.meta?.description && <span className={cards.otherTag}>{o.meta.description}</span>}
                  <h3>{o.title}</h3>
                  <span className="link-arrow">
                    {t("Learn more")}
                    <Icon name="arrowRight" size={16} />
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
