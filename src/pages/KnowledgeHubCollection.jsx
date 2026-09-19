import { useEffect, useMemo, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import PageHero from "../components/PageHero";
import Icon from "../components/Icon";
import PdfPreview, { openPreview } from "../components/PdfPreview";
import { CardsLoading, ErrorState, EmptyState } from "../components/States";
import { cms, mediaUrl } from "../lib/cms";
import { useCms } from "../hooks/useCms";
import styles from "./KnowledgeHubCollection.module.css";

const SORTS = [
  { value: "date", label: "Publish Date" },
  { value: "title", label: "Title" },
  { value: "updated", label: "Update Date" },
  { value: "downloads", label: "Downloads" },
];

const PER_PAGE = 24;

/** Bytes to a short human size, for the card footer. */
function fileSize(n) {
  if (!n) return "";
  const mb = n / 1024 / 1024;
  return mb >= 1 ? `${mb.toFixed(1)} MB` : `${Math.max(Math.round(n / 1024), 1)} KB`;
}

export default function KnowledgeHubCollection() {
  const { slug } = useParams();
  const [params, setParams] = useSearchParams();

  const page = Number(params.get("page")) || 1;
  const sort = params.get("sort") || "date";
  const order = params.get("order") || "desc";
  const query = params.get("q") || "";

  // the input is local so typing doesn't refetch on every keystroke
  const [term, setTerm] = useState(query);
  useEffect(() => setTerm(query), [query]);

  const { data: cats } = useCms(() => cms.documentCategories(), []);
  const { data, loading, error, reload } = useCms(
    () => cms.documents({ collection: slug, page, limit: PER_PAGE, sort, order, search: query }),
    [slug, page, sort, order, query],
  );

  const { collection, parent } = useMemo(() => {
    const tops = cats?.items || [];
    for (const top of tops) {
      if (top.slug === slug) return { collection: top, parent: null };
      const child = (top.children || []).find((c) => c.slug === slug);
      if (child) return { collection: child, parent: top };
    }
    return { collection: null, parent: null };
  }, [cats, slug]);

  const setParam = (patch) => {
    const next = new URLSearchParams(params);
    for (const [k, v] of Object.entries(patch)) {
      if (v === "" || v == null) next.delete(k);
      else next.set(k, String(v));
    }
    if (!("page" in patch)) next.delete("page"); // any change returns to page one
    setParams(next);
  };

  const items = data?.items || [];
  const pages = data?.pages || 1;
  const [reading, setReading] = useState(null);

  async function download(doc) {
    try {
      const { url } = await cms.trackDownload(doc._id);
      window.open(mediaUrl(url || doc.file?.url), "_blank", "noopener");
    } catch {
      // tracking is best-effort; never block the download itself
      window.open(mediaUrl(doc.file?.url), "_blank", "noopener");
    }
  }

  // Reading and saving are separate actions: the cover and the title open the
  // document, the download button saves it. Only the latter counts as a
  // download, which keeps the dashboard's figures meaning what they say.
  const preview = (doc) => openPreview(doc, setReading);

  return (
    <>
      <PageHero
        title={collection?.name || "Knowledge Hub"}
        crumb={collection?.name || "Knowledge Hub"}
        subtitle={collection?.description}
        image="/images/focus/library-review.jpg"
      />

      <section className="section">
        <div className="container">
          <nav className={styles.crumbs} aria-label="Breadcrumb">
            <Link to="/knowledge-hub">Knowledge Hub</Link>
            {parent && (
              <>
                <Icon name="chevronRight" size={14} />
                <Link to={`/knowledge-hub/${parent.slug}`}>{parent.name}</Link>
              </>
            )}
            <Icon name="chevronRight" size={14} />
            <span>{collection?.name || slug}</span>
          </nav>

          {collection?.children?.length > 0 && (
            <div className={styles.childRow}>
              {collection.children.map((c) => (
                <Link key={c._id} to={`/knowledge-hub/${c.slug}`} className={styles.childChip}>
                  {c.name}
                  <span>{c.count}</span>
                </Link>
              ))}
            </div>
          )}

          <form
            className={styles.filters}
            onSubmit={(e) => { e.preventDefault(); setParam({ q: term.trim() }); }}
          >
            <div className={styles.searchWrap}>
              <Icon name="search" size={18} />
              <input
                type="search"
                value={term}
                onChange={(e) => setTerm(e.target.value)}
                placeholder="Search keyword…"
                aria-label="Search this collection"
              />
            </div>

            <select value={sort} onChange={(e) => setParam({ sort: e.target.value })} aria-label="Order by">
              {SORTS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>

            <select value={order} onChange={(e) => setParam({ order: e.target.value })} aria-label="Order">
              <option value="desc">Descending</option>
              <option value="asc">Ascending</option>
            </select>

            <button type="submit" className={styles.applyBtn}>Apply Filter</button>
          </form>

          {loading && <CardsLoading count={8} />}
          {error && <ErrorState error={error} onRetry={reload} label="documents" />}

          {!loading && !error && items.length === 0 && (
            <EmptyState>
              {query
                ? `No documents match “${query}”.`
                : "No documents have been published in this collection yet."}
            </EmptyState>
          )}

          {items.length > 0 && (
            <>
              <p className={styles.count}>
                {data.total} document{data.total === 1 ? "" : "s"}
                {query && <> matching “{query}”</>}
              </p>

              <div className={styles.grid}>
                {items.map((doc) => (
                  <article key={doc._id} className={styles.card}>
                    <button
                      type="button"
                      className={styles.cover}
                      onClick={() => preview(doc)}
                      aria-label={`Read ${doc.title}`}
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
                        <span className={styles.coverFallback}>PDF</span>
                      )}
                      <span className={styles.coverOverlay}>
                        <Icon name="eye" size={20} />
                        Read
                      </span>
                    </button>

                    <h3 className={styles.title}>
                      {/* title attribute: the card clamps long names to four
                          lines, so the full one stays reachable on hover */}
                      <button type="button" title={doc.title} onClick={() => preview(doc)}>
                        {doc.title}
                      </button>
                    </h3>

                    <p className={styles.meta}>
                      {[doc.year, fileSize(doc.file?.size)].filter(Boolean).join(" · ")}
                    </p>

                    <button
                      type="button"
                      className={styles.save}
                      onClick={() => download(doc)}
                      aria-label={`Download ${doc.title}`}
                    >
                      <Icon name="download" size={15} />
                      Download
                    </button>
                  </article>
                ))}
              </div>

              {pages > 1 && (
                <nav className={styles.pager} aria-label="Pagination">
                  <button
                    type="button"
                    disabled={page <= 1}
                    onClick={() => setParam({ page: page - 1 })}
                    aria-label="Previous page"
                  >
                    <Icon name="arrowRight" size={17} style={{ transform: "rotate(180deg)" }} />
                  </button>
                  <span>Page {page} of {pages}</span>
                  <button
                    type="button"
                    disabled={page >= pages}
                    onClick={() => setParam({ page: page + 1 })}
                    aria-label="Next page"
                  >
                    <Icon name="arrowRight" size={17} />
                  </button>
                </nav>
              )}
            </>
          )}
        </div>
      </section>

      <PdfPreview doc={reading} onClose={() => setReading(null)} onDownload={download} />
    </>
  );
}
