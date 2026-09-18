import PageHero from "../../components/PageHero";
import SectionIntro from "../../components/SectionIntro";
import styles from "./AboutUs.module.css";

const MISSION_STEPS = [
  { n: "01", label: "Strengthening School Leadership" },
  { n: "02", label: "Enhancing Teaching Quality" },
  { n: "03", label: "Driving Data-Led Decisions" },
];

const PRINCIPLES = [
  {
    n: "01",
    title: "Evidence-Based",
    body: "Every recommendation we make is grounded in research and in data drawn from Ghanaian classrooms.",
  },
  {
    n: "02",
    title: "Locally-Led",
    body: "We use Ghanaian talent and expertise, building institutions that outlast any single programme.",
  },
  {
    n: "03",
    title: "Systemic Focus",
    body: "We work at the level of policy, institutions and practice together — because reform only sticks when all three move.",
  },
  {
    n: "04",
    title: "Radical Transparency",
    body: "We publish what we find, including what has not worked, so the whole sector can learn from it.",
  },
];

export default function AboutUs() {
  return (
    <>
      <PageHero
        title="Who We Are"
        crumb="Who We Are"
        image="/images/photos/team-group.jpg"
      />

      <SectionIntro
        eyebrow="Our Identity"
        title="A Ghanaian institution dedicated to the"
        accent="transformation of education."
        lead="Transforming Teaching, Education & Learning (T-TEL) is a Ghanaian not-for-profit providing technical advice, project management, research and implementation support to strengthen the foundations of learning across Ghana."
      >
        <p>
          T-TEL was officially registered as a Ghanaian not-for-profit organisation on 7th July
          2020, growing out of a Government of Ghana programme funded by the UK&rsquo;s Foreign,
          Commonwealth &amp; Development Office.
        </p>
        <p>
          We use local talent and expertise to enable Ghana&rsquo;s education system to reach
          greater heights &mdash; working with the Ministry of Education, its agencies, the
          Colleges of Education and the universities that support them.
        </p>
      </SectionIntro>

      {/* Vision / Mission full-bleed split */}
      <section className={styles.split}>
        <div className={styles.vision}>
          <div className={styles.splitInner}>
            <span className={styles.eyebrowLight}>The Vision</span>
            <p className={styles.visionText}>
              Transformed education for development &mdash; an education system that empowers every
              Ghanaian learner to unlock their full potential.
            </p>
          </div>
        </div>

        <div className={styles.mission}>
          <div className={styles.splitInner}>
            <span className={styles.eyebrowDark}>The Mission</span>
            <p className={styles.missionText}>
              To support government to strengthen Ghana&rsquo;s education system and deliver
              consistent improvements in teaching quality, equitable learning outcomes and skills
              development.
            </p>
            <hr className={styles.missionRule} />
            <ul className={styles.steps}>
              {MISSION_STEPS.map((s) => (
                <li key={s.n}>
                  <span>{s.n}</span>
                  {s.label}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Operating principles */}
      <section className="section">
        <div className="container">
          <div className="reveal">
            <span className={styles.plainEyebrow}>Our DNA</span>
            <h2 className={styles.principlesTitle}>Operating Principles</h2>
            <hr className={styles.principlesRule} />
          </div>

          <div className={styles.principles}>
            {PRINCIPLES.map((p, i) => (
              <div key={p.n} className={`${styles.principle} reveal`} data-delay={String(i % 2)}>
                <span className={styles.principleNum}>{p.n}</span>
                <div>
                  <h3>{p.title}</h3>
                  <p>{p.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Core values + objects */}
      <section className={`section ${styles.values}`}>
        <div className="container">
          <div className="reveal">
            <span className="eyebrow on-dark">What guides us</span>
            <h2>Our Core Values</h2>
            <ul className={styles.valueList}>
              {[
                "Accountability",
                "Integrity",
                "Inclusivity",
                "Collaboration",
                "Creativity",
                "Excellence",
              ].map((v) => (
                <li key={v}>{v}</li>
              ))}
            </ul>
          </div>

          <div className={`${styles.objects} reveal`} data-delay="1">
            <h3>The objects of T-TEL are to:</h3>
            <ul>
              <li>
                Provide high quality technical advice, project management, research and
                implementation support services to institutions to transform teaching and learning;
              </li>
              <li>
                Promote an evidence and learning-based approach to achieving sustainable development
                and improved educational outcomes;
              </li>
              <li>
                Coordinate and support strategic collaboration across the education sector,
                including strategic partnerships which promote the goals of the organisation;
              </li>
              <li>Mobilise citizen action and advocate for quality education outcomes in Ghana;</li>
              <li>
                Convene inclusive dialogue across Ghanaian society &mdash; government, civil
                society, educational institutions and the private sector;
              </li>
              <li>Promote gender equality and social inclusion in all programmes.</li>
            </ul>
          </div>
        </div>
      </section>
    </>
  );
}
