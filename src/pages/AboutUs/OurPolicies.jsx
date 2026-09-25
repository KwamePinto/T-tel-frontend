import { useState } from "react";
import CmsHero from "../../components/CmsHero";
import Seo from "../../components/Seo";
import Icon from "../../components/Icon";
import PdfPreview, { openPreview } from "../../components/PdfPreview";
import { CardsLoading, ErrorState, EmptyState } from "../../components/States";
import { cms, mediaUrl } from "../../lib/cms";
import { useCms } from "../../hooks/useCms";
import styles from "./OurPolicies.module.css";
import { t } from "../../i18n";

const formatSize = (bytes) => {
  if (!bytes) return "";
  const mb = bytes / 1024 / 1024;
  return mb >= 1 ? `${mb.toFixed(1)} MB` : `${Math.round(bytes / 1024)} KB`;
};

export default function OurPolicies() {
  const { data, loading, error, reload } = useCms(
    () => cms.documents({ collection: "policies", limit: 50 }),
    [],
  );
  const items = data?.items ?? [];
  const [reading, setReading] = useState(null);

  // Downloading happens from inside the opened preview; there is no separate
  // download control on the card.
  async function handleDownload(doc) {
    try {
      const { url } = await cms.trackDownload(doc._id);
      if (url) window.open(mediaUrl(url), "_blank", "noopener");
    } catch {
      if (doc.file?.url) window.open(mediaUrl(doc.file), "_blank", "noopener");
    }
  }

  const preview = (doc) => openPreview(doc, setReading);

  return (
    <>
      <Seo title={t("Our Policies")} description="T-TEL's governing policies on safeguarding, harassment, conflict of interest, intellectual property and inclusion." />
      <CmsHero slug="about-us/our-policies" title={t("Our Policies")} crumb={t("Our Policies")} image="/images/focus/library-review.jpg" />

      <section className="section">
        <div className="container">
          <div className={`${styles.intro} reveal`}>
            <span className="eyebrow">{t("Governance")}</span>
            <h2>{t("Our governing policies")}</h2>
            <p className="lede">
              The protocols and standards that ensure our work is transparent, safe and accountable.
              These are reviewed regularly by the T-TEL Board.
            </p>
          </div>

          {loading && <CardsLoading count={6} />}
          {error && <ErrorState error={error} onRetry={reload} label={t("policies")} />}
          {!loading && !error && !items.length && (
            <EmptyState>{t("Policy documents will appear here once they are published.")}</EmptyState>
          )}

          <div className={styles.grid}>
            {items.map((policy, i) => (
              <article key={policy._id} className={`${styles.card} reveal`} data-delay={String(i % 3)}>
                <button
                  type="button"
                  className={styles.thumb}
                  onClick={() => preview(policy)}
                  disabled={!policy.file?.url}
                  aria-label={`${t("Read")} ${policy.title}`}
                >
                  {policy.thumbnail?.url ? (
                    <img src={mediaUrl(policy.thumbnail)} alt="" loading="lazy" />
                  ) : (
                    <span className={styles.thumbFallback}>
                      {policy.file?.mime === "application/pdf" ? "PDF" : "FILE"}
                    </span>
                  )}
                  <span className={styles.pill}>
                    <b>{policy.file?.mime === "application/pdf" ? "PDF" : "FILE"}</b>
                    <i>{formatSize(policy.file?.size)}</i>
                  </span>
                </button>

                <div className={styles.body}>
                  <span className={styles.meta}>
                    Updated{" "}
                    {new Date(policy.updatedAt).toLocaleDateString("en-GB", {
                      month: "short", year: "numeric",
                    })}
                  </span>
                  <h3>{policy.title}</h3>
                  <p>{policy.description}</p>
                </div>

                {/* Hidden until the card is hovered or focused, then slides up
                    from the card's own base — not the thumbnail's. */}
                <button
                  type="button"
                  className={styles.readOverlay}
                  onClick={() => preview(policy)}
                  disabled={!policy.file?.url}
                  aria-label={`${t("Read")} ${policy.title}`}
                >
                  <Icon name="eye" size={15} />
                  {t("Read")}
                </button>
              </article>
            ))}
          </div>
        </div>
      </section>

      <PdfPreview doc={reading} onClose={() => setReading(null)} onDownload={handleDownload} />
    </>
  );
}
