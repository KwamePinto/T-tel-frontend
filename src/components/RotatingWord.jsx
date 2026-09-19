import { useEffect, useState } from "react";
import styles from "./RotatingWord.module.css";

// Cycles through a set of words, dropping each new one in from above.
export default function RotatingWord({ words, interval = 2800, className }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % words.length);
    }, interval);
    return () => clearInterval(id);
  }, [words.length, interval]);

  return (
    <span className={`${styles.rotator} ${className || ""}`}>
      {/* widest word reserves the space so the headline never reflows */}
      <span className={styles.sizer} aria-hidden="true">
        {words.reduce((a, b) => (b.length > a.length ? b : a), "")}
      </span>
      <span key={index} className={styles.word}>
        {words[index]}
      </span>
    </span>
  );
}
