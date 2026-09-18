import PageHero from "../../components/PageHero";
import Icon from "../../components/Icon";
import { POLICIES } from "../../data/policies";
import styles from "./OurPolicies.module.css";

export default function OurPolicies() {
  return (
    <>
      <PageHero
        title="Our Policies"
        crumb="Our Policies"
        image="/images/focus/library-review.jpg"
      />

      <section className="section">
        <div className="container">
          <div className={`${styles.intro} reveal`}>
            <span className="eyebrow">Governance</span>
            <h2>Our governing policies</h2>
            <p className="lede">
              The protocols and standards that ensure our work is transparent, safe and accountable.
              These are reviewed regularly by the T-TEL Board.
            </p>
          </div>

          <div className={styles.grid}>
            {POLICIES.map((policy, i) => (
              <article key={policy.slug} className={`${styles.card} reveal`} data-delay={String(i % 3)}>
                <div className={styles.thumb}>
                  <img src={policy.image} alt="" loading="lazy" />
                  <span className={styles.pill}>
                    <b>PDF</b>
                    <i>{policy.size}</i>
                  </span>
                </div>

                <div className={styles.body}>
                  <span className={styles.meta}>Updated {policy.updated}</span>
                  <h3>{policy.title}</h3>
                  <p>{policy.description}</p>
                  <hr />
                  <div className={styles.actions}>
                    <button type="button" disabled title="Available once documents are connected">
                      Preview online
                    </button>
                    <span>&middot;</span>
                    <button
                      type="button"
                      disabled
                      className={styles.download}
                      title="Available once documents are connected"
                    >
                      <Icon name="download" size={15} />
                      Download PDF
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <p className={styles.note}>
            Policy documents will be served from the backend once it is connected.
          </p>
        </div>
      </section>
    </>
  );
}
