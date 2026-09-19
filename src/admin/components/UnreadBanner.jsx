import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AdminIcon from "./AdminIcon";
import { api } from "../lib/api";
import s from "./UnreadBanner.module.css";

const DISMISSED_KEY = "ttel.unreadDismissedAt";

/**
 * Sits over the dashboard once per sign-in when messages are waiting.
 * Form notification emails aren't wired yet, so this is how an editor finds
 * out an enquiry arrived. Dismissing it is remembered for the day, so it
 * greets them once rather than on every navigation.
 */
export default function UnreadBanner() {
  const [count, setCount] = useState(0);
  const [formId, setFormId] = useState(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const [dash, forms] = await Promise.all([api.dashboard(), api.forms.list({ limit: 5 })]);
        if (cancelled) return;

        const unread = dash?.counts?.unreadSubmissions || 0;
        if (!unread) return;

        // link straight at the form that collects enquiries
        const contact = (forms?.items || []).find((f) => f.slug === "contact-us") || forms?.items?.[0];
        setFormId(contact?._id || null);
        setCount(unread);

        let dismissedToday = false;
        try {
          dismissedToday = localStorage.getItem(DISMISSED_KEY) === new Date().toDateString();
        } catch {
          // private browsing or blocked storage: just show it
        }
        if (!dismissedToday) setOpen(true);
      } catch {
        // the banner is a courtesy; never let it break the dashboard
      }
    })();

    return () => { cancelled = true; };
  }, []);

  function dismiss() {
    setOpen(false);
    try {
      localStorage.setItem(DISMISSED_KEY, new Date().toDateString());
    } catch { /* nothing to do */ }
  }

  if (!open || !count) return null;

  return (
    <div className={s.wrap} role="status" aria-live="polite">
      <div className={s.card}>
        <span className={s.icon}><AdminIcon name="mail" size={20} /></span>

        <div className={s.body}>
          <strong>
            {count} unread message{count === 1 ? "" : "s"}
          </strong>
          <span>
            {count === 1 ? "An enquiry has" : "Enquiries have"} come in through the website
            and {count === 1 ? "is" : "are"} waiting for a reply.
          </span>
        </div>

        {formId && (
          <Link to={`/admin/forms/${formId}/submissions`} className={s.action} onClick={dismiss}>
            Read {count === 1 ? "it" : "them"}
            <AdminIcon name="chevronRight" size={15} />
          </Link>
        )}

        <button className={s.close} onClick={dismiss} aria-label="Dismiss">
          <AdminIcon name="close" size={17} />
        </button>
      </div>
    </div>
  );
}
