import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { FOCUS_AREAS } from "../data/focusAreas";
import Icon from "./Icon";
import styles from "./FocusCarousel.module.css";

export default function FocusCarousel() {
  const trackRef = useRef(null);
  const [page, setPage] = useState(0);
  const [pages, setPages] = useState(1);

  const measure = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    const perView = Math.max(1, Math.round(el.clientWidth / (el.firstChild?.clientWidth || 1)));
    setPages(Math.max(1, FOCUS_AREAS.length - perView + 1));
    setPage(Math.round(el.scrollLeft / (el.firstChild?.clientWidth || 1)));
  }, []);

  useEffect(() => {
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [measure]);

  function goTo(index) {
    const el = trackRef.current;
    if (!el || !el.firstChild) return;
    el.scrollTo({ left: index * el.firstChild.clientWidth, behavior: "smooth" });
  }

  function nudge(dir) {
    const el = trackRef.current;
    if (!el || !el.firstChild) return;
    el.scrollBy({ left: dir * el.firstChild.clientWidth, behavior: "smooth" });
  }

  return (
    <div className={styles.wrap}>
      <div
        className={styles.track}
        ref={trackRef}
        onScroll={measure}
        tabIndex={0}
        role="region"
        aria-label="Focus areas carousel"
      >
        {FOCUS_AREAS.map((area) => (
          <Link
            key={area.slug}
            to={`/focus-areas/${area.slug}`}
            className={`${styles.card} ${styles[area.accent]}`}
          >
            <div className={styles.media}>
              <img src={area.image} alt="" loading="lazy" />
            </div>
            <div className={styles.panel}>
              <span className={styles.num}>{area.number}</span>
              <h3>{area.title}</h3>
              <p>{area.blurb}</p>
              <span className={styles.go}>
                <Icon name="arrowRight" size={18} />
              </span>
            </div>
          </Link>
        ))}
      </div>

      <div className={styles.controls}>
        <div className={styles.dots}>
          {Array.from({ length: pages }).map((_, i) => (
            <button
              key={i}
              className={i === page ? styles.dotOn : styles.dot}
              onClick={() => goTo(i)}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
        <div className={styles.arrows}>
          <button onClick={() => nudge(-1)} aria-label="Previous focus areas">
            <Icon name="arrowRight" size={20} style={{ transform: "rotate(180deg)" }} />
          </button>
          <button onClick={() => nudge(1)} aria-label="Next focus areas">
            <Icon name="arrowRight" size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
