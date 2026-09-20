import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { cms, mediaUrl } from "../lib/cms";
import { useCms } from "../hooks/useCms";
import SliderProgress from "./SliderProgress";
import { CardsLoading, ErrorState } from "./States";
import Icon from "./Icon";
import styles from "./FocusCarousel.module.css";

export default function FocusCarousel() {
  const trackRef = useRef(null);
  const [page, setPage] = useState(0);
  const [pages, setPages] = useState(1);
  const [hovered, setHovered] = useState(false);
  const movingRef = useRef(false);

  const { data, loading, error, reload } = useCms(
    () => cms.posts({ type: "focus-areas", limit: 50 }),
    [],
  );
  const areas = data?.items ?? [];

  // pages are whole groups of visible tiles, not single-card steps
  const measure = useCallback(() => {
    const el = trackRef.current;
    if (!el || !el.firstChild) return;
    const perView = Math.max(1, Math.round(el.clientWidth / el.firstChild.clientWidth));
    setPages(Math.max(1, Math.ceil(areas.length / perView)));
  }, [areas.length]);

  useEffect(() => {
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [measure]);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    movingRef.current = true;
    el.scrollTo({ left: page * el.clientWidth, behavior: "smooth" });
    const settle = window.setTimeout(() => {
      movingRef.current = false;
    }, 520);
    return () => window.clearTimeout(settle);
  }, [page]);

  // wraps, so the arrows never dead-end at either edge
  const go = useCallback((i) => setPage(((i % pages) + pages) % pages), [pages]);

  // Someone who swipes or scrolls the track by hand moves past the page the
  // dots and arrows think they are on, so read the position back once the
  // scrolling settles — otherwise the next arrow press jumps somewhere odd.
  useEffect(() => {
    const el = trackRef.current;
    if (!el) return undefined;
    let timer;
    const onScroll = () => {
      if (movingRef.current) return;
      clearTimeout(timer);
      timer = setTimeout(() => {
        const i = Math.round(el.scrollLeft / el.clientWidth);
        setPage((p) => (i >= 0 && i < pages ? i : p));
      }, 140);
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      el.removeEventListener("scroll", onScroll);
      clearTimeout(timer);
    };
  }, [pages]);

  if (loading) {
    return (
      <div className={styles.loadingWrap}>
        <CardsLoading count={4} />
      </div>
    );
  }
  if (error) {
    return (
      <div className={styles.loadingWrap}>
        <ErrorState error={error} onRetry={reload} label="focus areas" />
      </div>
    );
  }
  if (!areas.length) return null;

  return (
    <div
      className={styles.wrap}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className={styles.track} ref={trackRef} role="region" aria-label="Focus areas carousel">
        {areas.map((area, i) => (
          <Link
            key={area._id || area.slug}
            to={`/focus-areas/${area.slug}`}
            // the accent alternates when an editor hasn't chosen one
            className={`${styles.card} ${styles[area.accent || (i % 2 ? "teal" : "orange")]}`}
          >
            <div className={styles.media}>
              {area.featuredImage?.url && (
                <img src={mediaUrl(area.featuredImage)} alt="" loading="lazy" />
              )}
            </div>
            <div className={styles.panel}>
              <span className={styles.num}>{area.number || String(i + 1).padStart(2, "0")}</span>
              <h3>{area.title}</h3>
              <p>{area.excerpt}</p>
              <span className={styles.go}>
                <Icon name="arrowRight" size={18} />
              </span>
            </div>
          </Link>
        ))}
      </div>

      <div className={styles.controls}>
        <SliderProgress count={pages} index={page} onSelect={go} paused={hovered} />

        {pages > 1 && (
          <div className={styles.nav}>
            <button type="button" onClick={() => go(page - 1)} aria-label="Previous focus areas">
              <Icon name="arrowRight" size={18} style={{ transform: "rotate(180deg)" }} />
            </button>
            <button type="button" onClick={() => go(page + 1)} aria-label="Next focus areas">
              <Icon name="arrowRight" size={18} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
