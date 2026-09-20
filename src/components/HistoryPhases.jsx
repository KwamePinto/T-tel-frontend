import { useEffect, useRef, useState } from "react";
import { mediaUrl } from "../lib/cms";
import e from "../styles/editorial.module.css";
import styles from "./HistoryPhases.module.css";

/**
 * The roadmap half of Our History.
 *
 * The phases are an account, not a gallery: between them they have a single
 * photograph. An alternating timeline would therefore spend four of its five
 * rows on empty space, so the picture is lifted out to a rail that holds still
 * beside the phases instead, and the phases themselves run as one column of
 * numbered entries. Where an editor adds a picture to a later phase it sits
 * inside that phase, so the layout grows properly rather than only working at
 * the one photograph it has today.
 *
 * A phase given a `year` is the arrival the sequence builds to: it keeps the
 * year in place of a number and is set larger, so it reads as an ending rather
 * than as one more entry.
 */
function Phase({ phase, index, withImage, active }) {
  const { title, paras = [], image, year } = phase;

  // "Phase 3" as a title only repeats the numeral beside it. Titles were
  // optional in the layout this replaces, so most still carry the placeholder;
  // a real one typed in the admin renders normally.
  const heading = /^\s*phase\s*\d+\s*$/i.test(title || "") ? null : title;

  return (
    <li className={`${styles.phase} ${year ? styles.arrival : ""} ${active ? styles.active : ""}`}>
      <span className={styles.numeral} aria-hidden="true">
        {year || String(index + 1).padStart(2, "0")}
      </span>

      <div className={styles.body}>
        {!year && <span className={styles.step}>Phase {index + 1}</span>}
        {heading && <h3 className={`${e.displaySm} ${styles.title}`}>{heading}</h3>}
        {paras.map((para, i) => <p key={i} className={styles.para}>{para}</p>)}

        {withImage && (
          <figure className={styles.inlineMedia}>
            <img src={mediaUrl(image)} alt={title || ""} loading="lazy" />
          </figure>
        )}
      </div>
    </li>
  );
}

export default function HistoryPhases({ data }) {
  const wrap = useRef(null);
  const [progress, setProgress] = useState(0);
  const phases = data?.milestones || [];
  const links = data?.links || [];
  if (!phases.length) return null;

  // The rail takes a phase's own picture where there is one — that phase then
  // doesn't repeat it further down. The roadmap's heroImage is only the
  // fallback, because the page banner above is already showing it and the
  // same photograph twice on one screen reads as a mistake.
  const borrowed = phases.findIndex((p) => p.image);
  const railImage = borrowed >= 0 ? phases[borrowed].image : data?.heroImage || null;

  useEffect(() => {
    let frame = 0;

    const updateProgress = () => {
      frame = 0;
      const element = wrap.current;
      if (!element) return;

      const rect = element.getBoundingClientRect();
      const start = window.innerHeight * 0.2;
      const end = window.innerHeight * 0.76;
      const travel = Math.max(rect.height + start - end, 1);
      const next = Math.min(1, Math.max(0, (start - rect.top) / travel));
      setProgress(next);
    };

    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(updateProgress);
    };

    updateProgress();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [phases.length]);

  const activeIndex = Math.min(
    phases.length - 1,
    Math.floor(progress * phases.length),
  );

  return (
    <section ref={wrap} className={styles.wrap}>
      <div className={`container ${styles.grid}`}>
        <div className={styles.rail}>
          <div className={styles.railInner}>
            {data?.timelineEyebrow && (
              <span className={`${e.eyebrow} ${e.eyebrowMuted} ${styles.head}`}>
                {data.timelineEyebrow}
              </span>
            )}
            {data?.timelineHeading && (
              <h2 className={`${e.display} ${styles.headTitle}`}>{data.timelineHeading}</h2>
            )}

            {railImage && (
              <figure className={styles.railMedia}>
                <img src={mediaUrl(railImage)} alt="" loading="lazy" />
              </figure>
            )}

            {links.length > 0 && (
              <ul className={styles.links}>
                {links.map((link, i) => (
                  <li key={i}>
                    <a href={link.url}>{link.label}</a>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <ol className={styles.phases}>
          <span className={styles.progressTrack} aria-hidden="true">
            <span className={styles.progressFill} style={{ transform: `scaleY(${progress})` }} />
          </span>
          {phases.map((phase, i) => (
            <Phase
              key={i}
              phase={phase}
              index={i}
              active={i <= activeIndex}
              withImage={Boolean(phase.image) && i !== borrowed}
            />
          ))}
        </ol>
      </div>
    </section>
  );
}
