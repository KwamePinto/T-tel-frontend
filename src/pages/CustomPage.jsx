import { Link, useLocation } from "react-router-dom";
import PageHero from "../components/PageHero";
import Seo from "../components/Seo";
import Icon from "../components/Icon";
import { Loading, ErrorState } from "../components/States";
import { cms, mediaUrl } from "../lib/cms";
import { useCms } from "../hooks/useCms";
import NotFound from "./NotFound";
import prose from "./ArticleDetail.module.css";
import e from "../styles/editorial.module.css";
import cards from "./FocusAreas/FocusAreaDetail.module.css";
import bands from "./Programmes/ProgrammeDetail.module.css";
import styles from "./CustomPage.module.css";
import { t } from "../i18n";

/**
 * Renders any page the admin creates, in the shape of the menu it was filed
 * under.
 *
 * The fields are the same whichever menu it is — a hero, a block of text and
 * an optional panel — and the menu decides how they are arranged. That is what
 * lets someone add a page anywhere in the site and have it come out looking
 * like the pages already there, without a developer writing a component for it.
 *
 * This sits on the catch-all route, after every page with a component of its
 * own, so it only ever sees an address nothing else claimed. The API serves
 * only published pages, so a draft correctly falls through to the same 404 as
 * a bad address rather than leaking.
 */

/** About Us: the heading holds beside the text, as on Our History. */
function AboutLayout({ page }) {
  return (
    <section className={styles.band}>
      <div className={`container ${styles.grid}`}>
        <div className={styles.head}>
          <div className={styles.headInner}>
            {page.meta?.heroLabel && <span className={e.eyebrow}>{page.meta.heroLabel}</span>}
            <h2 className={e.display}>{page.title}</h2>
            {page.meta?.heroDescription && (
              <p className={styles.standfirst}>{page.meta.heroDescription}</p>
            )}
          </div>
        </div>
        <div
          className={`${prose.prose} ${e.dropCap} ${styles.read} reveal`}
          dangerouslySetInnerHTML={{ __html: page.body }}
        />
      </div>
    </section>
  );
}

/** Focus Areas: a reading column with the panel pinned alongside it. */
function FocusLayout({ page }) {
  const key = page.keyInfo || {};
  return (
    <section className="section">
      <div className={`container ${cards.layout}`}>
        <article className={cards.body}>
          <div
            className={`${prose.prose} ${e.dropCap} reveal`}
            dangerouslySetInnerHTML={{ __html: page.body }}
          />
        </article>

        <aside className={cards.aside}>
          {key.title && (
            <div className={`${cards.asideCard} reveal`} style={{ background: "var(--teal)" }}>
              {key.label && <span className={cards.asideEyebrow}>{key.label}</span>}
              <h3>{key.title}</h3>
              <span className={cards.asideRule} />
              {key.html && (
                <div className={cards.asideBody} dangerouslySetInnerHTML={{ __html: key.html }} />
              )}
              {key.linkUrl && key.linkLabel && (
                <Link to={key.linkUrl} className={cards.asideLink}>
                  {key.linkLabel}
                  <Icon name="arrowRight" size={16} />
                </Link>
              )}
            </div>
          )}

          <Link to="/focus-areas" className={cards.backLink}>
            <Icon name="arrowRight" size={16} style={{ transform: "rotate(180deg)" }} />
            {t("All focus areas")}
          </Link>
        </aside>
      </div>
    </section>
  );
}

/** Programmes: banded, with the figures set apart on their own band. */
function ProgrammeLayout({ page }) {
  const key = page.keyInfo || {};
  return (
    <>
      <section className={bands.band}>
        <div className={`container ${bands.grid}`}>
          <div className={bands.head}>
            <div className={bands.headInner}>
              {page.meta?.heroLabel && <span className={e.eyebrow}>{page.meta.heroLabel}</span>}
              <h2 className={e.display}>{page.title}</h2>
              {page.meta?.heroDescription && (
                <p className={bands.standfirst}>{page.meta.heroDescription}</p>
              )}
            </div>
          </div>
          <div
            className={`${prose.prose} ${e.dropCap} ${bands.read} reveal`}
            dangerouslySetInnerHTML={{ __html: page.body }}
          />
        </div>
      </section>

      {key.title && (
        <section className={`${bands.band} ${bands.bandAlt}`}>
          <div className={`container ${bands.grid}`}>
            <div className={bands.head}>
              <div className={bands.headInner}>
                {key.label && <span className={e.eyebrow}>{key.label}</span>}
                <h2 className={e.display}>{key.title}</h2>
              </div>
            </div>
            <div
              className={`${bands.details} reveal`}
              dangerouslySetInnerHTML={{ __html: key.html }}
            />
          </div>
        </section>
      )}
    </>
  );
}

/** Standalone: hero and text, nothing else. */
function PlainLayout({ page }) {
  return (
    <section className="section">
      <div className="container">
        <div
          className={`${prose.prose} ${styles.body}`}
          dangerouslySetInnerHTML={{ __html: page.body }}
        />
      </div>
    </section>
  );
}

const LAYOUTS = {
  "about-us": AboutLayout,
  "focus-areas": FocusLayout,
  programmes: ProgrammeLayout,
};

export default function CustomPage() {
  const { pathname } = useLocation();
  const slug = pathname.replace(/^\/+|\/+$/g, "");

  const { data: page, loading, error, reload } = useCms(() => cms.page(slug), [slug]);

  if (loading) {
    return (
      <div className="container" style={{ paddingTop: "calc(var(--header-h) + 60px)" }}>
        <Loading rows={8} />
      </div>
    );
  }

  // 404 is the ordinary outcome for an address nobody has made a page for;
  // anything else is worth showing as an error with a way to retry
  if (error) {
    if (error.status === 404) return <NotFound />;
    return (
      <div className="container" style={{ paddingTop: "calc(var(--header-h) + 60px)" }}>
        <ErrorState error={error} onRetry={reload} label={t("page")} />
      </div>
    );
  }

  if (!page) return <NotFound />;

  const Layout = LAYOUTS[page.section] || PlainLayout;
  const crumbs = { "about-us": "Who We Are", "focus-areas": "Focus Areas", programmes: "Programmes" };

  return (
    <>
      <Seo
        title={page.meta?.title || page.title}
        description={page.meta?.description}
        image={page.heroImage}
        noindex={page.meta?.noindex}
      />
      <PageHero
        title={page.meta?.heroTitle || page.title}
        crumb={crumbs[page.section] || page.title}
        subtitle={page.meta?.heroDescription}
        image={mediaUrl(page.heroImage) || "/images/photos/team-group.jpg"}
      />

      {page.body || page.keyInfo?.title ? <Layout page={page} /> : null}
    </>
  );
}
