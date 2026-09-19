import { Link } from "react-router-dom";
import { mediaUrl } from "../lib/cms";
import styles from "./HistoryMilestones.module.css";

/** Internal routes render as <Link>; anything absolute stays a plain anchor. */
function SmartLink({ label, url, className }) {
  const external = /^https?:\/\//i.test(url || "");
  if (external) {
    return (
      <a className={className} href={url} target="_blank" rel="noreferrer">
        {label}
      </a>
    );
  }
  return (
    <Link className={className} to={url || "/"}>
      {label}
    </Link>
  );
}

/**
 * Dated milestones laid out as bricks: image and copy sit side by side and
 * swap sides row to row. Stacks to a single column below 820px.
 */
export default function HistoryMilestones({ data }) {
  if (!data) return null;
  const { intro = [], quote, milestonesHeading, milestonesSubheading, milestones = [], closing = [], links = [] } = data;

  return (
    <div>
      {intro.length > 0 && (
        <div className={`${styles.prose} ${styles.intro} reveal`}>
          {intro.map((p, i) => (
            <p key={i} className={i === 0 ? styles.lead : undefined}>{p}</p>
          ))}
        </div>
      )}

      {quote?.text && (
        <blockquote className={`${styles.prose} ${styles.quote} reveal`}>
          <p>&ldquo;{quote.text}&rdquo;</p>
          {quote.attribution && <cite>&mdash; {quote.attribution}</cite>}
        </blockquote>
      )}

      {milestonesHeading && milestones.length > 0 && (
        <div className={`${styles.prose} reveal`}>
          <h2 className={styles.heading}>{milestonesHeading}</h2>
          {milestonesSubheading && <p className={styles.subheading}>{milestonesSubheading}</p>}
        </div>
      )}

      {milestones.length > 0 && (
        <div className={styles.bricks}>
          {milestones.map((m, i) => (
            <article
              key={m.year + (m.title || i)}
              className={`${styles.brick} ${i % 2 ? styles.flip : ""} reveal`}
            >
              <div className={styles.media}>
                {m.year && <span className={styles.year}>{m.year}</span>}
                {m.image && <img src={mediaUrl(m.image)} alt="" loading="lazy" />}
              </div>

              <div className={styles.copy}>
                <span className={styles.rule} aria-hidden="true" />
                {m.date && <span className={styles.date}>{m.date}</span>}
                {m.title && <h3 className={styles.title}>{m.title}</h3>}
                {m.body && <p className={styles.body}>{m.body}</p>}

                {m.links?.length > 0 && (
                  <div className={styles.brickLinks}>
                    {m.links.map((l) => (
                      <SmartLink key={l.label} label={l.label} url={l.url} className={styles.chip} />
                    ))}
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>
      )}

      {closing.length > 0 && (
        <div className={`${styles.prose} ${styles.closing} reveal`}>
          {closing.map((p, i) => <p key={i}>{p}</p>)}
        </div>
      )}

      {links.length > 0 && (
        <div className={`${styles.prose} ${styles.links} reveal`}>
          {links.map((l) => (
            <SmartLink key={l.label} label={l.label} url={l.url} className={styles.link} />
          ))}
        </div>
      )}
    </div>
  );
}
