import Icon from "./Icon";
import { mediaUrl } from "../lib/cms";
import styles from "./DocumentCard.module.css";
import { t } from "../i18n";

/**
 * A document, shown as its cover with whatever caption the caller passes in
 * as children (a title, a size, a description — each page has its own).
 * Nothing on the card is a button at rest: the whole thing dims under a
 * single "Read" label the moment a cursor or keyboard focus lands anywhere
 * on it, and that's the only control there is. Downloading happens once the
 * document is open, from inside the preview — this card only ever reads.
 *
 * `aspectRatio` shapes the cover — a Knowledge Hub document is a portrait
 * book cover ("3 / 4"), a policy is a wide banner ("16 / 10"). `mediaClassName`
 * is for a page whose image carries its own border and corners rather than
 * sharing the whole card's — the Knowledge Hub frames the picture on its own
 * and leaves the title sitting on the plain page beneath it; a policy's
 * outer card already has one border and shadow around everything, so its
 * image needs none of its own. Everything else about the interaction is
 * identical wherever this is used.
 */
export default function DocumentCard({
  doc, onOpen, aspectRatio = "3 / 4", className = "", mediaClassName = "", children,
}) {
  const hasFile = Boolean(doc.file?.url);

  return (
    <div className={`${styles.wrap} ${className}`}>
      <div className={`${styles.media} ${mediaClassName}`} style={{ aspectRatio }}>
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
      </div>

      {children}

      <button
        type="button"
        className={styles.readOverlay}
        onClick={onOpen}
        disabled={!hasFile}
        aria-label={`${t("Read")} ${doc.title}`}
      >
        <span className={styles.readLabel}>
          <Icon name="eye" size={20} />
          {t("Read")}
        </span>
      </button>
    </div>
  );
}
