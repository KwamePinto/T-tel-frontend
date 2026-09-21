import e from "../styles/editorial.module.css";
import styles from "./HistoryStory.module.css";

/**
 * The opening half of Our History: a heading that stays put on the left while
 * the account of how T-TEL came about scrolls past it on the right.
 *
 * Pinning the heading is what makes a long read feel like one piece rather
 * than a wall — the reader keeps the thing they are reading about in view the
 * whole way down. It unpins itself below the two-column breakpoint, where
 * there is no second column for it to sit beside.
 */
export default function HistoryStory({ data }) {
  if (!data) return null;
  const {
    eyebrow, heading, subheading, lead, paras = [], quote, quoteAttrib, stats = [],
  } = data;

  if (!heading && !lead && !paras.length) return null;

  return (
    <section className={styles.story}>
      <div className={`container ${styles.grid}`}>
        <div className={styles.aside}>
          {/* the sticky element is this inner box, not the grid cell: a grid
              item stretches to the full row height, so pinning it would have
              nothing left to travel */}
          <div className={styles.pinned}>
            {eyebrow && <span className={e.eyebrow}>{eyebrow}</span>}
            {heading && <h2 className={e.display}>{heading}</h2>}
            {subheading && <p className={styles.sub}>{subheading}</p>}

            {stats.length > 0 && (
              <div className={e.stats}>
                {stats.map((stat, i) => (
                  <div key={i}>
                    <span className={e.statValue}>{stat.value}</span>
                    <span className={e.statLabel}>{stat.label}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className={`${styles.main} reveal`}>
          {lead && <p className={e.lead}>{lead}</p>}
          <hr className={e.rule} />

          <div className={e.body}>
            {paras.map((para, i) => (
              // The drop cap goes on the opening paragraph only, and only once
              // it runs past a line — a one-line paragraph would leave the cap
              // hanging over nothing. The bar is set at roughly two lines for
              // this column, so the account's own opening line gets it.
              <p key={i} className={i === 0 && para.length > 100 ? e.dropCap : undefined}>
                {para}
              </p>
            ))}
          </div>

          {quote && (
            <blockquote className={e.quote}>
              {quote}
              {quoteAttrib && <span className={e.quoteAttrib}>{quoteAttrib}</span>}
            </blockquote>
          )}
        </div>
      </div>
    </section>
  );
}
