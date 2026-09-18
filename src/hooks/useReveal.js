import { useEffect } from "react";
import { useLocation } from "react-router-dom";

// Adds .in to every .reveal element as it enters the viewport.
// Re-scans on route change so newly mounted pages animate too.
export default function useReveal() {
  const { pathname } = useLocation();

  useEffect(() => {
    const nodes = document.querySelectorAll(".reveal:not(.in)");
    if (!nodes.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            observer.unobserve(entry.target);
          }
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 },
    );

    nodes.forEach((n) => observer.observe(n));
    return () => observer.disconnect();
  }, [pathname]);
}
