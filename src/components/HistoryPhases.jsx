import { Link } from "react-router-dom";
import { mediaUrl } from "../lib/cms";
import styles from "./HistoryPhases.module.css";

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
 * Our History as the reference site lays it out: a snaking bracket.
 *
 * Every phase spans the full width. A rule runs down one side and along the
 * bottom, and the side alternates, so the two rules join into a single line
 * that zigzags down the page. The numbered badge sits on the ruled edge,
 * centred against the height of its own phase. The last phase drops its
 * bottom rule so the line ends rather than closing a box.
 */
export default function HistoryPhases({ data }) {
  if (!data) return null;
  const { intro = [], milestones = [], links = [] } = data;

  return (
    <>
      {intro.length > 0 && (
        <div className={`${styles.intro} reveal`}>
          {intro.map((para, i) => <p key={i}>{para}</p>)}
        </div>
      )}

      <div className={styles.timeline}>
        {milestones.map((phase, i) => {
          const last = i === milestones.length - 1;
          const image = mediaUrl(phase.image);

          return (
            <div
              key={phase.step ?? i}
              className={[
                styles.entry,
                i % 2 ? styles.right : styles.left,
                last ? styles.last : "",
                "reveal",
              ].filter(Boolean).join(" ")}
            >
              <span className={styles.badge} aria-hidden="true">{phase.step ?? i + 1}</span>

              <div className={styles.body}>
                <h2 className={styles.title}>{phase.title}</h2>

                {image && (
                  <img
                    className={styles.photo}
                    src={image}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    width={phase.imageWidth || undefined}
                    height={phase.imageHeight || undefined}
                  />
                )}

                {(phase.paras || []).map((para, n) => (
                  <p key={n} className={styles.para}>{para}</p>
                ))}
              </div>
            </div>
          );
        })}
      </div>

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
