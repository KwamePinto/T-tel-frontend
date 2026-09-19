import { useEffect, useRef, useState } from "react";
import Seo from "../components/Seo";
import { Link } from "react-router-dom";
import Icon from "../components/Icon";
import FocusCarousel from "../components/FocusCarousel";
import SliderProgress from "../components/SliderProgress";
import { cms, mediaUrl } from "../lib/cms";
import { useCms } from "../hooks/useCms";
import { useSite } from "../context/SiteContext";
import { CardsLoading, ErrorState } from "../components/States";
import styles from "./Home.module.css";

const PER_VIEW = 5;

// The pages the "Who We Are" band pages through, after the settings-driven
// intro slide. Each has its own summary and hero image already, elsewhere on
// the site — these fallbacks only cover a page whose admin fields for that
// (heroImage, meta.heroDescription) haven't been filled in yet.
const ABOUT_SLUGS = [
  "about-us/our-history",
  "about-us/our-partners",
  "about-us/our-people",
  "about-us/our-policies",
  "join-us",
];

const ABOUT_FALLBACKS = {
  "about-us/our-history": {
    title: "Our History",
    body: "From a six-year, donor-funded teacher education programme to an independent Ghanaian institution — this is how T-TEL came to be.",
    image: "/images/photos/team-group.jpg",
    buttonLabel: "Read Our History",
  },
  "about-us/our-partners": {
    title: "Our Partners",
    body: "We work alongside the Ministry of Education and its agencies, academic institutions, and a wide range of funding, implementing and research partners.",
    image: "/images/focus/leadership-conference.jpg",
    buttonLabel: "Meet Our Partners",
  },
  "about-us/our-people": {
    title: "Our People",
    body: "From our founding Subscribers to the technical specialists working in colleges and districts across Ghana — meet the team making reform possible.",
    image: "/images/photos/team-group.jpg",
    buttonLabel: "Meet Our People",
  },
  "about-us/our-policies": {
    title: "Our Policies",
    body: "The protocols and standards that keep our work transparent, safe and accountable, covering safeguarding, conflict of interest and inclusion.",
    image: "/images/focus/library-review.jpg",
    buttonLabel: "View Our Policies",
  },
  "join-us": {
    title: "Join Us",
    body: "Build your career with a Ghanaian organisation transforming teaching, education and learning — see current opportunities with T-TEL.",
    image: "/images/photos/team-group.jpg",
    buttonLabel: "Join Our Team",
  },
};

export default function Home() {
  const videoRef = useRef(null);
  const [playing, setPlaying] = useState(true);
  const [funderPage, setFunderPage] = useState(0);
  const [artPage, setArtPage] = useState(0);

  // The video is the hero — it starts downloading with the page rather than
  // waiting for window.load, and there is no poster, because a still frame
  // painting first and then being replaced is exactly the flash we don't want.
  // Until the first frame arrives the section shows its own dark green, which
  // is what the video fades in over anyway.
  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;

    // autoplay is the primary path; this only keeps the button's label honest
    const sync = () => setPlaying(!el.paused);
    el.addEventListener("play", sync);
    el.addEventListener("pause", sync);

    // Safari and Chrome both refuse autoplay in some power/data-saver modes
    el.play().catch(() => setPlaying(false));

    return () => {
      el.removeEventListener("play", sync);
      el.removeEventListener("pause", sync);
    };
  }, []);

  function toggleVideo() {
    const el = videoRef.current;
    if (!el) return;
    if (el.paused) {
      el.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
    } else {
      el.pause();
      setPlaying(false);
    }
  }

  const { settings, flag } = useSite();

  const articles = useCms(() => cms.posts({ type: "blog", limit: 12 }), []);
  const funders = useCms(() => cms.partners({ home: true }), []);

  // The other pages the "Who We Are" band cycles through. Fetched once, in
  // parallel; a page missing its own hero image or summary falls back to the
  // same copy that page itself uses, so a slide never comes up empty while
  // an editor is filling in something more specific in the admin.
  const aboutPages = useCms(
    () => Promise.all(ABOUT_SLUGS.map((slug) => cms.page(slug).catch(() => null))),
    [],
  );
  const [whoIndex, setWhoIndex] = useState(0);

  const posts = articles.data?.items ?? [];
  const funderList = funders.data?.items ?? [];

  const ART_PER_VIEW = 3;
  const artPages = Math.max(1, Math.ceil(posts.length / ART_PER_VIEW));
  const visibleArticles = posts.length
    ? Array.from({ length: Math.min(ART_PER_VIEW, posts.length) }, (_, k) =>
        posts[(artPage * ART_PER_VIEW + k) % posts.length])
    : [];

  const funderPages = Math.max(1, Math.ceil(funderList.length / PER_VIEW));
  const visibleFunders = funderList.slice(funderPage * PER_VIEW, funderPage * PER_VIEW + PER_VIEW);

  // Slide 0 is the settings-driven "Who We Are" intro, exactly as it always
  // was. The rest come from ABOUT_SLUGS, each falling back to its own page's
  // existing copy until an editor sets something specific for this band.
  const whoSlide = {
    key: "who",
    heading: settings.home_who_heading,
    body: settings.home_who_body,
    image: mediaUrl(settings.home_who_image),
    imageAlt: settings.home_who_image_alt || "",
    buttonLabel: settings.home_who_button_label || "Learn More",
    buttonUrl: settings.home_who_button_url || "/about-us",
  };

  const aboutSlides = ABOUT_SLUGS.map((slug, i) => {
    const page = aboutPages.data?.[i];
    const fallback = ABOUT_FALLBACKS[slug];
    return {
      key: slug,
      heading: page?.title || fallback.title,
      body: page?.meta?.heroDescription || fallback.body,
      image: mediaUrl(page?.heroImage) || fallback.image,
      imageAlt: page?.heroImage?.alt || "",
      buttonLabel: fallback.buttonLabel,
      buttonUrl: `/${slug}`,
    };
  });

  const whoSlides = [whoSlide, ...aboutSlides];
  const activeWho = whoSlides[whoIndex % whoSlides.length];

  // Strategic objectives are three editable settings rather than a fixed list.
  const objectives = [
    { n: "01", icon: "graduation", body: settings.home_strategic_card1 },
    { n: "02", icon: "book", filled: true, body: settings.home_strategic_card2 },
    { n: "03", icon: "bank", body: settings.home_strategic_card3 },
  ].filter((o) => o.body);

  const formatDate = (value) =>
    value
      ? new Date(value).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })
      : "";

  return (
    <>
      <Seo description={settings.home_who_body} image={settings.hero_image_url} />
      {/* ---------------- HERO ---------------- */}
      <section className={styles.hero}>
        <video
          ref={videoRef}
          className={styles.heroVideo}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          aria-hidden="true"
        >
          <source src={mediaUrl(settings.hero_video_url) || "/video/hero.mp4"} type="video/mp4" />
        </video>

        <button
          type="button"
          className={styles.playToggle}
          onClick={toggleVideo}
          aria-label={playing ? "Pause background video" : "Play background video"}
        >
          {playing ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M6 5h4v14H6zm8 0h4v14h-4z" />
            </svg>
          ) : (
            <Icon name="play" size={18} />
          )}
        </button>

        <div className={styles.heroCaption}>
          <div className={styles.wrap}>
            <h1>{settings.hero_heading}</h1>
          </div>
        </div>

      </section>

      <div className={styles.tricolour} aria-hidden="true">
        <span /><span /><span />
      </div>

      {/* ---------------- WHO WE ARE ---------------- */}
      {flag("show_who") && (
      <section className={styles.who}>
        <div className={`${styles.wrap} ${styles.whoGrid}`}>
          {/* The two panels below keep the same "reveal" element across every
              slide — only the text and image inside change — so the scroll
              reveal, which marks an element as shown by adding a class to
              that exact DOM node, is never asked to reveal it twice. */}
          <div className={`${styles.whoCopy} reveal`} aria-live="polite">
            <h2>{activeWho.heading}</h2>
            <p>{activeWho.body}</p>
            <Link to={activeWho.buttonUrl} className={styles.redBtn}>
              {activeWho.buttonLabel}
            </Link>
          </div>

          {/*
            A sibling of .whoCopy and .whoMedia, not nested inside either —
            deliberately. .reveal sets will-change: transform, and a
            will-change hint establishes a containing block for absolutely
            positioned descendants exactly as a live transform would, whether
            or not the transform ends up applying. Nested here, the arrows
            were positioning against .whoCopy's ~560px column instead of the
            full section, which is why "next" landed barely past the middle
            of the page instead of near the right edge.

            On a phone this stacks between the copy and the photograph, in
            normal flow. From 820px it renders nothing of its own (display:
            contents) and its buttons are pulled out to the edges of the
            section instead — see .whoNav.
          */}
          <div className={styles.whoNavGroup}>
            <button
              type="button"
              className={`${styles.whoNav} ${styles.whoNavPrev}`}
              onClick={() => setWhoIndex((i) => (i - 1 + whoSlides.length) % whoSlides.length)}
              aria-label="Show the previous section"
            >
              <Icon name="arrowRight" size={18} style={{ transform: "rotate(180deg)" }} />
            </button>
            <button
              type="button"
              className={`${styles.whoNav} ${styles.whoNavNext}`}
              onClick={() => setWhoIndex((i) => (i + 1) % whoSlides.length)}
              aria-label="Show the next section"
            >
              <Icon name="arrowRight" size={18} />
            </button>
          </div>

          <div className={`${styles.whoMedia} reveal`} data-delay="1">
            {activeWho.image && <img src={activeWho.image} alt={activeWho.imageAlt} />}
          </div>
        </div>
      </section>
      )}

      {/* ---------------- STRATEGIC OBJECTIVES ---------------- */}
      {flag("show_strategic") && objectives.length > 0 && (
      <section className={styles.objectives}>
        <div className={`${styles.wrap} ${styles.objInner}`}>
          <h2 className="reveal">{settings.home_strategic_heading}</h2>
          <div className={styles.objGrid}>
            {objectives.map((o, i) => (
              <article
                key={o.n}
                className={`${styles.objCard} ${o.filled ? styles.objFilled : ""} reveal`}
                data-delay={String(i)}
              >
                <p>{o.body}</p>
                <footer>
                  <span className={styles.objIcon} aria-hidden="true">
                    {o.icon === "graduation" && (
                      <svg width="30" height="30" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 3 1 9l11 6 9-4.91V17h2V9zM5 13.18v4L12 21l7-3.82v-4L12 17z" />
                      </svg>
                    )}
                    {o.icon === "book" && (
                      <svg width="30" height="30" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 6c-2-1.5-5-2-8-1v13c3-1 6-.5 8 1 2-1.5 5-2 8-1V5c-3-1-6-.5-8 1m0 11.5V7.9c1.6-.9 3.6-1.3 5.5-1v9.6c-1.9-.3-3.9.1-5.5 1" />
                      </svg>
                    )}
                    {o.icon === "bank" && (
                      <svg width="30" height="30" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 3 2 8v2h20V8zM4 11v7H2v2h20v-2h-2v-7h-2v7h-3v-7h-2v7h-3v-7H8v7H6v-7z" />
                      </svg>
                    )}
                  </span>
                  <span className={styles.objNum}>{o.n}</span>
                </footer>
              </article>
            ))}
          </div>
        </div>
      </section>
      )}

      {/* ---------------- OUR ARTICLES ---------------- */}
      <section className={styles.articles}>
        <div className={styles.wrap}>
          <div className={`${styles.artHead} reveal`}>
            <h2>{settings.home_articles_heading || "Our Articles"}</h2>
            {artPages > 1 && (
            <div className={styles.artNav}>
              <button
                type="button"
                onClick={() => setArtPage((p) => (p - 1 + artPages) % artPages)}
                aria-label="Previous articles"
              >
                <Icon name="arrowRight" size={17} style={{ transform: "rotate(180deg)" }} />
              </button>
              <button
                type="button"
                onClick={() => setArtPage((p) => (p + 1) % artPages)}
                aria-label="Next articles"
              >
                <Icon name="arrowRight" size={17} />
              </button>
            </div>
            )}
          </div>

          {articles.loading && <CardsLoading count={3} />}
          {articles.error && <ErrorState error={articles.error} onRetry={articles.reload} label="articles" />}

          <div className={styles.artGrid}>
            {visibleArticles.map((n) => (
              <article key={n._id || n.slug} className={styles.artCard}>
                <div className={styles.artMedia}>
                  {n.featuredImage?.url && (
                    <img src={mediaUrl(n.featuredImage)} alt={n.featuredImage.alt || ""} loading="lazy" />
                  )}
                  <span className={styles.artDate}>{formatDate(n.publishedAt)}</span>
                </div>
                <h3>{n.title}</h3>
                <p>{n.excerpt}</p>
                <Link to={`/news-and-media/${n.slug}`} className={styles.artBtn}>
                  Learn more
                </Link>
              </article>
            ))}
          </div>

          <div className={styles.artFoot}>
            <Link to="/news-and-media" className={styles.viewAll}>
              View all posts
              <Icon name="arrowRight" size={17} />
            </Link>
          </div>
        </div>
      </section>

      {/* ---------------- FOCUS AREAS ---------------- */}
      {flag("show_focus") && (
      <section className={styles.focus}>
        <div className={`${styles.wrap} ${styles.focusHead} reveal`}>
          <h2>{settings.home_focus_heading || "Focus Areas"}</h2>
          <p>{settings.home_focus_intro}</p>
        </div>
        <FocusCarousel />
      </section>
      )}

      {/* ---------------- FUNDERS ---------------- */}
      {flag("show_funders") && funderList.length > 0 && (
      <section className={styles.funders}>
        <div className={styles.wrap}>
          <h2 className={`${styles.fundersTitle} reveal`}>{settings.home_funders_heading || "Funders"}</h2>

          <div className={styles.fundersRow}>
            <button
              type="button"
              className={styles.fundersNav}
              onClick={() => setFunderPage((p) => (p - 1 + funderPages) % funderPages)}
              aria-label="Previous funders"
            >
              <Icon name="arrowRight" size={18} style={{ transform: "rotate(180deg)" }} />
            </button>

            <ul className={styles.fundersTrack}>
              {visibleFunders.map((f) => (
                <li key={f._id || f.slug}>
                  {f.url ? (
                    <a href={f.url} target="_blank" rel="noreferrer" title={f.name}>
                      <img src={mediaUrl(f.logo)} alt={f.name} loading="lazy" />
                    </a>
                  ) : (
                    <img src={mediaUrl(f.logo)} alt={f.name} loading="lazy" />
                  )}
                </li>
              ))}
            </ul>

            <button
              type="button"
              className={styles.fundersNav}
              onClick={() => setFunderPage((p) => (p + 1) % funderPages)}
              aria-label="Next funders"
            >
              <Icon name="arrowRight" size={18} />
            </button>
          </div>

          <SliderProgress
            count={funderPages}
            index={funderPage}
            onSelect={setFunderPage}
          />
        </div>
      </section>
      )}
    </>
  );
}
