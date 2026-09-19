import PageHero from "../../components/PageHero";
import Seo from "../../components/Seo";
import { CardsLoading, ErrorState, EmptyState } from "../../components/States";
import { cms, mediaUrl } from "../../lib/cms";
import { useCms } from "../../hooks/useCms";
import styles from "./OurPartners.module.css";

/**
 * The reference site's three groups, in its own order. No subtitle text and
 * no "Principal Partner" spotlight — the reference page has neither, so this
 * is a straight replica rather than a fusion of the two.
 */
const GROUPS = [
  { key: "government", title: "Government Partners" },
  { key: "university", title: "Universities" },
  { key: "funder", title: "Funding & Project Partners" },
];

function PartnerRow({ partner }) {
  return (
    <div className={`${styles.row} reveal`}>
      <figure className={styles.rowMedia}>
        {partner.logo?.url && (
          <img
            src={mediaUrl(partner.logo)}
            alt={partner.name}
            loading="lazy"
            decoding="async"
            width={partner.logo.width || undefined}
            height={partner.logo.height || undefined}
          />
        )}
      </figure>
      <div className={styles.rowCopy}>
        <h3>{partner.name}</h3>
        {partner.description && <p>{partner.description}</p>}
      </div>
    </div>
  );
}

export default function OurPartners() {
  const page = useCms(() => cms.page("about-us/our-partners"), []);
  const partners = useCms(() => cms.partners(), []);
  const all = partners.data?.items ?? [];

  const loading = page.loading || partners.loading;
  const error = page.error || partners.error;

  return (
    <>
      <Seo
        title="Our Partners"
        description="The government agencies, universities and funding partners T-TEL works alongside."
        image={page.data?.heroImage}
      />
      <PageHero
        title="Our Partners"
        crumb="Our Partners"
        image={mediaUrl(page.data?.heroImage) || "/images/photos/team-group.jpg"}
      />

      {loading && (
        <section className="section"><div className="container"><CardsLoading count={3} /></div></section>
      )}
      {error && (
        <section className="section">
          <div className="container">
            <ErrorState error={error} onRetry={() => { page.reload(); partners.reload(); }} label="partners" />
          </div>
        </section>
      )}
      {!loading && !error && !all.length && (
        <section className="section"><div className="container"><EmptyState>No partners listed yet.</EmptyState></div></section>
      )}

      {GROUPS.map(({ key, title }) => {
        const items = all.filter((p) => p.group === key);
        if (!items.length) return null;
        return (
          <section key={key} className={styles.group}>
            <div className={styles.headingWrap}>
              <h2 className="reveal">{title}</h2>
            </div>
            <div className="container">
              <div className={styles.rows}>
                {items.map((p) => <PartnerRow key={p._id} partner={p} />)}
              </div>
            </div>
          </section>
        );
      })}
    </>
  );
}
