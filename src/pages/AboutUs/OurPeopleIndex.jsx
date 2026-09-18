import { Link } from "react-router-dom";
import PageHero from "../../components/PageHero";
import SectionIntro from "../../components/SectionIntro";
import Icon from "../../components/Icon";
import styles from "./OurPeopleIndex.module.css";

const GROUPS = [
  {
    n: "01",
    slug: "subscribers",
    title: "Subscribers",
    icon: "people",
    tint: "mint",
    desc: "The founding members of T-TEL, whose constitution and guiding principles established the organisation.",
  },
  {
    n: "02",
    slug: "board-of-directors",
    title: "Board of Directors",
    icon: "target",
    tint: "blue",
    desc: "The board holds T-TEL to account for its strategy, governance and financial stewardship.",
  },
  {
    n: "03",
    slug: "key-advisors",
    title: "Key Advisors",
    icon: "document",
    tint: "cream",
    desc: "Senior specialists guiding our technical work across curriculum, assessment, leadership and inclusion.",
  },
  {
    n: "04",
    slug: "senior-management",
    title: "Senior Management",
    icon: "people",
    tint: "mint",
    desc: "The leadership team responsible for delivering T-TEL's programmes and running the organisation.",
  },
  {
    n: "05",
    slug: "technical-pool",
    title: "Technical Pool",
    icon: "eye",
    tint: "blue",
    desc: "Regional leads, coordinators and advisors working directly with colleges, schools and districts.",
  },
  {
    n: "06",
    slug: "finance-and-operations",
    title: "Finance & Operations",
    icon: "settings",
    tint: "cream",
    desc: "The finance, procurement, logistics and support staff who keep our work moving.",
  },
];

export default function OurPeopleIndex() {
  return (
    <>
      <PageHero
        title="Our People"
        crumb="Our People"
        image="/images/photos/team-group.jpg"
      />

      <SectionIntro
        eyebrow="Governance & Delivery"
        title="The People"
        accent="Behind the Work"
        lead="From our founding Subscribers to the technical specialists working in colleges and districts — here is the team making reform possible."
      >
        <p>
          T-TEL brings together more than a hundred Ghanaian educators, researchers, managers and
          support staff, alongside international advisors with deep experience of teacher education
          reform.
        </p>
      </SectionIntro>

      <section className="section">
        <div className="container">
          <div className={styles.grid}>
            {GROUPS.map((g, i) => (
              <Link
                key={g.slug}
                to={`/about-us/our-people/${g.slug}`}
                className={`${styles.card} ${styles[g.tint]} reveal`}
                data-delay={String(i % 3)}
              >
                <div className={styles.top}>
                  <span className={styles.num}>{g.n}</span>
                  <Icon name={g.icon} size={24} />
                </div>
                <h3>{g.title}</h3>
                <p>{g.desc}</p>
                <span className="link-arrow">
                  View directory
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
