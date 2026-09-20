import { useCallback, useEffect, useRef, useState } from "react";
import { mediaUrl } from "../lib/cms";
import styles from "./HistoryPhases.module.css";

const PLACEHOLDER_IMAGE = "/images/history/2014-programme-launch.jpg";

function phaseText(phase) {
  if (Array.isArray(phase.paras)) return phase.paras;
  if (Array.isArray(phase.body)) return phase.body;
  return phase.body ? [phase.body] : [];
}

function Phase({ phase, index, image, active }) {
  const text = phaseText(phase);
  const heading = /^\s*phase\s*\d+\s*$/i.test(phase.title || "") ? "" : phase.title;
  return (
    <article className={`${styles.phase} ${active ? styles.active : ""}`}>
      <span className={styles.phaseNumber}>{String(index + 1).padStart(2, "0")}</span>
      <figure className={styles.phaseMedia}>
        <img src={mediaUrl(image)} alt={phase.title || `History phase ${index + 1}`} loading={index < 2 ? "eager" : "lazy"} />
      </figure>
      <div className={styles.phaseCopy}>
        <span className={styles.step}>Phase {String(index + 1).padStart(2, "0")}</span>
        <h3>{heading || phase.year || `Phase ${index + 1}`}</h3>
        <p>{text[0] || ""}</p>
      </div>
    </article>
  );
}

export default function HistoryPhases({ data }) {
  const track = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const phases = data?.milestones || [];
  const fallbackImage = phases.find((phase) => phase.image)?.image || data?.heroImage || PLACEHOLDER_IMAGE;

  useEffect(() => {
    const element = track.current;
    if (!element) return undefined;
    const onScroll = () => {
      const card = element.querySelector(`.${styles.phase}`);
      const gap = parseFloat(getComputedStyle(element).gap) || 0;
      const page = card ? Math.round(element.scrollLeft / (card.getBoundingClientRect().width + gap)) : 0;
      setActiveIndex(Math.max(0, Math.min(phases.length - 1, page)));
    };
    element.addEventListener("scroll", onScroll, { passive: true });
    return () => element.removeEventListener("scroll", onScroll);
  }, [phases.length]);

  if (!phases.length) return null;

  const go = useCallback((index) => {
    const element = track.current;
    if (!element) return;
    const card = element.querySelector(`.${styles.phase}`);
    const gap = parseFloat(getComputedStyle(element).gap) || 0;
    if (!card) return;
    element.scrollTo({ left: index * (card.getBoundingClientRect().width + gap), behavior: "smooth" });
    setActiveIndex(index);
  }, []);

  return (
    <section className={styles.wrap}>
      <div className={styles.headingWrap}>
        <span>{data?.timelineEyebrow || "The roadmap"}</span>
        <h2>{data?.timelineHeading || data?.milestonesHeading || "From project to national institution"}</h2>
      </div>

      <div className={styles.timelineShell}>
        <div className={styles.track} ref={track} role="region" aria-label="Our History timeline" tabIndex="0">
          {phases.map((phase, index) => (
            <Phase key={`${phase.year || "phase"}-${index}`} phase={phase} index={index} image={phase.image || fallbackImage} active={index === activeIndex} />
          ))}
        </div>
        <div className={styles.rail} aria-hidden="true"><span style={{ width: `${((activeIndex + 1) / phases.length) * 100}%` }} /></div>
      </div>

      <div className={styles.controls}>
        <button type="button" onClick={() => go((activeIndex - 1 + phases.length) % phases.length)} aria-label="Previous history phase">←</button>
        <div className={styles.dots}>
          {phases.map((phase, index) => <button key={index} type="button" className={index === activeIndex ? styles.dotActive : ""} onClick={() => go(index)} aria-label={`Show phase ${index + 1}`} />)}
        </div>
        <button type="button" onClick={() => go((activeIndex + 1) % phases.length)} aria-label="Next history phase">→</button>
      </div>

    </section>
  );
}
