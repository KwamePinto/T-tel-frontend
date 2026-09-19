import PageHero from "../../components/PageHero";
import Seo from "../../components/Seo";
import { CardsLoading, ErrorState, EmptyState } from "../../components/States";
import { cms, mediaUrl } from "../../lib/cms";
import { useCms } from "../../hooks/useCms";
import styles from "./OurPartners.module.css";

const GROUPS = [
  { key: "government", title: "Government Partners", subtitle: "The ministries and agencies we work alongside to deliver national reform." },
  { key: "university", title: "Universities", subtitle: "The universities that support Ghana's Colleges of Education." },
  { key: "funder", title: "Funding & Research Partners", subtitle: "Organisations funding and collaborating on specific programmes and research." },
  { key: "implementing", title: "Implementing Partners", subtitle: "Organisations leading delivery of specific technical assistance workstreams." },
];

function PartnerCard({ partner }) {
  return (
    <article className={`${styles.card} reveal`}>
      <div className={styles.logo}>
        {partner.logo?.url && <img src={mediaUrl(partner.logo)} alt={partner.name} loading="lazy" />}
      </div>
      <h3>{partner.name}</h3>
      {partner.description && <p>{partner.description}</p>}
    </article>
  );
}

export default function OurPartners() {
  const { data, loading, error, reload } = useCms(() => cms.partners(), []);
  const all = data?.items ?? [];
  const principal = all.find((p) => p.isPrincipal);

  return (
    <>
      <Seo title="Our Partners" description="The funders, government agencies, universities and research institutions T-TEL works alongside." />
      <PageHero title="Our Partners" crumb="Our Partners" image="/images/focus/leadership-conference.jpg" />

      <section className={`section ${styles.intro}`}>
        <div className="container reveal">
          <span className="eyebrow">Working Together</span>
          <p className="lede">
            T-TEL works with the Government of Ghana through the Ministry of Education and its
            agencies, with academic institutions, and with a wide range of funding, implementing and
            research partners.
          </p>
        </div>

        {loading && (
          <div className="container"><CardsLoading count={3} /></div>
        )}
        {error && (
          <div className="container"><ErrorState error={error} onRetry={reload} label="partners" /></div>
        )}

        {principal && (
          <div className="container">
            <div className={`${styles.principal} reveal`}>
              <div className={styles.principalLeft}>
                <span className={styles.badge}>Principal Partner</span>
                {principal.logo?.url && (
                  <div className={styles.principalLogo}>
                    <img src={mediaUrl(principal.logo)} alt={principal.name} />
                  </div>
                )}
                <h3>{principal.name}</h3>
              </div>
              <div className={styles.principalRight}>
                <p>{principal.description}</p>
              </div>
            </div>
          </div>
        )}
      </section>

      {!loading && !error && !all.length && (
        <section className="section">
          <div className="container"><EmptyState>No partners listed yet.</EmptyState></div>
        </section>
      )}

      {GROUPS.map(({ key, title, subtitle }) => {
        const items = all.filter((p) => p.group === key && !p.isPrincipal);
        if (!items.length) return null;
        return (
          <section key={key} className={`section ${styles.group}`}>
            <div className="container">
              <header className={`${styles.groupHead} reveal`}>
                <h2>{title}</h2>
                <p>{subtitle}</p>
              </header>
              <div className={styles.grid}>
                {items.map((p) => <PartnerCard key={p._id} partner={p} />)}
              </div>
            </div>
          </section>
        );
      })}
    </>
  );
}
