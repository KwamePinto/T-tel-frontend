import styles from "./SectionIntro.module.css";

// Eyebrow + big display heading on the left, lead paragraph + body on the right.
// `accent` renders as the green-highlighted part of the heading.
//
// `stacked` drops the second column and puts the lead directly under the
// heading. The people directories use it: a line like "The founding members of
// T-TEL" belongs to the heading above it, and set off to the side at the same
// weight it read as a stray paragraph.
export default function SectionIntro({ eyebrow, title, accent, lead, children, rule = true, stacked = false }) {
  return (
    <div className={styles.wrap}>
      <div className={`${styles.grid} ${stacked ? styles.stacked : ""} container`}>
        <div className="reveal">
          {eyebrow && <span className="eyebrow">{eyebrow}</span>}
          <h2 className={styles.title}>
            {title} {accent && <em>{accent}</em>}
          </h2>
        </div>
        <div className="reveal" data-delay="1">
          {lead && <p className={styles.lead}>{lead}</p>}
          {children}
        </div>
      </div>
      {rule && (
        <div className="container">
          <hr className={styles.rule} />
        </div>
      )}
    </div>
  );
}
