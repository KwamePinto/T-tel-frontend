import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * Adds .in to every .reveal element as it enters the viewport.
 *
 * Content that arrives from the API mounts after this hook first runs, so a
 * one-off querySelectorAll would leave those sections stuck at opacity 0
 * forever. A MutationObserver picks up nodes added later.
 */
export default function useReveal() {
  const { pathname } = useLocation();

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            io.unobserve(entry.target);
          }
        }
      },
      // threshold must stay 0: a ratio-based threshold can never be met by an
      // element taller than the viewport (a 10,000px block in a 950px window
      // tops out around 8%), which left long pages stuck at opacity 0. The
      // negative bottom margin is what delays the reveal instead, and it works
      // at any height.
      { rootMargin: "0px 0px -72px 0px", threshold: 0 },
    );

    const watch = (root) => {
      if (!(root instanceof Element)) return;
      if (root.matches?.(".reveal:not(.in)")) io.observe(root);
      root.querySelectorAll?.(".reveal:not(.in)").forEach((el) => io.observe(el));
    };

    watch(document.body);

    const mo = new MutationObserver((records) => {
      for (const record of records) {
        for (const node of record.addedNodes) watch(node);
      }
    });
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      io.disconnect();
      mo.disconnect();
    };
  }, [pathname]);
}
