import { useEffect, useRef } from "react";
import Icon from "./Icon";
import { mediaUrl } from "../lib/cms";
import styles from "./TeamModal.module.css";
import { t } from "../i18n";

/** Bios arrive either as editor HTML or as plain text with blank lines. */
function Bio({ text }) {
  if (!text) return null;
  if (/<[a-z][\s\S]*>/i.test(text)) {
    return <div className={styles.bio} dangerouslySetInnerHTML={{ __html: text }} />;
  }
  return (
    <div className={styles.bio}>
      {text.split(/\n\s*\n/).filter(Boolean).map((para, i) => <p key={i}>{para}</p>)}
    </div>
  );
}

export default function TeamModal({ person, onClose, imageFit = "cover" }) {
  const panel = useRef(null);

  // The caller renders this component all the time and passes person=null when
  // nothing is selected, so the effect must do nothing until there is someone
  // to show — an early `return null` below would not save us, because hooks run
  // on every render regardless of what the component returns.
  //
  // onClose is also a fresh arrow on each render, so depending on it would
  // re-run this every time and re-capture an already-locked body as the state
  // to restore. A ref keeps the latest handler without retriggering.
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  useEffect(() => {
    if (!person) return undefined;

    const onKey = (e) => e.key === "Escape" && closeRef.current();
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    panel.current?.focus();

    return () => {
      window.removeEventListener("keydown", onKey);
      // back to the stylesheet's value rather than a captured one, which could
      // itself have been "hidden" if anything else had locked scrolling
      document.body.style.overflow = "";
    };
  }, [person]);

  if (!person) return null;

  // photo is a populated media record, not a string — passing the object
  // straight to src is what left every portrait blank
  const photo = mediaUrl(person.photo);

  return (
    <div className={styles.overlay} onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div
        className={`${styles.modal} ${imageFit === "contain" ? styles.partner : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label={person.name}
        tabIndex={-1}
        ref={panel}
      >
        <button className={styles.close} onClick={onClose} aria-label={t("Close")}>
          <Icon name="close" size={20} />
        </button>

        <div className={`${styles.media} ${imageFit === "contain" ? styles.contain : ""}`}>
          {photo ? (
            <img src={photo} alt={person.name} />
          ) : (
            <span className={styles.initials} aria-hidden="true">
              {person.name?.split(/\s+/).slice(0, 2).map((w) => w[0]).join("")}
            </span>
          )}
        </div>

        <div className={styles.body}>
          {/* Who this is stays put; only the biography scrolls under it. */}
          <div className={styles.head}>
            <span className={styles.rule} aria-hidden="true" />
            <h3 className={styles.name}>{person.name}</h3>
            {/* role and group share a line where they fit, and wrap onto their
                own when they don't — a row saved here is a row of biography */}
            {(person.position || person.group?.name) && (
              <div className={styles.meta}>
                {person.position && <p className={styles.position}>{person.position}</p>}
                {person.group?.name && <span className={styles.group}>{person.group.name}</span>}
              </div>
            )}
          </div>

          <div className={styles.scroll}>
          <Bio text={person.bio} />

          {(person.email || person.linkedin) && (
            <div className={styles.links}>
              {person.email && (
                <a href={`mailto:${person.email}`} className={styles.link}>
                  <Icon name="mail" size={16} />
                  {person.email}
                </a>
              )}
              {person.linkedin && (
                <a href={person.linkedin} target="_blank" rel="noreferrer" className={styles.link}>
                  <Icon name="linkedin" size={16} />
                  {t("LinkedIn")}
                </a>
              )}
            </div>
          )}
          </div>
        </div>
      </div>
    </div>
  );
}
