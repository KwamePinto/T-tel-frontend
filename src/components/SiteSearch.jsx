import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Icon from "./Icon";
import { cms } from "../lib/cms";
import styles from "./SiteSearch.module.css";

/** Order the grouped results appear in, most-used first. */
const SECTION_ORDER = [
  "News & Media", "Knowledge Hub", "Focus Areas", "Programmes", "Our People", "Pages", "Partners",
];

/** Highlights the matched run inside a result title. */
function Highlight({ text, query }) {
  const i = text.toLowerCase().indexOf(query.toLowerCase());
  if (!query || i < 0) return text;
  return (
    <>
      {text.slice(0, i)}
      <mark>{text.slice(i, i + query.length)}</mark>
      {text.slice(i + query.length)}
    </>
  );
}

export default function SiteSearch({ onClose }) {
  const navigate = useNavigate();
  const [term, setTerm] = useState("");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [cursor, setCursor] = useState(0);
  const latest = useRef(0);

  // Debounced so each keystroke doesn't fire a request, and guarded by a
  // ticket so a slow early response can't overwrite a newer one.
  useEffect(() => {
    const q = term.trim();
    if (q.length < 2) { setItems([]); setLoading(false); return; }

    setLoading(true);
    const ticket = ++latest.current;
    const timer = setTimeout(() => {
      cms.search(q)
        .then((r) => { if (ticket === latest.current) setItems(r.items || []); })
        .catch(() => { if (ticket === latest.current) setItems([]); })
        .finally(() => { if (ticket === latest.current) setLoading(false); });
    }, 180);

    return () => clearTimeout(timer);
  }, [term]);

  useEffect(() => setCursor(0), [items]);

  const grouped = useMemo(() => {
    const map = new Map();
    for (const item of items) {
      if (!map.has(item.section)) map.set(item.section, []);
      map.get(item.section).push(item);
    }
    return [...map.entries()].sort(
      (a, b) => (SECTION_ORDER.indexOf(a[0]) + 99) % 99 - (SECTION_ORDER.indexOf(b[0]) + 99) % 99,
    );
  }, [items]);

  const flat = useMemo(() => grouped.flatMap(([, list]) => list), [grouped]);

  function go(item) {
    if (!item) return;
    navigate(item.url);
    onClose();
  }

  function onKeyDown(e) {
    if (e.key === "ArrowDown") { e.preventDefault(); setCursor((c) => Math.min(c + 1, flat.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setCursor((c) => Math.max(c - 1, 0)); }
    else if (e.key === "Enter") { e.preventDefault(); go(flat[cursor]); }
    else if (e.key === "Escape") { onClose(); }
  }

  const q = term.trim();
  let index = -1;

  return (
    <div className={styles.bar}>
      <div className="container">
        <div className={styles.form}>
          <Icon name="search" size={20} />
          <input
            type="search"
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Search T-TEL — reports, programmes, people…"
            aria-label="Search the site"
            aria-expanded={flat.length > 0}
            autoFocus
          />
          <button type="button" onClick={onClose} aria-label="Close search">
            <Icon name="close" size={20} />
          </button>
        </div>

        {q.length >= 2 && (
          <div className={styles.results} role="listbox">
            {loading && flat.length === 0 && <p className={styles.hint}>Searching…</p>}

            {!loading && flat.length === 0 && (
              <p className={styles.hint}>No matches for “{q}”.</p>
            )}

            {grouped.map(([section, list]) => (
              <div key={section} className={styles.group}>
                <span className={styles.groupLabel}>{section}</span>
                <ul>
                  {list.map((item) => {
                    index += 1;
                    const active = index === cursor;
                    const myIndex = index;
                    return (
                      <li key={item.url + item.title}>
                        <button
                          type="button"
                          role="option"
                          aria-selected={active}
                          className={`${styles.result} ${active ? styles.resultOn : ""}`}
                          onMouseEnter={() => setCursor(myIndex)}
                          onClick={() => go(item)}
                        >
                          <span className={styles.resultTitle}>
                            <Highlight text={item.title} query={q} />
                          </span>
                          {item.description && (
                            <span className={styles.resultMeta}>{item.description}</span>
                          )}
                          <span className={styles.resultSection}>{item.section}</span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}

            {flat.length > 0 && (
              <p className={styles.footHint}>
                <kbd>↑</kbd><kbd>↓</kbd> to move · <kbd>Enter</kbd> to open · <kbd>Esc</kbd> to close
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
