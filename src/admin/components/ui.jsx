import { createContext, useCallback, useContext, useEffect, useId, useMemo, useState } from "react";
import AdminIcon from "./AdminIcon";
import s from "./ui.module.css";

const cx = (...parts) => parts.filter(Boolean).join(" ");

/* ------------------------------------------------------------------ button */
export function Button({ variant = "secondary", size, className, icon, children, ...rest }) {
  return (
    <button className={cx(s.btn, s[variant], size === "sm" && s.sm, className)} {...rest}>
      {icon && <AdminIcon name={icon} size={size === "sm" ? 14 : 16} />}
      {children}
    </button>
  );
}

export function IconButton({ icon, label, ...rest }) {
  return (
    <button className={s.iconBtn} title={label} aria-label={label} {...rest}>
      <AdminIcon name={icon} size={17} />
    </button>
  );
}

/* ----------------------------------------------------------------- surfaces */
export function Card({ children, className }) {
  return <div className={cx(s.card, className)}>{children}</div>;
}

export function CardHead({ title, children }) {
  return (
    <div className={s.cardHead}>
      <h3>{title}</h3>
      {children}
    </div>
  );
}

export function CardBody({ children, className }) {
  return <div className={cx(s.cardBody, className)}>{children}</div>;
}

export function PageHead({ title, subtitle, children }) {
  return (
    <header className={s.pageHead}>
      <div>
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </div>
      {children && <div className={s.pageActions}>{children}</div>}
    </header>
  );
}

export function Toolbar({ children }) {
  return <div className={s.toolbar}>{children}</div>;
}

export const Spacer = () => <span className={s.spacer} />;

/* -------------------------------------------------------------------- pills */
export function FilterPills({ options, value, onChange }) {
  return (
    <div className={s.pills} role="tablist">
      {options.map((opt) => (
        <button
          key={opt.value}
          role="tab"
          aria-selected={value === opt.value}
          className={cx(s.pill, value === opt.value && s.pillOn)}
          onClick={() => onChange(opt.value)}
        >
          {opt.label}
          {opt.count != null && <span className={s.pillCount}>{opt.count}</span>}
        </button>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------- fields */
export function Field({ label, required, hint, children, error }) {
  return (
    <label className={s.field}>
      {label && (
        <span className={s.label}>
          {label}
          {required && <span className={s.req}>*</span>}
        </span>
      )}
      {children}
      {error ? <span className={cx(s.hint)} style={{ color: "var(--a-red)" }}>{error}</span> : hint && <span className={s.hint}>{hint}</span>}
    </label>
  );
}

export const Input = (props) => <input className={s.input} {...props} />;
export const Textarea = (props) => <textarea className={s.textarea} {...props} />;

export function Select({ options = [], placeholder, children, ...rest }) {
  return (
    <select className={s.select} {...rest}>
      {placeholder && <option value="">{placeholder}</option>}
      {options.map((o) =>
        typeof o === "string" ? (
          <option key={o} value={o}>{o}</option>
        ) : (
          <option key={o.value} value={o.value}>{o.label}</option>
        ),
      )}
      {children}
    </select>
  );
}

export function SearchInput({ value, onChange, placeholder = "Search…" }) {
  return (
    <div className={s.search}>
      <AdminIcon name="search" size={16} />
      <input
        className={s.input}
        type="search"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

export function Toggle({ checked, onChange, title, description }) {
  return (
    <div className={s.toggleRow}>
      <button
        type="button"
        role="switch"
        aria-checked={!!checked}
        aria-label={title}
        className={cx(s.toggle, checked && s.toggleOn)}
        onClick={() => onChange(!checked)}
      />
      <span className={s.toggleText}>
        <strong>{title}</strong>
        {description && <span>{description}</span>}
      </span>
    </div>
  );
}

/* -------------------------------------------------------------------- table */
export function Table({ columns, children }) {
  return (
    <div className={s.tableWrap}>
      <table className={s.table}>
        <thead>
          <tr>
            {/* keyed by position: several columns legitimately have no heading */}
            {columns.map((c, i) => (
              <th key={i} className={c === "" ? s.numeric : undefined}>{c}</th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

export const RowTitle = ({ children, sub }) => (
  <span>
    <span className={s.rowTitle}>{children}</span>
    {sub && <span className={s.rowSub}>{sub}</span>}
  </span>
);

export const RowActions = ({ children }) => <div className={s.rowActions}>{children}</div>;
export const Thumb = ({ src, alt = "" }) => <img className={s.thumb} src={src} alt={alt} loading="lazy" />;

/* -------------------------------------------------------------------- chips */
const CHIP_TONE = {
  published: "chipGreen",
  active: "chipGreen",
  approved: "chipGreen",
  draft: "chipGrey",
  inactive: "chipGrey",
  scheduled: "chipSky",
  pending: "chipAmber",
  archived: "chipAmber",
  trashed: "chipRed",
  admin: "chipBrand",
  editor: "chipSky",
  author: "chipAmber",
  user: "chipGrey",
};

export function Chip({ children, tone }) {
  const key = tone || String(children ?? "").toLowerCase();
  return <span className={cx(s.chip, s[CHIP_TONE[key] || "chipGrey"])}>{children}</span>;
}

export const ChipRow = ({ children }) => <div className={s.chipRow}>{children}</div>;

/* ------------------------------------------------------- loading / empty */
export function TableSkeleton({ rows = 6 }) {
  return (
    <div>
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className={s.skelRow}>
          <div className={s.skel} style={{ width: `${45 + ((i * 17) % 40)}%` }} />
        </div>
      ))}
    </div>
  );
}

export function EmptyState({ title = "Nothing here yet", message, action }) {
  return (
    <div className={s.empty}>
      <h3>{title}</h3>
      {message && <p>{message}</p>}
      {action}
    </div>
  );
}

export function ErrorBox({ error, onRetry }) {
  return (
    <div className={s.errorBox}>
      <strong>Something went wrong.</strong>
      <div style={{ marginTop: 4 }}>{error?.message || String(error)}</div>
      {onRetry && (
        <Button size="sm" onClick={onRetry}>Try again</Button>
      )}
    </div>
  );
}

/* --------------------------------------------------------------- pagination */
export function Pager({ page, pages, total, onPage }) {
  if (!pages || pages <= 1) {
    return total != null ? <div className={s.pager}><span>{total} item{total === 1 ? "" : "s"}</span></div> : null;
  }
  return (
    <div className={s.pager}>
      <span>Page {page} of {pages}{total != null && ` · ${total} items`}</span>
      <div className={s.pagerBtns}>
        <Button size="sm" icon="chevronLeft" disabled={page <= 1} onClick={() => onPage(page - 1)}>Previous</Button>
        <Button size="sm" disabled={page >= pages} onClick={() => onPage(page + 1)}>Next</Button>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------- modal */
export function Modal({ title, onClose, children, footer, wide }) {
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className={s.overlay} onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className={cx(s.modal, wide && s.modalWide)} role="dialog" aria-modal="true" aria-label={title}>
        <div className={s.modalHead}>
          <h3>{title}</h3>
          <IconButton icon="close" label="Close" onClick={onClose} />
        </div>
        <div className={s.modalBody}>{children}</div>
        {footer && <div className={s.modalFoot}>{footer}</div>}
      </div>
    </div>
  );
}

export function ConfirmDialog({ title, message, confirmLabel = "Confirm", destructive, onConfirm, onClose }) {
  const [busy, setBusy] = useState(false);
  return (
    <Modal
      title={title}
      onClose={onClose}
      footer={
        <>
          <Button onClick={onClose} disabled={busy}>Cancel</Button>
          <Button
            variant={destructive ? "danger" : "primary"}
            disabled={busy}
            onClick={async () => {
              setBusy(true);
              try {
                await onConfirm();
                onClose();
              } finally {
                setBusy(false);
              }
            }}
          >
            {busy ? "Working…" : confirmLabel}
          </Button>
        </>
      }
    >
      <p style={{ fontSize: 14, lineHeight: 1.6 }}>{message}</p>
    </Modal>
  );
}

/* ------------------------------------------------------------------- toasts */
const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const push = useCallback((message, tone = "default") => {
    const id = Math.random().toString(36).slice(2);
    setToasts((t) => [...t, { id, message, tone }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4200);
  }, []);

  const value = useMemo(
    () => ({
      success: (m) => push(m, "success"),
      error: (m) => push(typeof m === "string" ? m : m?.message || "Something went wrong", "error"),
      info: (m) => push(m),
    }),
    [push],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className={s.toasts} aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className={cx(s.toast, t.tone === "error" && s.toastError, t.tone === "success" && s.toastSuccess)}>
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext) || { success() {}, error() {}, info() {} };
}

export { s as ui, cx, useId };
