import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AdminIcon from "./AdminIcon";
import { Button, Card, ConfirmDialog } from "./ui";
import s from "./EditorShell.module.css";

/** Two-column editor chrome: title bar with Save/Cancel, main column and a
 *  sticky right rail — the same arrangement as the live CMS, with the rail
 *  broken into collapsible sections so it stays scannable. */
export default function EditorShell({
  backTo,
  backLabel,
  title,
  dirty,
  saving,
  onSave,
  extraActions,
  children,
  rail,
}) {
  const navigate = useNavigate();
  const [leaveTo, setLeaveTo] = useState(null);

  // The app uses a plain <BrowserRouter>, so there is no router-level blocker.
  // Leaving is only possible through Back/Cancel here, which we intercept.
  const guardedLeave = useCallback(
    (e) => {
      if (!dirty) return;
      e.preventDefault();
      setLeaveTo(backTo);
    },
    [dirty, backTo],
  );

  useEffect(() => {
    if (!dirty) return;
    const warn = (e) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        onSave?.();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onSave]);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSave?.();
      }}
    >
      <div className={s.head}>
        <Link to={backTo} className={s.back} onClick={guardedLeave}>
          <AdminIcon name="chevronLeft" size={15} />
          {backLabel}
        </Link>
        <h1>{title}</h1>
        <span className={s.headSpacer} />
        <div className={s.headActions}>
          {dirty && <span className={s.dirty}>Unsaved changes</span>}
          {extraActions}
          <Link to={backTo} onClick={guardedLeave}><Button type="button">Cancel</Button></Link>
          <Button type="submit" variant="primary" disabled={saving}>
            {saving ? "Saving…" : "Save"}
          </Button>
        </div>
      </div>

      <div className={s.grid}>
        <div className={s.main}>{children}</div>
        <aside className={s.rail}>{rail}</aside>
      </div>

      {leaveTo && (
        <ConfirmDialog
          title="Discard unsaved changes?"
          message="You have edits that haven't been saved. Leaving now will lose them."
          confirmLabel="Discard changes"
          destructive
          onConfirm={() => navigate(leaveTo)}
          onClose={() => setLeaveTo(null)}
        />
      )}
    </form>
  );
}

/** A collapsible block inside the right rail. */
export function RailSection({ title, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className={s.section}>
      <button
        type="button"
        className={`${s.sectionHead} ${open ? s.sectionOpen : ""}`}
        onClick={() => setOpen((o) => !o)}
      >
        {title}
        <AdminIcon name="chevronDown" size={16} />
      </button>
      {open && <div className={s.sectionBody}>{children}</div>}
    </div>
  );
}

export function Rail({ children }) {
  return <Card>{children}</Card>;
}

/** Big borderless title plus the editable slug line beneath it. */
export function TitleField({ value, onChange, placeholder = "Add title", slug, onSlugChange, prefix }) {
  return (
    <Card>
      <div style={{ padding: "20px 22px" }}>
        <input
          className={s.titleInput}
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
        />
        {onSlugChange && (
          <div className={s.slugRow}>
            <span>{prefix}</span>
            <input
              value={slug || ""}
              placeholder="auto-generated-from-the-title"
              onChange={(e) => onSlugChange(e.target.value)}
            />
          </div>
        )}
      </div>
    </Card>
  );
}

export { s as editorStyles };
