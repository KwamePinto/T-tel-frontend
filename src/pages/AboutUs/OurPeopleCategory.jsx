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

/**
 * The account that precedes the photo grid on some categories (Subscribers,
 * Board of Directors) — a longer paragraph than the one-line description in
 * the heading above, drop-capped so it reads as the start of the page rather
 * than as another caption. Arrives either as editor HTML or as plain text
 * with blank lines between paragraphs, same convention as a person's bio.
 */
function GroupIntro({ text }) {
  if (!text) return null;
  const isHtml = /<[a-z][\s\S]*>/i.test(text);
  return (
    <section className={styles.introSection}>
      <div className="container">
        {isHtml ? (
          <div className={`${styles.intro} reveal`} dangerouslySetInnerHTML={{ __html: text }} />
        ) : (
          <div className={`${styles.intro} reveal`}>
            {text.split(/\n\s*\n/).filter(Boolean).map((para, i) => <p key={i}>{para}</p>)}
          </div>
        )}
      </div>
    </section>
  );
}

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
        rule={false}
      />

      <GroupIntro text={group?.intro} />

      {/* One divider, wherever the account above it ends — with or without
          an intro paragraph — so the photos always follow the same line at
          the same distance below it. SectionIntro's own lead sits in a CSS
          grid, whose item margins never collapse, so its 20px margin-bottom
          is already real, rendered space when there's no intro paragraph to
          absorb it — ruleTight accounts for that so the gap above the line
          comes out the same either way. */}
      <div className="container">
        <hr className={`${styles.rule} ${group?.intro ? "" : styles.ruleTight}`} />
      </div>

      <section className={styles.gridSection}>
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
