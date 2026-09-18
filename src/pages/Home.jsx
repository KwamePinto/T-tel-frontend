import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import Icon from "../components/Icon";
import FocusCarousel from "../components/FocusCarousel";
import RotatingWord from "../components/RotatingWord";
import { PROJECTS } from "../data/projects";
import { LATEST_NEWS } from "../data/news";
import {
  GOVERNMENT_PARTNERS,
  UNIVERSITY_PARTNERS,
  FUNDING_PARTNERS,
} from "../data/partners";
import styles from "./Home.module.css";

const PILLARS = [
  {
    key: "mission",
    label: "Our Mission",
    kicker: "The Purpose",
    icon: "target",
    to: "/about-us",
  },
  {
    key: "vision",
    label: "Our Vision",
    kicker: "The Ambition",
    icon: "eye",
    to: "/about-us",
  },
  {
    key: "who",
    label: "Who We Are",
    kicker: "The Institution",
    icon: "people",
    to: "/about-us",
  },
];

const FRAMEWORK = [
  {
    n: "01",
    tone: "q1",
    title: "Organisational Growth",
    body: "Secure and effectively deliver projects and technical assistance assignments that strengthen T-TEL's reputation and drive sustainable organisational growth, including through partnerships and diversification of revenue streams.",
  },
  {
    n: "02",
    tone: "q2",
    title: "Thought Leadership",
    body: "Position T-TEL as a recognised convenor and thought leader in technical and professional excellence, assisting the Ministry of Education and its agencies to advance quality education in Ghana.",
  },
  {
    n: "03",
    tone: "q3",
    title: "Operational Excellence",
    body: "Establish and optimise T-TEL's governance, leadership and operational structures, policies and processes to build a streamlined and high-performing organisation.",
  },
  {
    n: "04",
    tone: "q4",
    title: "Learning & Evidence",
    body: "Develop T-TEL as a learning organisation that develops, applies and shares evidence to drive continuous improvement and informed decision-making.",
  },
];

const ALL_PARTNERS = [...GOVERNMENT_PARTNERS, ...UNIVERSITY_PARTNERS, ...FUNDING_PARTNERS];

export default function Home() {
  const videoRef = useRef(null);

  // The poster paints immediately; the video file is only fetched once the
  // rest of the page has loaded, so it never competes for initial bandwidth.
  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;

    const start = () => {
      if (el.dataset.loaded) return;
      el.dataset.loaded = "true";
      for (const source of el.querySelectorAll("source[data-src]")) {
        source.src = source.dataset.src;
      }
      el.load();
      el.play().catch(() => {
        /* autoplay can be refused; the poster remains as the fallback */
      });
    };

    if (document.readyState === "complete") {
      start();
      return;
    }
    window.addEventListener("load", start, { once: true });
    return () => window.removeEventListener("load", start);
  }, []);

  return (
    <>
      {/* ---------------- HERO ---------------- */}
      <section className={styles.hero}>
        <video
          ref={videoRef}
          className={styles.heroVideo}
          autoPlay
          muted
          loop
          playsInline
          preload="none"
          poster="/images/hero/home.jpg"
          aria-hidden="true"
        >
          {/* add a hero.webm alongside the mp4 and it will be preferred */}
          <source data-src="/video/hero.mp4" type="video/mp4" />
        </video>
        <div className={styles.heroScrim} />

        <div className={`container ${styles.heroInner}`}>
          <h1
            className={styles.heroTitle}
            aria-label="Transformed education, for Ghana's development."
          >
            <span aria-hidden="true">
              Transformed education,
              <br />
              for{" "}
              <RotatingWord
                words={["Ghana’s", "society’s", "Africa’s"]}
                className={styles.heroAccent}
              />
              <br />
              development.
            </span>
          </h1>
          <p className={styles.heroLede}>
            Educational technical assistance in close partnership with government &mdash; a decade
            of proven impact.
          </p>
          <Link to="/focus-areas" className="btn">
            Explore Focus Areas
            <Icon name="arrowRight" size={18} />
          </Link>
        </div>

        <div className={styles.scrollHint} aria-hidden="true">
          <span />
        </div>
      </section>

      {/* ---------------- PILLAR PANELS ---------------- */}
      <section className={styles.pillars} aria-label="About T-TEL">
        {PILLARS.map((p) => (
          <Link key={p.key} to={p.to} className={`${styles.pillar} ${styles[p.key]}`}>
            <Icon name={p.icon} size={26} />
            <h2>{p.label}</h2>
            <div className={styles.pillarFoot}>
              <span>{p.kicker}</span>
              <i>
                <Icon name="arrowRight" size={16} />
              </i>
            </div>
          </Link>
        ))}
      </section>

      {/* ---------------- ABOUT SPLIT ---------------- */}
      <section className={`section ${styles.about}`}>
        <div className={`container ${styles.aboutGrid}`}>
          <div className={`${styles.aboutCopy} reveal`}>
            <span className="eyebrow">About Us</span>
            <h2>Changing Lives with Knowledge</h2>
            <p className={styles.aboutLead}>
              Our promise is that technical assistance does exactly what it says it does &mdash; it
              puts qualified teachers in classrooms and keeps children learning.
            </p>
            <p>
              We work alongside teachers, tutors, head teachers and district education offices
              across Ghana, so the gains outlast any single programme. When a funding cycle closes,
              the institution is still standing and the teaching is still better.
            </p>
            <div className={styles.aboutActions}>
              <Link to="/about-us" className="btn btn-ink">
                Learn More
                <Icon name="arrowRight" size={18} />
              </Link>
              <Link to="/about-us/our-history" className="link-arrow">
                Our History
                <Icon name="arrowRight" size={17} />
              </Link>
            </div>
          </div>

          <div className={`${styles.aboutMedia} reveal`} data-delay="1">
            <figure className={styles.archMain}>
              <img src="/images/focus/leadership-conference.jpg" alt="" />
            </figure>
            <figure className={styles.archSmall}>
              <img src="/images/focus/students-laptops.jpg" alt="" />
            </figure>
            <span className={styles.archOutline} aria-hidden="true" />
            <div className={styles.statChip}>
              <strong>46</strong>
              <span>Colleges of Education</span>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- MISSION / VISION ---------------- */}
      <section className={styles.mv}>
        <div className={`container ${styles.mvGrid}`}>
          <div className={`${styles.mvCopy} reveal`}>
            <span className="eyebrow">Our Purpose</span>
            <h2>The Mission</h2>
            <p>
              To support government to strengthen Ghana&rsquo;s education system and deliver
              consistent improvements in teaching quality, equitable learning outcomes and skills
              development.
            </p>
            <Link to="/about-us/our-history" className="btn">
              Our History
            </Link>
          </div>
          <div className={`${styles.mvMedia} reveal`} data-delay="1">
            <img src="/images/photos/team-group.jpg" alt="The T-TEL team" />
          </div>
        </div>

        <div className={`container ${styles.mvGrid} ${styles.mvFlip}`}>
          <div className={`${styles.mvStack} reveal`}>
            <img src="/images/focus/sign-language.jpg" alt="" />
            <img src="/images/focus/laptop-review.jpg" alt="" />
          </div>
          <div className={`${styles.mvCopy} reveal`} data-delay="1">
            <span className="eyebrow">Our Ambition</span>
            <h2>The Vision</h2>
            <p>
              Transformed education for development &mdash; an education system that empowers every
              Ghanaian learner to unlock their potential and contribute to the nation&rsquo;s
              sustainable development.
            </p>
            <hr className={styles.mvRule} />
            <span className={styles.mvValuesLabel}>Core Values</span>
            <p className={styles.mvValues}>
              Accountability &middot; Integrity &middot; Inclusivity &middot; Collaboration
              &middot; Creativity &middot; Excellence
            </p>
            <Link to="/about-us" className="btn">
              Who We Are
            </Link>
          </div>
        </div>
      </section>

      {/* ---------------- STRATEGIC FRAMEWORK (sticky left) ---------------- */}
      <section className={`section ${styles.framework}`}>
        <span className={styles.frameworkWatermark} aria-hidden="true">
          2026
        </span>
        <div className={`container ${styles.frameworkGrid}`}>
          <div className={styles.frameworkIntro}>
            <div className="reveal">
              <span className="eyebrow">Roadmap</span>
              <h2>
                Strategic
                <br />
                Framework
                <br />
                2026&ndash;2028
              </h2>
              <p className="lede">
                Our priorities provide a roadmap for T-TEL to achieve sustainable impact and
                resilient growth, navigating an evolving political and operational environment.
              </p>
              <hr className="rule" />
            </div>
          </div>

          <div className={styles.frameworkCards}>
            {FRAMEWORK.map((f, i) => (
              <article
                key={f.n}
                className={`${styles.fwCard} ${styles[f.tone]} reveal`}
                data-delay={String(i % 3)}
                tabIndex={0}
              >
                <span className={styles.fwFill} aria-hidden="true" />
                <span className={styles.fwBody}>
                  <span className={styles.fwNum}>{f.n}</span>
                  <h3>{f.title}</h3>
                  <p>{f.body}</p>
                  <span className={styles.fwRule} />
                </span>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- FOCUS AREAS CAROUSEL ---------------- */}
      <section className={styles.focus}>
        <div className={`container ${styles.focusHead}`}>
          <div className="reveal">
            <span className="eyebrow on-dark">Focus Areas</span>
            <h2>
              What we
              <br />
              focus on
            </h2>
          </div>
          <div className={`${styles.focusIntro} reveal`} data-delay="1">
            <p>
              T-TEL works with the Government of Ghana and specialist partners to transform teaching
              and learning across nine core pillars &mdash; from curriculum and assessment to
              inclusion, leadership and evidence.
            </p>
            <Link to="/focus-areas" className="link-arrow" style={{ color: "#fff" }}>
              All focus areas
              <Icon name="arrowRight" size={17} />
            </Link>
          </div>
        </div>
        <div className={styles.focusCarousel}>
          <FocusCarousel />
        </div>
      </section>

      {/* ---------------- PROGRAMMES ---------------- */}
      <section className={`section ${styles.programmes}`}>
        <div className="container">
          <div className={`${styles.sectionHead} reveal`}>
            <div>
              <span className="eyebrow">Programmes</span>
              <h2>What we deliver</h2>
            </div>
            <Link to="/programmes" className="btn btn-outline">
              All Programmes
              <Icon name="arrowRight" size={18} />
            </Link>
          </div>

          <div className={styles.progGrid}>
            {PROJECTS.map((p, i) => (
              <Link
                key={p.slug}
                to={`/programmes/${p.slug}`}
                className={`${styles.progCard} reveal`}
                data-delay={String(i % 3)}
              >
                {p.image ? (
                  <img src={p.image} alt="" loading="lazy" />
                ) : (
                  <div className={styles.progPlaceholder} />
                )}
                <div className={styles.progBody}>
                  <span className={styles.progPartner}>{p.partner}</span>
                  <h3>{p.title}</h3>
                  <p>{p.summary}</p>
                  <span className="link-arrow">
                    Read more
                    <Icon name="arrowRight" size={17} />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- PARTNER MARQUEE ---------------- */}
      <section className={`section ${styles.partners}`}>
        <div className={`container ${styles.partnersHead} reveal`}>
          <span className="eyebrow eyebrow-plain">Strategic Collaborations</span>
          <h2>Our partnership ecosystem</h2>
        </div>
        <div className={styles.marquee} aria-label="Our partners">
          <div className={styles.marqueeTrack}>
            {[...ALL_PARTNERS, ...ALL_PARTNERS].map((p, i) => (
              <div className={styles.logoChip} key={`${p.name}-${i}`}>
                <img src={p.logo} alt={i < ALL_PARTNERS.length ? p.name : ""} loading="lazy" />
                <span>{p.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- NEWS ---------------- */}
      <section className={`section ${styles.news}`}>
        <div className="container">
          <div className={`${styles.sectionHead} reveal`}>
            <div>
              <span className="eyebrow on-dark">Knowledge Hub</span>
              <h2>Latest insights &amp; stories</h2>
              <p className={styles.newsLede}>
                Research, field reporting and updates from the schools and districts we work in.
              </p>
            </div>
            <Link to="/news-and-media" className="btn btn-ghost-light">
              View all
              <Icon name="arrowRight" size={18} />
            </Link>
          </div>

          <div className={styles.newsGrid}>
            {LATEST_NEWS.map((n, i) => (
              <article key={n.title} className={`${styles.newsCard} reveal`} data-delay={String(i)}>
                <img src={n.image} alt="" loading="lazy" />
                <div className={styles.newsOverlay}>
                  <span className={styles.newsDate}>{n.date}</span>
                  <h3>{n.title}</h3>
                  <p>{n.excerpt}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
