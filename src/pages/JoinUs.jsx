import CmsHero from "../components/CmsHero";
import Seo from "../components/Seo";
import SectionIntro from "../components/SectionIntro";
import Icon from "../components/Icon";
import { cms } from "../lib/cms";
import { useCms } from "../hooks/useCms";
import styles from "./JoinUs.module.css";
import { t } from "../i18n";

const VALUES = [
  {
    n: "01",
    accent: "green",
    title: "Ghanaian-led",
    body: "We use local talent and expertise to build institutions that last — careers here grow Ghana's own capability.",
  },
  {
    n: "02",
    accent: "blue",
    title: "Classroom Focused",
    body: "Our work bridges the gap between high-level policy and what actually happens in a classroom.",
  },
  {
    n: "03",
    accent: "gold",
    title: "Room to Grow",
    body: "From regional advisory roles to national programme leadership, our people move and develop across the organisation.",
  },
];

const ROLES = {
  "Technical Pool": [
    "Regional Education Advisor",
    "Delivery Coordinator — Leadership",
    "Delivery Coordinator — Teacher CPD",
    "Delivery Coordinator — Inclusion",
  ],
  "Finance & Operations": [
    "Senior Operations Officer",
    "Finance Officer",
    "MERL Officer",
    "IT & Systems Officer",
  ],
};

const TINTS = ["mint", "blue", "cream", "mintDeep"];

export default function JoinUs() {
  const { data: page } = useCms(() => cms.page("join-us"), []);
  const sections = page?.sections || [];
  const sectionData = (type) => sections.find((section) => section.type === type)?.data || {};
  const intro = sectionData("joinIntro");
  const values = sectionData("joinValues").items?.length ? sectionData("joinValues").items : VALUES;
  const roleGroups = sectionData("joinRoles").groups?.length
    ? sectionData("joinRoles").groups
    : Object.entries(ROLES).map(([group, roles]) => ({ group, roles }));
  const safeguarding = sectionData("joinSafeguarding");
  const cta = sectionData("joinCta");

  return (
    <>
      <Seo title={t("Join Us")} description="Work with T-TEL: current opportunities and what it is like to be part of a Ghanaian technical assistance team." />
      <CmsHero
        slug="join-us"
        title={t("Join Our Team")}
        crumb={t("Careers")}
        subtitle="Build your career with a Ghanaian organisation transforming teaching, education and learning."
        image="/images/photos/team-group.jpg"
      />

      <SectionIntro
        eyebrow={intro.eyebrow || "Careers"}
        title={intro.title || "Build the"}
        accent={intro.accent || "Future"}
        lead={intro.lead || "Join a nationally-led team dedicated to bridging the gap between high-level policy and classroom reality."}
        rule={false}
      />

      <section className="section">
        <div className="container">
          <div className={styles.values}>
            {values.map((v, i) => (
              <div
                key={v.n}
                className={`${styles.value} ${styles[v.accent]} reveal`}
                data-delay={String(i)}
              >
                <span className={styles.valueNum}>{v.n}</span>
                <h3>{v.title}</h3>
                <p>{v.body}</p>
                <span className={styles.valueRule} />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={`section ${styles.positions}`}>
        <div className="container">
          <div className="reveal">
            <span className={styles.plainEyebrow}>{t("Opportunity")}</span>
            <h2>{t("Available Positions")}</h2>
          </div>

          {roleGroups.map(({ group, roles }) => (
            <div key={group} className={styles.group}>
              <h3 className={`${styles.groupTitle} reveal`}>{group}</h3>
              <div className={styles.roleGrid}>
                {roles.map((role, i) => (
                  <article
                    key={role}
                    className={`${styles.role} reveal`}
                    data-delay={String(i % 4)}
                  >
                    <div className={`${styles.roleTile} ${styles[TINTS[i % TINTS.length]]}`}>
                      <Icon name="people" size={44} />
                      <span className={styles.openBadge}>{t("Open Role")}</span>
                    </div>
                    <h4>{role}</h4>
                    <a
                      href="https://apply.workable.com/t-tel/?lng=en#jobs"
                      target="_blank"
                      rel="noreferrer"
                      className="link-arrow"
                    >
                      {t("Apply now")}
                      <Icon name="arrowRight" size={15} />
                    </a>
                    <span className={styles.roleRule} />
                  </article>
                ))}
              </div>
            </div>
          ))}

          <p className={styles.spec}>{cta.spec || "Don’t see a matching role? Send a speculative application — we’re always looking for good people."}</p>

          <div className={`${styles.safeguard} reveal`}>
            <div>
              <span className={styles.safeEyebrow}>{t("Safeguarding")}</span>
              <h3>{safeguarding.title || "Our Commitment"}</h3>
              <p>{safeguarding.body || "T-TEL is committed to safeguarding children and vulnerable adults. All appointments are subject to background checks and to our Child & Youth Safeguarding Policy, and every member of staff is trained on their responsibilities."}</p>
            </div>
            <svg viewBox="0 0 24 24" className={styles.shield} aria-hidden="true">
              <path
                d="M12 2 4 5.5v6c0 5 3.4 9.3 8 10.5 4.6-1.2 8-5.5 8-10.5v-6z"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.1"
              />
            </svg>
          </div>

          <div className={styles.ctaRow}>
            <a
              href="https://apply.workable.com/t-tel/?lng=en#jobs"
              target="_blank"
              rel="noreferrer"
              className="btn"
            >
              {t("View all current openings")}
              <Icon name="arrowRight" size={18} />
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
