import Icon from "./Icon";
import { mediaUrl } from "../lib/cms";
import styles from "./DocumentCover.module.css";
import { t } from "../i18n";

/**
 * A document's thumbnail as its own "Read" control: the cover sits still
 * until hovered (or focused), when a label slides up from underneath it —
 * the same affordance the Knowledge Hub uses, shared here so anywhere else
 * that lists documents (Our Policies included) opens them the same way
 * rather than reinventing a static button beside the image.
 *
 * Layout (aspect ratio, border, corners) is deliberately left to the caller
 * via `className` — a Knowledge Hub card is a portrait cover, a policy card
 * is a wide banner, and this component only owns the interaction, not the
 * shape it happens in.
 */
export default function DocumentCover({ doc, onOpen, className = "", label }) {
  const readLabel = label || t("Read");
  const hasFile = Boolean(doc.file?.url);

  return (
    <button
      type="button"
      className={`${styles.cover} ${className}`}
      onClick={onOpen}
      disabled={!hasFile}
      aria-label={`${readLabel} ${doc.title}`}
    >
      {doc.thumbnail?.url ? (
        <img
          src={mediaUrl(doc.thumbnail)}
          alt=""
          loading="lazy"
          decoding="async"
          width="480"
          height="640"
        />
      ) : (
        <span className={styles.fallback}>{t("PDF")}</span>
      )}
      <span className={styles.overlay}>
        <Icon name="eye" size={20} />
        {readLabel}
      </span>
    </button>
  );
}
