import PageHero from "../../components/PageHero";
import {
  GOVERNMENT_PARTNERS,
  UNIVERSITY_PARTNERS,
  FUNDING_PARTNERS,
} from "../../data/partners";
import styles from "./OurPartners.module.css";

function PartnerGroup({ title, subtitle, partners }) {
  return (
    <section className={`section ${styles.group}`}>
      <div className="container">
        <header className={`${styles.groupHead} reveal`}>
          <h2>{title}</h2>
          {subtitle && <p>{subtitle}</p>}
        </header>

        <div className={styles.grid}>
          {partners.map((p, i) => (
            <article key={p.name} className={`${styles.card} reveal`} data-delay={String(i % 3)}>
              <div className={styles.logo}>
                <img src={p.logo} alt={p.name} loading="lazy" />
              </div>
              <h3>{p.name}</h3>
              {p.description && <p>{p.description}</p>}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function OurPartners() {
  const [principal, ...otherFunders] = FUNDING_PARTNERS;

  return (
    <>
      <PageHero
        title="Our Partners"
        crumb="Our Partners"
        image="/images/focus/leadership-conference.jpg"
      />

      <section className={`section ${styles.intro}`}>
        <div className="container reveal">
          <span className="eyebrow">Working Together</span>
          <p className="lede">
            T-TEL works with the Government of Ghana through the Ministry of Education and its
            agencies, with academic institutions, and with a wide range of funding, implementing and
            research partners.
          </p>
        </div>

        <div className="container">
          <div className={`${styles.principal} reveal`}>
            <div className={styles.principalLeft}>
              <span className={styles.badge}>Principal Partner</span>
              <div className={styles.principalLogo}>
                <img src={principal.logo} alt={principal.name} />
              </div>
              <h3>{principal.name}</h3>
            </div>
            <div className={styles.principalRight}>
              <p>{principal.description}</p>
            </div>
          </div>
        </div>
      </section>

      <PartnerGroup
        title="Government Partners"
        subtitle="The ministries and agencies we work alongside to deliver national reform."
        partners={GOVERNMENT_PARTNERS}
      />

      <PartnerGroup
        title="Universities"
        subtitle="The five universities that support Ghana's Colleges of Education."
        partners={UNIVERSITY_PARTNERS}
      />

      <PartnerGroup
        title="Funding & Research Partners"
        subtitle="Organisations funding and collaborating on specific programmes and research."
        partners={otherFunders}
      />
    </>
  );
}
