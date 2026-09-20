import { mediaUrl } from "../lib/cms";
import e from "../styles/editorial.module.css";
import styles from "./HistoryPhases.module.css";

/**
 * The roadmap half of Our History: phases running down a single line, each one
 * taking the side opposite the last.
 *
 * A phase with no picture simply leaves its other side empty rather than
 * falling back to a placeholder — most of T-TEL's phases are text, and an
 * invented image would say less than the white space does. A phase given a
 * `year` is treated as the arrival the line has been building towards and is
 * set across the full width, which is why it reads as an ending rather than
 * as a sixth entry.
 */
function Phase({ phase, index }) {
  const { title, paras = [], image, year } = phase;
  const flip = index % 2 === 1;
  // "Phase 3" as a title just repeats the numbered label above it. Titles were
  // optional in the layout this replaced, so most phases still carry the
  // placeholder; a real one typed in the admin renders normally.
  const heading = /^\s*phase\s*\d+\s*$/i.test(title || "") ? null : title;

  if (year) {
    return (
      <li className={`${styles.row} ${styles.climax} reveal`}>
        <span className={styles.node} aria-hidden="true" />
        <div className={styles.climaxInner}>
          <span className={styles.year}>{year}</span>
          {heading && <h3 className={`${e.displaySm} ${styles.title}`}>{heading}</h3>}
          {paras.map((para, i) => <p key={i} className={styles.para}>{para}</p>)}
        </div>
      </li>
    );
  }

  return (
    <li className={`${styles.row} ${flip ? styles.flip : ""} reveal`}>
      <span className={styles.node} aria-hidden="true" />

      <div className={styles.text}>
        <span className={`${e.eyebrow} ${e.eyebrowMuted} ${styles.step}`}>
          Phase {String(index + 1).padStart(2, "0")}
        </span>
        {heading && <h3 className={`${e.displaySm} ${styles.title}`}>{heading}</h3>}
        {paras.map((para, i) => <p key={i} className={styles.para}>{para}</p>)}
      </div>

      {image && (
        <div className={styles.media}>
          <img src={mediaUrl(image)} alt={title || ""} loading="lazy" />
        </div>
      )}
    </li>
  );
}

export default function HistoryPhases({ data }) {
  const phases = data?.milestones || [];
  const links = data?.links || [];
  if (!phases.length) return null;

  return (
    <section className={styles.wrap}>
      <div className="container">
        {data?.timelineEyebrow && (
          <span className={`${e.eyebrow} ${e.eyebrowMuted} ${styles.head}`}>
            {data.timelineEyebrow}
          </span>
        )}
        {data?.timelineHeading && (
          <h2 className={`${e.display} ${styles.headTitle} reveal`}>{data.timelineHeading}</h2>
        )}

        <ol className={styles.timeline}>
          {phases.map((phase, i) => <Phase key={i} phase={phase} index={i} />)}
        </ol>

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
    </section>
  );
}
