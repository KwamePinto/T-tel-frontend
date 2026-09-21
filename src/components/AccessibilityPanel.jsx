import { useEffect, useRef } from "react";
import useSitePrefs from "../hooks/useSitePrefs";
import Icon from "./Icon";
import styles from "./AccessibilityPanel.module.css";

const SIZES = [
  { key: "sm", label: "A", px: 13 },
  { key: "md", label: "A", px: 16 },
  { key: "lg", label: "A", px: 20 },
];

export default function AccessibilityPanel({ onClose }) {
  const { prefs, setPref, reset } = useSitePrefs();
  const ref = useRef(null);

  useEffect(() => {
    function onDown(e) {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    }
    function onKey(e) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  return (
    <div className={styles.panel} ref={ref} role="dialog" aria-label="Display settings">
      <div className={styles.row}>
        <span className={styles.label}>Text size</span>
        <div className={styles.sizes}>
          {SIZES.map((s) => (
            <button
              key={s.key}
              onClick={() => setPref("textsize", s.key)}
              className={prefs.textsize === s.key ? styles.sizeOn : styles.size}
              style={{ fontSize: s.px }}
              aria-pressed={prefs.textsize === s.key}
              aria-label={`Text size ${s.key}`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.row}>
        <span className={styles.label}>Theme</span>
        <button
          className={styles.themeBtn}
          onClick={() => setPref("theme", prefs.theme === "dark" ? "light" : "dark")}
          aria-pressed={prefs.theme === "dark"}
          aria-label="Toggle dark mode"
        >
          <Icon name={prefs.theme === "dark" ? "sun" : "moon"} size={20} />
        </button>
      </div>

      {/* There was a language switch here. It set `lang="fr"` on the document
          and nothing else: the site has no French content and no locale layer,
          and a client-side translator is not an option — the website-translator
          widget was retired in 2019 and rewrites the DOM, which React
          immediately overwrites. French means French content, so the control
          comes out until there is something for it to switch to. */}

      <button className={styles.reset} onClick={reset}>
        Reset to defaults
      </button>
    </div>
  );
}
