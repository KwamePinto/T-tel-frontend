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

      <div className={styles.row}>
        <span className={styles.label}>Language</span>
        <div className={styles.langs}>
          {["EN", "FR"].map((l) => (
            <button
              key={l}
              onClick={() => setPref("lang", l)}
              className={prefs.lang === l ? styles.langOn : styles.lang}
              aria-pressed={prefs.lang === l}
            >
              {l}
            </button>
          ))}
        </div>
      </div>

      <button className={styles.reset} onClick={reset}>
        Reset to defaults
      </button>
    </div>
  );
}
