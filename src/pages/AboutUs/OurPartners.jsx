import { useState } from "react";
import PageHero from "../../components/PageHero";
import TeamModal from "../../components/TeamModal";
import Seo from "../../components/Seo";
import Icon from "../../components/Icon";
import { CardsLoading, ErrorState, EmptyState } from "../../components/States";
import { cms, mediaUrl } from "../../lib/cms";
import { useCms } from "../../hooks/useCms";
import styles from "./OurPartners.module.css";

/** Keep the content groups from the CMS, while omitting the reference page's
 * principal Mastercard block as requested for this page. */
const FALLBACK_GROUPS = [
  { key: "government", title: "Government Partners" },
  { key: "university", title: "Universities" },
  { key: "funder", title: "Funding & Project Partners" },
];

function PartnerCard({ partner }) {
  return (
    <button
      type="button"
      className={`${styles.card} reveal`}
      onClick={() => partner.onSelect(partner)}
    >
      <figure className={styles.cardMedia}>
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
      <div className={styles.cardCopy}>
        <h3>{partner.name}</h3>
        {partner.description && <p>{partner.description}</p>}
        <span className={styles.readMore}>
          Read more <Icon name="arrowRight" size={13} />
        </span>
      </div>
    </button>
  );
}

export default function OurPartners() {
  const [selected, setSelected] = useState(null);
  const page = useCms(() => cms.page("about-us/our-partners"), []);
  const partners = useCms(() => cms.partners(), []);
  const partnerGroups = useCms(() => cms.partnerGroups(), []);
  const all = partners.data?.items ?? [];
  const intro = (page.data?.sections || []).find((section) => section.type === "partnerIntro")?.data || {};
  const configuredGroups = (page.data?.sections || []).find((section) => section.type === "partnerGroups")?.data?.items;
  const groups = configuredGroups?.length
    ? configuredGroups
    : (partnerGroups.data?.items || []).map((group) => ({ key: group.slug, title: group.name }));
  const visibleGroups = groups.length ? groups : FALLBACK_GROUPS;

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

      <section className={styles.intro}>
        <div className="container">
          <span className="eyebrow eyebrow-plain">{intro.eyebrow || "Working Together"}</span>
          <p>
            {intro.body || "T-TEL works with a wide range of government, university, funding and implementation partners across Ghana, bringing together specialist expertise to strengthen teaching, education and learning."}
          </p>
        </div>
      </section>

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

      {visibleGroups.map(({ key, title }) => {
        const items = all.filter(
          (p) => p.group === key && p.name !== "Mastercard Foundation",
        );
        if (!items.length) return null;
        return (
          <section key={key} className={styles.group}>
            <div className={styles.headingWrap}>
              <h2 className="reveal">{title}</h2>
            </div>
            <div className="container">
              <div className={styles.cards}>
                {items.map((p) => (
                  <PartnerCard
                    key={p._id}
                    partner={{ ...p, onSelect: setSelected }}
                  />
                ))}
              </div>
            </div>
          </section>
        );
      })}
      <TeamModal
        person={selected && {
          ...selected,
          photo: selected.logo,
          position: "Partner",
          bio: selected.description,
        }}
        onClose={() => setSelected(null)}
        imageFit="contain"
      />
    </>
  );
}
