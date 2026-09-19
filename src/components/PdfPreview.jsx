import { useEffect, useRef, useState } from "react";
import Icon from "./Icon";
import { cms } from "../lib/cms";
import styles from "./PdfPreview.module.css";

/**
 * Reads a published PDF without leaving the site.
 *
 * The heavy lifting is the browser's own PDF viewer, loaded in an iframe: it
 * fetches the file by ranges, so page one of a 150MB manual paints without
 * pulling the other 149MB. Bundling a JavaScript renderer instead would mean
 * shipping a few hundred KB to every visitor to do a worse job of it.
 */

/** iOS never embeds a PDF properly — it shows page one and stops scrolling. */
const isIOS = () =>
  typeof navigator !== "undefined" &&
  (/iPad|iPhone|iPod/.test(navigator.userAgent) ||
    // iPadOS reports itself as a Mac, so the touch points are the giveaway
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1));

function fileSize(bytes) {
  if (!bytes) return "";
  const mb = bytes / 1024 / 1024;
  return mb >= 1 ? `${mb.toFixed(1)}MB` : `${Math.round(bytes / 1024)}KB`;
}

export default function PdfPreview({ doc, onClose, onDownload }) {
  const panel = useRef(null);
  const [ready, setReady] = useState(false);

  // The parent keeps this mounted and passes doc=null when nothing is open, so
  // every effect has to no-op until there is something to show. onClose is a
  // fresh arrow each render; a ref keeps the latest one without re-running.
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  useEffect(() => {
    if (!doc) return undefined;
    setReady(false);

    const onKey = (e) => e.key === "Escape" && closeRef.current();
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    panel.current?.focus();

    // Belt and braces for the spinner. An iframe showing a PDF fires load in
    // every browser we target, but a plugin viewer that stays silent would
    // otherwise leave this overlay sitting on top of a perfectly good
    // document forever. Clearing it on a timer costs nothing if load arrives.
    const settle = setTimeout(() => setReady(true), 8000);

    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      clearTimeout(settle);
    };
  }, [doc]);

  if (!doc) return null;

  const src = cms.previewUrl(doc._id);
  const meta = [doc.year, fileSize(doc.file?.size)].filter(Boolean).join(" · ");

  return (
    <div
      className={styles.overlay}
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-label={`Preview of ${doc.title}`}
        tabIndex={-1}
        ref={panel}
      >
        <header className={styles.bar}>
          <div className={styles.heading}>
            <h2 className={styles.title} title={doc.title}>{doc.title}</h2>
            {meta && <p className={styles.meta}>{meta}</p>}
          </div>

          <div className={styles.actions}>
            <button
              type="button"
              className={styles.action}
              onClick={() => onDownload?.(doc)}
            >
              <Icon name="download" size={16} />
              <span>Download</span>
            </button>
            <a
              className={styles.action}
              href={src}
              target="_blank"
              rel="noreferrer"
            >
              <Icon name="external" size={16} />
              <span>New tab</span>
            </a>
            <button
              type="button"
              className={styles.close}
              onClick={onClose}
              aria-label="Close preview"
            >
              <Icon name="close" size={20} />
            </button>
          </div>
        </header>

        <div className={styles.frame}>
          {!ready && (
            <div className={styles.loading} aria-live="polite">
              <span className={styles.spinner} aria-hidden="true" />
              Loading document…
            </div>
          )}
          <iframe
            src={src}
            title={doc.title}
            className={styles.viewer}
            onLoad={() => setReady(true)}
          />
        </div>
      </div>
    </div>
  );
}

/**
 * Decides how a document should open. On iOS the embedded viewer does not
 * work, so the browser's own full-screen one is the better answer; everywhere
 * else the caller gets to show the modal.
 */
export function openPreview(doc, show) {
  if (isIOS()) {
    window.open(cms.previewUrl(doc._id), "_blank", "noopener");
    return;
  }
  show(doc);
}
