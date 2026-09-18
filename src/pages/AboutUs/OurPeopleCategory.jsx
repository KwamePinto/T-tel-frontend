import { useState } from "react";
import { useParams, Navigate } from "react-router-dom";
import PageHero from "../../components/PageHero";
import SectionIntro from "../../components/SectionIntro";
import TeamModal from "../../components/TeamModal";
import styles from "./OurPeopleCategory.module.css";

import boardOfDirectors from "../../data/team/board-of-directors.json";
import subscribers from "../../data/team/subscribers.json";
import keyAdvisors from "../../data/team/key-advisors.json";
import seniorManagement from "../../data/team/senior-management.json";
import technicalPool from "../../data/team/technical-pool.json";
import financeAndOperations from "../../data/team/finance-and-operations.json";

const CATEGORIES = {
  "board-of-directors": boardOfDirectors,
  subscribers,
  "key-advisors": keyAdvisors,
  "senior-management": seniorManagement,
  "technical-pool": technicalPool,
  "finance-and-operations": financeAndOperations,
};

const BLURBS = {
  subscribers:
    "Our Subscribers represent the legal and constitutional foundation of T-TEL — the founding members whose commitment established the organisation in July 2020.",
  "board-of-directors":
    "The Board of Directors provides governance oversight, holding T-TEL to account for its strategy, financial stewardship and impact.",
  "key-advisors":
    "Our Key Advisors bring deep subject expertise across curriculum, assessment, leadership, inclusion and communications.",
  "senior-management":
    "The Senior Management Team leads delivery of T-TEL's programmes and the day-to-day running of the organisation.",
  "technical-pool":
    "Our Technical Pool works directly with colleges, schools and district education offices across every region of Ghana.",
  "finance-and-operations":
    "The Finance and Operations team provides the financial management, procurement, logistics and administrative backbone of T-TEL.",
};

const TINTS = ["green", "blue", "gold", "greenAlt"];

export default function OurPeopleCategory() {
  const { category } = useParams();
  const [selected, setSelected] = useState(null);

  const data = CATEGORIES[category];
  if (!data) return <Navigate to="/about-us/our-people" replace />;

  return (
    <>
      <PageHero
        title={data.label}
        crumb={data.label}
        image="/images/photos/team-group.jpg"
      />

      <SectionIntro
        eyebrow="Governance"
        title={data.label.toUpperCase()}
        lead={BLURBS[category]}
      />

      <section className="section">
        <div className="container">
          <div className={styles.grid}>
            {data.people.map((person, i) => (
              <button
                key={`${person.name}-${i}`}
                type="button"
                className={`${styles.card} reveal`}
                data-delay={String(i % 4)}
                onClick={() => setSelected(person)}
              >
                <div className={`${styles.media} ${styles[TINTS[i % TINTS.length]]}`}>
                  {person.photo ? (
                    <img src={person.photo} alt="" loading="lazy" />
                  ) : (
                    <span className={styles.monogram}>T&ndash;TEL</span>
                  )}
                  <span className={styles.ribbon}>
                    {person.position?.toLowerCase().includes("chair") ||
                    person.position?.toLowerCase().includes("director")
                      ? "Leadership"
                      : "Official"}
                  </span>
                </div>
                <div className={styles.body}>
                  <h3>{person.name}</h3>
                  <p>{person.position}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      <TeamModal person={selected} onClose={() => setSelected(null)} />
    </>
  );
}
