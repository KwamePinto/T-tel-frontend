import { mediaUrl } from "../lib/cms";
import prose from "../pages/ArticleDetail.module.css";
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
export default function PageSections({ sections }) {
  if (!sections?.length) return null;

  return (
    <div className={styles.sections}>
      {sections.map((section, i) => {
        const key = `${section.type}-${i}`;
        const img = mediaUrl(section.image);

        if (section.type === "image") {
          if (!img) return null;
          return (
            <figure key={key} className={`${styles.figure} reveal`}>
              <img src={img} alt={section.image?.alt || ""} loading="lazy" decoding="async" />
            </figure>
          );
        }

        if (section.type === "split") {
          return (
            <div key={key} className={`${styles.split} ${section.flip ? styles.flip : ""} reveal`}>
              {img && (
                <figure className={styles.splitMedia}>
                  <img src={img} alt={section.image?.alt || ""} loading="lazy" decoding="async" />
                </figure>
              )}
              <div
                className={`${styles.splitCopy} ${prose.prose}`}
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
            className={`${prose.prose} reveal`}
            dangerouslySetInnerHTML={{ __html: section.html }}
          />
        );
      })}
    </div>
  );
}
