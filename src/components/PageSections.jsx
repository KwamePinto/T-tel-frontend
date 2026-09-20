import { mediaUrl } from "../lib/cms";
import prose from "../pages/ArticleDetail.module.css";
import e from "../styles/editorial.module.css";
import styles from "./PageSections.module.css";

/**
 * Renders the laid-out content on Focus Area and Programme pages.
 *
 * Four block types, matching the Post model:
 *   prose   a column of rich text
 *   split   image one side, copy the other, alternating down the page
 *   image   a full-width figure
 *   facts   a narrow panel of project details beside the narrative
 *
 * Returns null when a post has no sections, so the caller can fall back to
 * rendering `body` — which is what every Blog post and every page written
 * before this existed still does.
 */
export default function PageSections({ sections, variant }) {
  if (!sections?.length) return null;

  // In "column" the blocks run inside a reading column beside a pinned panel,
  // so a split lays its picture across the full measure between the
  // paragraphs rather than beside them — which is what "images placed between
  // the text" means once there is no room for a second column inside one.
  const column = variant === "column";
  // The first run of text carries the large initial, and only that one — but
  // not when it opens with a bold label like "Introduction", where the cap
  // would land on the label rather than on the prose and read as a mistake.
  const firstProse = sections.findIndex(
    (sec) =>
      (sec.type === "prose" || sec.type === "split") &&
      sec.html &&
      !/^\s*<p>\s*<strong>/i.test(sec.html),
  );

  return (
    <div className={styles.sections}>
      {sections.map((section, i) => {
        const key = `${section.type}-${i}`;
        const img = mediaUrl(section.image);

        if (section.type === "image") {
          if (!img) return null;
          return (
            <figure key={key} className={`${styles.figure} reveal`}>
              <img
                src={img}
                alt={section.image?.alt || ""}
                loading="lazy"
                decoding="async"
                /* the real pixel size, so the browser reserves the right box
                   and the page stops jumping as pictures arrive */
                width={section.image?.width || undefined}
                height={section.image?.height || undefined}
              />
              {section.image?.caption && (
                <figcaption className={styles.caption}>{section.image.caption}</figcaption>
              )}
            </figure>
          );
        }

        if (section.type === "split") {
          return (
            <div
              key={key}
              className={`${styles.split} ${column ? styles.stacked : ""} ${section.flip && !column ? styles.flip : ""} reveal`}
            >
              {img && (
                <figure className={styles.splitMedia}>
                  <img
                    src={img}
                    alt={section.image?.alt || ""}
                    loading="lazy"
                    decoding="async"
                    width={section.image?.width || undefined}
                    height={section.image?.height || undefined}
                  />
                  {section.image?.caption && (
                    <figcaption className={styles.caption}>{section.image.caption}</figcaption>
                  )}
                </figure>
              )}
              <div
                className={`${styles.splitCopy} ${prose.prose} ${column && i === firstProse ? e.dropCap : ""}`}
                dangerouslySetInnerHTML={{ __html: section.html }}
              />
            </div>
          );
        }

        if (section.type === "facts") {
          return (
            <div key={key} className={`${styles.facts} reveal`}>
              <aside
                className={styles.factsPanel}
                dangerouslySetInnerHTML={{ __html: section.aside }}
              />
              <div className={prose.prose} dangerouslySetInnerHTML={{ __html: section.html }} />
            </div>
          );
        }

        return (
          <div
            key={key}
            className={`${prose.prose} ${column && i === firstProse ? e.dropCap : ""} reveal`}
            dangerouslySetInnerHTML={{ __html: section.html }}
          />
        );
      })}
    </div>
  );
}
