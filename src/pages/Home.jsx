import { useCallback, useEffect, useRef, useState } from "react";
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

export default function Home() {
  const videoRef = useRef(null);
  const [playing, setPlaying] = useState(true);
  const [partnerPage, setPartnerPage] = useState(0);
  const [partnerPerView, setPartnerPerView] = useState(3);
  const [artPage, setArtPage] = useState(0);

  useEffect(() => {
    const updatePartnerPerView = () => {
      const width = window.innerWidth;
      setPartnerPerView(width < 640 ? 1 : width < 1000 ? 2 : 3);
    };
    updatePartnerPerView();
    window.addEventListener("resize", updatePartnerPerView);
    return () => window.removeEventListener("resize", updatePartnerPerView);
  }, []);

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
  const partners = useCms(() => cms.partners(), []);

  const posts = articles.data?.items ?? [];
  const partnerList = partners.data?.items ?? [];

  const ART_PER_VIEW = 3;
  const artPages = Math.max(1, Math.ceil(posts.length / ART_PER_VIEW));
  const visibleArticles = posts.length
    ? Array.from({ length: Math.min(ART_PER_VIEW, posts.length) }, (_, k) =>
        posts[(artPage * ART_PER_VIEW + k) % posts.length])
    : [];

  const partnerPages = Math.max(1, Math.ceil(partnerList.length / partnerPerView));
  const visiblePartners = partnerList.slice(partnerPage * partnerPerView, partnerPage * partnerPerView + partnerPerView);

  useEffect(() => {
    setPartnerPage((page) => Math.min(page, partnerPages - 1));
  }, [partnerPages]);

  const goToPartnerPage = useCallback((page) => {
    setPartnerPage((page + partnerPages) % partnerPages);
  }, [partnerPages]);

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
        <div className={styles.wrap}>
          {/* the panel the copy sits on — its own tone against the section */}
          <div className={styles.whoGrid}>
            <div className={`${styles.whoCopy} reveal`}>
              <h2>{settings.home_who_heading}</h2>
              <p>{settings.home_who_body}</p>
              <Link to={settings.home_who_button_url || "/about-us"} className={styles.redBtn}>
                {settings.home_who_button_label || "Learn More"}
              </Link>
            </div>
            <div className={`${styles.whoMedia} reveal`} data-delay="1">
              {mediaUrl(settings.home_who_image) && (
                <img src={mediaUrl(settings.home_who_image)} alt={settings.home_who_image_alt || ""} />
              )}
            </div>
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
      {flag("show_funders") && partnerList.length > 0 && (
      <section className={styles.funders}>
        <div className={styles.wrap}>
          <h2 className={`${styles.fundersTitle} reveal`}>{settings.home_funders_heading || "Funders"}</h2>

          <div className={styles.fundersRow}>
            {partnerPages > 1 && (
              <button
                type="button"
                className={styles.fundersNav}
                onClick={() => goToPartnerPage(partnerPage - 1)}
                aria-label="Previous funders"
              >
                <Icon name="arrowRight" size={18} style={{ transform: "rotate(180deg)" }} />
              </button>
            )}

            <ul key={partnerPage} className={styles.fundersTrack}>
              {visiblePartners.map((partner) => (
                <li key={partner._id || partner.slug}>
                  {partner.url ? (
                    <a href={partner.url} target="_blank" rel="noreferrer" title={partner.name}>
                      <img src={mediaUrl(partner.logo)} alt={partner.name} loading="eager" decoding="async" />
                    </a>
                  ) : (
                    <img src={mediaUrl(partner.logo)} alt={partner.name} loading="eager" decoding="async" />
                  )}
                </li>
              ))}
            </ul>

            {partnerPages > 1 && (
              <button
                type="button"
                className={styles.fundersNav}
                onClick={() => goToPartnerPage(partnerPage + 1)}
                aria-label="Next funders"
              >
                <Icon name="arrowRight" size={18} />
              </button>
            )}
          </div>

          <SliderProgress
            count={partnerPages}
            index={partnerPage}
            onSelect={goToPartnerPage}
            duration={9000}
          />
        </div>
      </section>
      )}
    </>
  );
}
