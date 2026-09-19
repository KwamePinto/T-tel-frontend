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
    el.scrollTo({ left: page * el.clientWidth, behavior: "smooth" });
  }, [page]);

  const go = useCallback((i) => setPage(((i % pages) + pages) % pages), [pages]);

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
      </div>
    </div>
  );
}
