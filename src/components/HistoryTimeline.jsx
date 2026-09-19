import { useState } from "react";
import { Link } from "react-router-dom";
import styles from "./HistoryTimeline.module.css";

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
  return <Link className={className} to={url || "/"}>{label}</Link>;
}

/**
 * The history as a phased timeline: a rail down the middle, numbered steps,
 * entries alternating left and right.
 *
 * At rest an entry shows its year, title and a one-line summary. Pointing at
 * it — or moving to it with the keyboard — opens the photograph and the full
 * account beneath.
 *
 * The open state is deliberately not hover-only. Hover cannot be reached by a
 * keyboard, and does not exist on a touchscreen, so the entry is a <button>
 * that also opens on focus and on tap, and the pointer is only one of the ways
 * in. On a narrow screen every entry is open from the start, because hiding
 * half the page behind a gesture phones do not really have would just lose it.
 */
export default function HistoryTimeline({ data }) {
  if (!data) return null;
  const {
    intro = [],
    quote,
    milestonesHeading,
    milestonesSubheading,
    milestones = [],
    closing = [],
    links = [],
  } = data;

  const [openStep, setOpenStep] = useState(null);

  return (
    <>
      {intro.length > 0 && (
        <div className={`${styles.intro} reveal`}>
          {intro.map((para, i) => (
            <p key={i} className={i === 0 ? styles.lead : undefined}>{para}</p>
          ))}
        </div>
      )}

      {quote && (
        <blockquote className={`${styles.quote} reveal`}>
          <p>{quote.text || quote}</p>
          {quote.attribution && <cite>{quote.attribution}</cite>}
        </blockquote>
      )}

      {(milestonesHeading || milestonesSubheading) && (
        <div className={`${styles.heading} reveal`}>
          {milestonesHeading && <h2>{milestonesHeading}</h2>}
          {milestonesSubheading && <p>{milestonesSubheading}</p>}
        </div>
      )}

      {/*
        Closing happens when the pointer leaves the whole list, not when it
        leaves one entry. Per-entry closing collapses the one you are moving
        away from while you are still between the two, which drags everything
        below it upwards and out from under the cursor — you end up on the
        wrong entry, or on none. Handing the open state straight from one
        entry to the next keeps the movement predictable.
      */}
      <ol className={styles.timeline} onMouseLeave={() => setOpenStep(null)}>
        {milestones.map((m, i) => {
          const step = m.step ?? i + 1;
          const open = openStep === step;
          const body = Array.isArray(m.body) ? m.body : [m.body].filter(Boolean);

          return (
            <li
              key={step}
              /**
               * className must not change with the open state. The scroll
               * reveal marks this element by adding a class straight to the
               * DOM node; if React rewrites className afterwards it strips
               * that mark off again and the entry fades back to nothing —
               * which looked like hovering made the content disappear.
               * The open state travels as an attribute instead, which React
               * updates without touching the class list.
               */
              className={`${styles.entry} ${i % 2 ? styles.right : styles.left} reveal`}
              data-open={open ? "true" : "false"}
              onMouseEnter={() => setOpenStep(step)}
            >
              <span className={styles.badge} aria-hidden="true">{step}</span>

              <button
                type="button"
                className={styles.card}
                aria-expanded={open}
                onFocus={() => setOpenStep(step)}
                onClick={() => setOpenStep((s) => (s === step ? null : step))}
              >
                <span className={styles.year}>{m.year}</span>
                <span className={styles.title}>{m.title}</span>
                {m.summary && <span className={styles.summary}>{m.summary}</span>}

                <span className={styles.more} aria-hidden="true">
                  {open ? "Less" : "More"}
                </span>

                {/* Always rendered, revealed by a grid-rows transition, so the
                    text is in the document for search engines and for anyone
                    reading with assistive technology. */}
                <span className={styles.reveal} data-open={open ? "true" : "false"}>
                  <span className={styles.revealInner}>
                    {m.image && (
                      <img
                        className={styles.photo}
                        src={m.image}
                        alt=""
                        loading="lazy"
                        decoding="async"
                      />
                    )}
                    {body.map((para, n) => (
                      <span key={n} className={styles.para}>{para}</span>
                    ))}
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ol>

      {closing.length > 0 && (
        <div className={`${styles.closing} reveal`}>
          {closing.map((para, i) => <p key={i}>{para}</p>)}
        </div>
      )}

      {links.length > 0 && (
        <div className={`${styles.links} reveal`}>
          {links.map((l, i) => (
            <SmartLink key={i} label={l.label} url={l.url} className={styles.link} />
          ))}
        </div>
      )}
    </>
  );
}
