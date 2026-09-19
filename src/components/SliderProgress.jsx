import { useEffect, useRef } from "react";
import styles from "./SliderProgress.module.css";

// Mini loading bars: the active bar fills over `duration`, then the slider
// advances to the next group on its own. Clicking a bar jumps to that group.
export default function SliderProgress({ count, index, onSelect, duration = 5000, paused }) {
  const fillRef = useRef(null);

  useEffect(() => {
    if (count < 2 || paused) return;
    const id = setTimeout(() => onSelect((index + 1) % count), duration);
    return () => clearTimeout(id);
  }, [count, index, onSelect, duration, paused]);

  // restart the fill animation whenever the active group changes
  useEffect(() => {
    const el = fillRef.current;
    if (!el) return;
    el.style.animation = "none";
    void el.offsetWidth;
    el.style.animation = `${styles.fill} ${duration}ms linear forwards`;
    if (paused) el.style.animationPlayState = "paused";
  }, [index, duration, paused]);

  if (count < 2) return null;

  return (
    <div className={styles.bars}>
      {Array.from({ length: count }).map((_, i) => (
        <button
          key={i}
          type="button"
          className={i === index ? styles.barOn : styles.bar}
          onClick={() => onSelect(i)}
          aria-label={`Go to group ${i + 1}`}
          aria-current={i === index}
        >
          {i === index && <span className={styles.fillBar} ref={fillRef} />}
        </button>
      ))}
    </div>
  );
}
