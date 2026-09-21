import { Link } from "react-router-dom";
import Seo from "../../components/Seo";
import CmsHero from "../../components/CmsHero";
import SectionIntro from "../../components/SectionIntro";
import Icon from "../../components/Icon";
import { CardsLoading, ErrorState, EmptyState } from "../../components/States";
import { cms } from "../../lib/cms";
import { useCms } from "../../hooks/useCms";
import styles from "./OurPeopleIndex.module.css";

const TINTS = ["mint", "blue", "cream"];
const ICONS = ["people", "target", "document", "people", "eye", "settings"];

export default function OurPeopleIndex() {
  const { data, loading, error, reload } = useCms(() => cms.personGroups(), []);
  const groups = data?.items ?? [];

  return (
    <>
      <Seo title="Our People" description="T-TEL's subscribers, board of directors, key advisors, senior management and technical team." />
      <CmsHero slug="about-us/our-people" title="Our People" crumb="Our People" image="/images/photos/team-group.jpg" />

      <SectionIntro
        eyebrow="Governance & Delivery"
        title="The People"
        accent="Behind the Work"
        lead="From our founding Subscribers to the technical specialists working in colleges and districts — here is the team making reform possible."
        stacked
      />

      <section className="section">
        <div className="container">
          {loading && <CardsLoading count={6} />}
          {error && <ErrorState error={error} onRetry={reload} label="directory" />}
          {!loading && !error && !groups.length && <EmptyState>No groups yet.</EmptyState>}

          <div className={styles.grid}>
            {groups.map((g, i) => (
              <Link
                key={g._id}
                to={`/about-us/our-people/${g.slug}`}
                className={`${styles.card} ${styles[TINTS[i % TINTS.length]]} reveal`}
                data-delay={String(i % 3)}
              >
                <div className={styles.top}>
                  <span className={styles.num}>{String(i + 1).padStart(2, "0")}</span>
                  <Icon name={ICONS[i % ICONS.length]} size={24} />
                </div>
                <h3>{g.name}</h3>
                <p>{g.description}</p>
                <span className="link-arrow">
                  View directory ({g.count})
                  <Icon name="arrowRight" size={16} />
                </span>
                <span className={styles.underscore} />
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
