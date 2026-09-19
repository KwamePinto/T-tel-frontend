import styles from "./SectionIntro.module.css";

// Eyebrow + big display heading on the left, lead paragraph + body on the right.
// `accent` renders as the green-highlighted part of the heading.
export default function SectionIntro({ eyebrow, title, accent, lead, children, rule = true }) {
  return (
    <div className={styles.wrap}>
      <div className={`${styles.grid} container`}>
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
