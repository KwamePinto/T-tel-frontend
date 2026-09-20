import { useState } from "react";
import CmsHero from "../../components/CmsHero";
import Seo from "../../components/Seo";
import Icon from "../../components/Icon";
import PdfPreview, { openPreview } from "../../components/PdfPreview";
import { CardsLoading, ErrorState, EmptyState } from "../../components/States";
import { cms, mediaUrl } from "../../lib/cms";
import { useCms } from "../../hooks/useCms";
import styles from "./OurPolicies.module.css";

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

  async function handleDownload(doc) {
    try {
      const { url } = await cms.trackDownload(doc._id);
      if (url) window.open(mediaUrl(url), "_blank", "noopener");
    } catch {
      if (doc.file?.url) window.open(mediaUrl(doc.file), "_blank", "noopener");
    }
  }

  // reading and saving stay separate, so the download figures keep their meaning
  const preview = (doc) => openPreview(doc, setReading);

  return (
    <>
      <Seo title="Our Policies" description="T-TEL's governing policies on safeguarding, harassment, conflict of interest, intellectual property and inclusion." />
      <CmsHero slug="about-us/our-policies" title="Our Policies" crumb="Our Policies" image="/images/focus/library-review.jpg" />

      <section className="section">
        <div className="container">
          <div className={`${styles.intro} reveal`}>
            <span className="eyebrow">Governance</span>
            <h2>Our governing policies</h2>
            <p className="lede">
              The protocols and standards that ensure our work is transparent, safe and accountable.
              These are reviewed regularly by the T-TEL Board.
            </p>
          </div>

          {loading && <CardsLoading count={6} />}
          {error && <ErrorState error={error} onRetry={reload} label="policies" />}
          {!loading && !error && !items.length && (
            <EmptyState>Policy documents will appear here once they are published.</EmptyState>
          )}

          <div className={styles.grid}>
            {items.map((policy, i) => (
              <article key={policy._id} className={`${styles.card} reveal`} data-delay={String(i % 3)}>
                <div className={styles.thumb}>
                  {policy.thumbnail?.url && <img src={mediaUrl(policy.thumbnail)} alt="" loading="lazy" />}
                  <span className={styles.pill}>
                    <b>{policy.file?.mime === "application/pdf" ? "PDF" : "FILE"}</b>
                    <i>{formatSize(policy.file?.size)}</i>
                  </span>
                </div>

                <div className={styles.body}>
                  <span className={styles.meta}>
                    Updated{" "}
                    {new Date(policy.updatedAt).toLocaleDateString("en-GB", {
                      month: "short", year: "numeric",
                    })}
                  </span>
                  <h3>{policy.title}</h3>
                  <p>{policy.description}</p>
                  <hr />
                  <div className={styles.actions}>
                    <button
                      type="button"
                      className={styles.read}
                      onClick={() => preview(policy)}
                      disabled={!policy.file?.url}
                    >
                      <Icon name="eye" size={15} />
                      Read
                    </button>
                    <button
                      type="button"
                      className={styles.download}
                      onClick={() => handleDownload(policy)}
                      disabled={!policy.file?.url}
                    >
                      <Icon name="download" size={15} />
                      Download
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <PdfPreview doc={reading} onClose={() => setReading(null)} onDownload={handleDownload} />
    </>
  );
}
