import PageHero from "../../components/PageHero";
import SectionIntro from "../../components/SectionIntro";
import styles from "./OurHistory.module.css";

const STATS = [
  { value: "46", label: "Colleges of Education" },
  { value: "10yrs", label: "Programme Duration" },
];

const PHASES = [
  {
    kicker: "Phase 01",
    year: null,
    title: "A decade of FCDO investment",
    body: "Transforming Teacher Education & Learning was established in 2014 as a Government of Ghana pre-service teacher training programme, funded by the Foreign, Commonwealth & Development Office and implemented by Cambridge Education.",
    image: "/images/focus/leadership-conference.jpg",
  },
  {
    kicker: "Phase 02",
    year: null,
    title: "A remit that widened",
    body: "In 2018 T-TEL's remit extended to comprehensive teacher education policy reform led by the Ghana Tertiary Education Commission (GTEC), supporting the rollout of a new four-year B.Ed. degree across 46 Colleges of Education through five partner universities.",
    image: "/images/focus/library-review.jpg",
  },
  {
    kicker: "Phase 03",
    year: null,
    title: "An independent institution takes shape",
    body: "In 2019 the programme team explored options with the Ministry of Education to keep the work going beyond the FCDO programme. Independent reviews had found it 'most likely to be sustained' — and fifteen founding subscribers came together to make that possible.",
    image: "/images/focus/laptop-review.jpg",
  },
  {
    kicker: null,
    year: "2020",
    title: "T-TEL is established",
    body: "On 7th July 2020, T-TEL was registered as a Ghanaian not-for-profit organisation. It became fully operational in February 2021 and commenced its first three projects — T-SHEL with Mastercard Foundation, DeliverEd with the University of Oxford, and the COVID-19 Impact Assessment Study with EdTech Hub.",
    image: "/images/photos/team-group.jpg",
  },
];

export default function OurHistory() {
  return (
    <>
      <PageHero
        title="Our History"
        crumb="Our History"
        subtitle="From a decade-long bilateral aid programme to an independent Ghanaian institution."
        image="/images/focus/library-review.jpg"
      />

      <SectionIntro
        eyebrow="Institutional Origins"
        title="A decade of investment."
        accent="A lifetime of impact."
        lead="T-TEL began life as a Government of Ghana programme and became an independent Ghanaian organisation — carrying a decade of institutional knowledge with it."
        rule={false}
      >
        <p className={styles.dropCap}>
          The Transforming Teacher Education &amp; Learning programme, funded by the Foreign,
          Commonwealth and Development Office (FCDO) and implemented by Cambridge Education,
          supported Ghana&rsquo;s Colleges of Education through the most significant teacher
          education reform in a generation.
        </p>

        <blockquote className={styles.quote}>
          &ldquo;Feedback for T-TEL&rsquo;s work has been consistently positive through this review
          process and the programme represents a very strong example of how technical assistance can
          support national scale reforms and implementation across the education system.&rdquo;
          <cite>The programme&rsquo;s December 2019 annual review by FCDO</cite>
        </blockquote>

        <p>
          An Independent Commission for Aid Impact report similarly found the programme most likely
          of its kind to be sustained. Ghana&rsquo;s then Minister for Education, Dr. Mathew Opoku
          Prempeh, played an instrumental role in supporting the transition, and Mastercard
          Foundation offered early encouragement to establish an independent organisation &mdash;
          creating a genuinely Ghanaian alternative to international technical assistance providers.
        </p>

        <div className={styles.stats}>
          {STATS.map((s) => (
            <div key={s.label}>
              <strong>{s.value}</strong>
              <span>{s.label}</span>
            </div>
          ))}
        </div>
      </SectionIntro>

      {/* dark timeline */}
      <section className={styles.timelineSection}>
        <div className="container">
          <div className="reveal">
            <span className="eyebrow on-dark">The Roadmap</span>
            <h2 className={styles.timelineTitle}>From programme to institution</h2>
          </div>

          <ol className={styles.timeline}>
            {PHASES.map((p) => (
              <li key={p.title} className={`${styles.entry} reveal`}>
                <span className={styles.node} aria-hidden="true" />
                <div className={styles.entryCopy}>
                  {p.year ? (
                    <span className={styles.year}>{p.year}</span>
                  ) : (
                    <span className={styles.kicker}>{p.kicker}</span>
                  )}
                  <h3>{p.title}</h3>
                  <p>{p.body}</p>
                </div>
                <div className={styles.entryMedia}>
                  <img src={p.image} alt="" loading="lazy" />
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>
    </>
  );
}
