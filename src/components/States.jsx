import styles from "./States.module.css";

export function Loading({ label = "Loading…", rows = 3 }) {
  return (
    <div className={styles.loading} role="status" aria-live="polite">
      <span className={styles.srOnly}>{label}</span>
      {Array.from({ length: rows }).map((_, i) => (
        <span key={i} className={styles.bar} style={{ width: `${88 - i * 14}%` }} />
      ))}
    </div>
  );
}

export function CardsLoading({ count = 3 }) {
  return (
    <div className={styles.cards} role="status" aria-live="polite">
      <span className={styles.srOnly}>Loading…</span>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={styles.card}>
          <span className={styles.thumb} />
          <span className={styles.bar} style={{ width: "80%" }} />
          <span className={styles.bar} style={{ width: "55%" }} />
        </div>
      ))}
    </div>
  );
}

export function ErrorState({ error, onRetry, label = "content" }) {
  return (
    <div className={styles.message} role="alert">
      <p>
        <strong>We couldn&rsquo;t load this {label}.</strong>
      </p>
      <p className={styles.detail}>{error?.message || "Please try again in a moment."}</p>
      {onRetry && (
        <button type="button" className="btn btn-outline" onClick={onRetry}>
          Try again
        </button>
      )}
    </div>
  );
}

export function EmptyState({ children = "Nothing to show here yet." }) {
  return <p className={styles.empty}>{children}</p>;
}
