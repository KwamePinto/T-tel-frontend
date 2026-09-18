import PageHero from "../components/PageHero";
import Icon from "../components/Icon";
import styles from "./KnowledgeHub.module.css";

const COLLECTIONS = [
  { n: "01", title: "Basic Education", tint: "mint", desc: "Research, teaching materials and evaluation reports covering Ghana's basic education system." },
  { n: "02", title: "Secondary Education", tint: "blue", desc: "Evidence and resources from the Secondary Education Reform (Leaders in Teaching) programme." },
  { n: "03", title: "TVET", tint: "cream", desc: "Technical and vocational education and training resources, frameworks and skills research." },
  { n: "04", title: "Teacher Education", tint: "mint", desc: "Course manuals, professional development handbooks and B.Ed. curriculum resources." },
  { n: "05", title: "T-TEL Reports & Publications", tint: "blue", desc: "Annual evaluation reports, surveys, policy briefs and institutional publications." },
];

export default function KnowledgeHub() {
  return (
    <>
      <PageHero
        title="Knowledge Hub"
        crumb="Knowledge Hub"
        subtitle="Research, teaching resources, evaluation reports and publications from a decade of education reform in Ghana."
        image="/images/focus/library-review.jpg"
      />

      <section className="section">
        <div className="container">
          <div className={`${styles.intro} reveal`}>
            <span className="eyebrow">Resources</span>
            <h2>Browse the collections</h2>
            <p className="lede">
              Our library brings together hundreds of course manuals, handbooks, datasets and
              reports produced with the Ministry of Education and its agencies.
            </p>
          </div>

          <div className={styles.grid}>
            {COLLECTIONS.map((c, i) => (
              <article
                key={c.n}
                className={`${styles.card} ${styles[c.tint]} reveal`}
                data-delay={String(i % 3)}
              >
                <div className={styles.cardTop}>
                  <span className={styles.num}>{c.n}</span>
                  <Icon name="document" size={24} />
                </div>
                <h3>{c.title}</h3>
                <p>{c.desc}</p>
                <span className="link-arrow">
                  Browse collection
                  <Icon name="arrowRight" size={16} />
                </span>
                <span className={styles.underscore} />
              </article>
            ))}
          </div>

          <p className={styles.note}>
            Full-text search and document downloads will be enabled once the resource backend is
            connected.
          </p>
        </div>
      </section>
    </>
  );
}
