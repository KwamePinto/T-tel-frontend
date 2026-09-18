import { Link, Navigate, useParams } from "react-router-dom";
import PageHero from "../../components/PageHero";
import Icon from "../../components/Icon";
import { PROJECTS, getProjectBySlug } from "../../data/projects";
import styles from "../FocusAreas/FocusAreaDetail.module.css";

export default function ProgrammeDetail() {
  const { slug } = useParams();
  const project = getProjectBySlug(slug);

  if (!project) return <Navigate to="/programmes" replace />;

  const others = PROJECTS.filter((p) => p.slug !== slug);

  return (
    <>
      <PageHero
        title={project.title}
        crumb={project.title}
        subtitle={project.partner}
        image={project.image || "/images/focus/leadership-conference.jpg"}
      />

      <section className="section">
        <div className={`container ${styles.layout}`}>
          <article className={styles.body}>
            <p className={`${styles.intro} reveal`}>{project.summary}</p>
            {project.image && (
              <figure className="reveal">
                <img src={project.image} alt="" />
                <figcaption>
                  <span style={{ background: "var(--green)" }} />
                  {project.title} &mdash; {project.partner.toLowerCase()}.
                </figcaption>
              </figure>
            )}
            {project.description.map((para, i) => (
              <p key={i} className="reveal">
                {para}
              </p>
            ))}
          </article>

          <aside className={styles.aside}>
            <div
              className={`${styles.asideCard} reveal`}
              style={{ background: "var(--green-dark)" }}
            >
              <span className={styles.asideEyebrow}>Programme</span>
              <h3>At a glance</h3>
              <span className={styles.asideRule} />
              <p>{project.partner}</p>
              <Link to="/about-us/our-partners" className={styles.asideLink}>
                Our partners
                <Icon name="arrowRight" size={16} />
              </Link>
            </div>

            <Link to="/programmes" className={styles.backLink}>
              <Icon name="arrowRight" size={16} style={{ transform: "rotate(180deg)" }} />
              All programmes
            </Link>
          </aside>
        </div>
      </section>

      <section className={`section ${styles.others}`}>
        <div className="container">
          <h2 className={`${styles.othersTitle} reveal`}>Other programmes</h2>
          <div className={styles.othersGrid}>
            {others.map((o, i) => (
              <Link
                key={o.slug}
                to={`/programmes/${o.slug}`}
                className={`${styles.otherCard} ${styles.teal} reveal`}
                data-delay={String(i % 3)}
              >
                <span className={styles.otherBar} />
                <span className={styles.otherTag}>{o.partner}</span>
                <h3>{o.title}</h3>
                <span className="link-arrow">
                  Learn more
                  <Icon name="arrowRight" size={16} />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
