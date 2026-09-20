import { useCallback, useEffect, useRef, useState } from "react";
import { mediaUrl } from "../lib/cms";
import styles from "./HistoryPhases.module.css";

const PLACEHOLDER_IMAGE = "/images/history/2014-programme-launch.jpg";
const EXCERPT_LENGTH = 150;

function phaseText(phase) {
  if (Array.isArray(phase.paras)) return phase.paras;
  if (Array.isArray(phase.body)) return phase.body;
  return phase.body ? [phase.body] : [];
}

// The card shows a short taste of the story; the rest opens in the modal.
function excerpt(text) {
  if (text.length <= EXCERPT_LENGTH) return text;
  return `${text.slice(0, EXCERPT_LENGTH).trimEnd()}…`;
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
        <p>{excerpt(text[0] || "")}</p>
        <button type="button" className={styles.readMore} onClick={() => phase.onReadMore(phase, index)}>
          Read more <span>→</span>
        </button>
      </div>
    </article>
  );
}

export default function HistoryPhases({ data }) {
  const track = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const phases = data?.milestones || [];
  const fallbackImage = phases.find((phase) => phase.image)?.image || data?.heroImage || PLACEHOLDER_IMAGE;

  // The active card is whichever one is nearest the track's centre — measuring
  // real positions (rather than assuming a fixed card width) is what keeps
  // every phase, including the last few, highlighting correctly.
  useEffect(() => {
    const element = track.current;
    if (!element) return undefined;
    let frame = 0;
    const updateActive = () => {
      frame = 0;
      const cards = element.querySelectorAll(`.${styles.phase}`);
      if (!cards.length) return;
      const containerRect = element.getBoundingClientRect();
      const containerCenter = containerRect.left + containerRect.width / 2;
      let closest = 0;
      let closestDistance = Infinity;
      cards.forEach((card, index) => {
        const rect = card.getBoundingClientRect();
        const distance = Math.abs(rect.left + rect.width / 2 - containerCenter);
        if (distance < closestDistance) {
          closestDistance = distance;
          closest = index;
        }
      });
      setActiveIndex(closest);
    };
    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(updateActive);
    };
    updateActive();
    element.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      element.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [phases.length]);

  if (!phases.length) return null;

  const go = useCallback((index) => {
    const element = track.current;
    if (!element) return;
    const cards = element.querySelectorAll(`.${styles.phase}`);
    const card = cards[index];
    if (!card) return;
    const target = card.offsetLeft - (element.clientWidth - card.clientWidth) / 2;
    element.scrollTo({ left: target, behavior: "smooth" });
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
            <Phase key={`${phase.year || "phase"}-${index}`} phase={{ ...phase, onReadMore: (item, itemIndex) => setSelected({ phase: item, index: itemIndex }) }} index={index} image={phase.image || fallbackImage} active={index === activeIndex} />
          ))}
        </div>
      </div>

      <div className={styles.controls}>
        <button type="button" onClick={() => go((activeIndex - 1 + phases.length) % phases.length)} aria-label="Previous history phase">←</button>
        <div className={styles.dots}>
          {phases.map((phase, index) => <button key={index} type="button" className={index === activeIndex ? styles.dotActive : ""} onClick={() => go(index)} aria-label={`Show phase ${index + 1}`} />)}
        </div>
        <button type="button" onClick={() => go((activeIndex + 1) % phases.length)} aria-label="Next history phase">→</button>
      </div>

      {selected && (
        <div className={styles.modalBackdrop} role="presentation" onMouseDown={(event) => event.target === event.currentTarget && setSelected(null)}>
          <article className={styles.modal} role="dialog" aria-modal="true" aria-label={`Phase ${selected.index + 1} details`}>
            <button type="button" className={styles.modalClose} onClick={() => setSelected(null)} aria-label="Close phase details">×</button>
            <span className={styles.modalNumber}>Phase {String(selected.index + 1).padStart(2, "0")}</span>
            <h3>{selected.phase.title || selected.phase.year || `Phase ${selected.index + 1}`}</h3>
            {phaseText(selected.phase).map((paragraph, index) => <p key={index}>{paragraph}</p>)}
          </article>
        </div>
      )}

    </section>
  );
}
