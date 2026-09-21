import { useCallback, useEffect, useRef, useState } from "react";
import { useLangVersion } from "../i18n";

/**
 * Runs an async CMS call and tracks loading/error state.
 *
 *   const { data, loading, error, reload } = useCms(() => cms.posts({ type: "blog" }), [type]);
 *
 * `fetcher` is intentionally not in the dependency list — pass the values it
 * closes over instead, so an inline arrow doesn't refetch on every render.
 *
 * The language counter is folded in here rather than at the call sites, so
 * switching to French refetches everything on screen in French without any of
 * the callers needing to know that languages exist.
 */
export function useCms(fetcher, deps = [], { skip = false } = {}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(!skip);
  const [error, setError] = useState(null);
  const [nonce, setNonce] = useState(0);
  const langVersion = useLangVersion();
  const latest = useRef(0);

  useEffect(() => {
    if (skip) {
      setLoading(false);
      return;
    }
    const run = ++latest.current;
    let cancelled = false;

    setLoading(true);
    setError(null);

    Promise.resolve(fetcher())
      .then((result) => {
        // ignore responses from a call that has since been superseded
        if (cancelled || run !== latest.current) return;
        setData(result);
      })
      .catch((err) => {
        if (cancelled || run !== latest.current) return;
        setError(err);
      })
      .finally(() => {
        if (cancelled || run !== latest.current) return;
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, nonce, skip, langVersion]);

  const reload = useCallback(() => setNonce((n) => n + 1), []);

  return { data, loading, error, reload };
}
