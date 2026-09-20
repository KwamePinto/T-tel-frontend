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
        // Everything already in view when a fresh page mounts intersects in
        // the same callback — a whole hero and first section's worth of
        // elements, all switching to opacity:1 on the same frame. One
        // synchronized block popping in at once is what "aggressive" was
        // describing, even though each element's own transition is a smooth
        // 0.9s fade. Staggering them by their order in this one batch turns
        // that into a brief, gentle cascade instead — capped at six steps so
        // a long list doesn't drag the last cards out past the point of
        // still feeling like part of the same page loading in.
        let step = 0;
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const el = entry.target;
          // An element with its own data-delay already has a deliberate,
          // author-chosen stagger via a stylesheet rule — an inline style
          // here would win over that rule and override it, so those are
          // left alone and only get the automatic stagger.
          if (!el.hasAttribute("data-delay")) {
            el.style.transitionDelay = `${Math.min(step, 6) * 60}ms`;
            step++;
          }
          el.classList.add("in");
          io.unobserve(el);
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
