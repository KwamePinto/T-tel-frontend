import { useState } from "react";
import { useParams, Navigate } from "react-router-dom";
import PageHero from "../../components/PageHero";
import SectionIntro from "../../components/SectionIntro";
import TeamModal from "../../components/TeamModal";
import { CardsLoading, ErrorState, EmptyState } from "../../components/States";
import { cms, mediaUrl } from "../../lib/cms";
import { useCms } from "../../hooks/useCms";
import styles from "./OurPeopleCategory.module.css";
import { t } from "../../i18n";

const TINTS = ["green", "blue", "gold", "greenAlt"];

export default function OurPeopleCategory() {
  const { category } = useParams();
  const [selected, setSelected] = useState(null);

  const groups = useCms(() => cms.personGroups(), []);
  const people = useCms(() => cms.people(category), [category]);

  const group = (groups.data?.items || []).find((g) => g.slug === category);
  const items = people.data?.items ?? [];

  // an unknown slug is a bad URL, not an empty group
  if (groups.data && !group) return <Navigate to="/about-us/our-people" replace />;

  return (
    <>
      <PageHero
        title={group?.name || "Our People"}
        crumb={group?.name || "Our People"}
        image="/images/photos/team-group.jpg"
      />

      <SectionIntro
        eyebrow={t("Governance")}
        title={(group?.name || "").toUpperCase()}
        lead={group?.description}
        stacked
      />

      <section className="section">
        <div className="container">
          {people.loading && <CardsLoading count={8} />}
          {people.error && <ErrorState error={people.error} onRetry={people.reload} label={t("team")} />}
          {!people.loading && !people.error && !items.length && (
            <EmptyState>{t("No people listed in this group yet.")}</EmptyState>
          )}

          <div className={styles.grid}>
            {items.map((person, i) => (
              <button
                key={person._id}
                type="button"
                className={`${styles.card} reveal`}
                data-delay={String(i % 4)}
                onClick={() => setSelected(person)}
              >
                <div className={`${styles.media} ${styles[TINTS[i % TINTS.length]]}`}>
                  {person.photo?.url ? (
                    <img src={mediaUrl(person.photo)} alt="" loading="lazy" />
                  ) : (
                    <span className={styles.monogram}>T&ndash;TEL</span>
                  )}
                  <span className={styles.ribbon}>
                    {person.tag ||
                      (/chair|director/i.test(person.position || "") ? "Leadership" : "Official")}
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
