import { Link } from "react-router-dom";
import PageHero from "../../components/PageHero";
import Icon from "../../components/Icon";
import { FOCUS_AREAS } from "../../data/focusAreas";
import styles from "./FocusAreas.module.css";

export default function FocusAreas() {
  return (
    <>
      <PageHero
        title="Focus Areas"
        crumb="Focus Areas"
        subtitle="Nine core pillars through which T-TEL supports the Government of Ghana to transform teaching, education and learning."
        image="/images/focus/leadership-conference.jpg"
      />

      <section className="section">
        <div className="container">
          <div className={`${styles.intro} reveal`}>
            <span className="eyebrow">What we focus on</span>
            <h2>Where our technical assistance goes to work</h2>
            <p className="lede">
              Each focus area brings together policy support, capacity building and evidence, and is
              delivered in partnership with the Ministry of Education and its agencies.
            </p>
          </div>

          <div className={styles.grid}>
            {FOCUS_AREAS.map((area, i) => (
              <Link
                key={area.slug}
                to={`/focus-areas/${area.slug}`}
                className={`${styles.card} ${styles[area.accent]} reveal`}
                data-delay={String(i % 3)}
              >
                <span className={styles.bar} />
                <span className={styles.num}>{area.number}</span>
                <span className={styles.tag}>{area.tag}</span>
                <h3>{area.title}</h3>
                <p>{area.blurb}</p>
                <span className="link-arrow">
                  View profile
                  <Icon name="arrowRight" size={17} />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
