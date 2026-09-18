import { Link } from "react-router-dom";
import PageHero from "../../components/PageHero";
import Icon from "../../components/Icon";
import { PROJECTS } from "../../data/projects";
import styles from "./Programmes.module.css";

export default function Programmes() {
  return (
    <>
      <PageHero
        title="Programmes"
        crumb="Programmes"
        subtitle="The projects through which T-TEL delivers technical advice, project management, research and implementation support across Ghana."
        image="/images/focus/students-laptops.jpg"
      />

      <section className="section">
        <div className="container">
          <div className={`${styles.intro} reveal`}>
            <span className="eyebrow">How we work</span>
            <h2>Delivered in partnership with government</h2>
            <p className="lede">
              We work closely with the Ministry of Education and its agencies &mdash; GES, GTEC,
              NaCCA, NTC and NaSIA &mdash; convening the institutions, funders and researchers
              needed to make reform stick.
            </p>
          </div>

          <div className={styles.list}>
            {PROJECTS.map((p, i) => (
              <article key={p.slug} className={`${styles.row} reveal`} data-delay={String(i % 3)}>
                <div className={styles.media}>
                  {p.image ? (
                    <img src={p.image} alt="" loading="lazy" />
                  ) : (
                    <div className={styles.placeholder}>
                      <span>{p.title.charAt(0)}</span>
                    </div>
                  )}
                </div>
                <div className={styles.copy}>
                  <span className={styles.partner}>{p.partner}</span>
                  <h3>{p.title}</h3>
                  <p>{p.summary}</p>
                  <Link to={`/programmes/${p.slug}`} className="link-arrow">
                    Learn more
                    <Icon name="arrowRight" size={17} />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
