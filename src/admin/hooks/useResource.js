import { useCallback, useEffect, useRef, useState } from "react";

/** Runs an async fetcher, guarding against out-of-order responses. */
export function useAsync(fetcher, deps = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [nonce, setNonce] = useState(0);
  const latest = useRef(0);

  useEffect(() => {
    const ticket = ++latest.current;
    setLoading(true);
    setError(null);
    Promise.resolve()
      .then(fetcher)
      .then((result) => {
        if (ticket === latest.current) setData(result);
      })
      .catch((err) => {
        if (ticket === latest.current) setError(err);
      })
      .finally(() => {
        if (ticket === latest.current) setLoading(false);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, nonce]);

  const reload = useCallback(() => setNonce((n) => n + 1), []);
  return { data, loading, error, reload, setData };
}

/** List state (page / search / filters) plus the fetch that follows it.
 *  `search` is owned here so every list gets debouncing for free. */
export function useList(resource, initialParams = {}) {
  const [params, setParams] = useState({ page: 1, limit: 20, ...initialParams });
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounced(search);

  const query = { ...params, search: debouncedSearch };
  const key = JSON.stringify(query);

  const { data, loading, error, reload } = useAsync(() => resource.list(query), [key]);

  const setParam = useCallback((patch) => {
    // any filter change resets to page one, otherwise you land on an empty page
    setParams((p) => ({ ...p, ...patch, page: patch.page ?? 1 }));
  }, []);

  const onSearch = useCallback((value) => {
    setSearch(value);
    setParams((p) => (p.page === 1 ? p : { ...p, page: 1 }));
  }, []);

  return {
    items: data?.items || [],
    total: data?.total ?? 0,
    page: data?.page ?? params.page,
    pages: data?.pages ?? 1,
    params,
    setParam,
    search,
    setSearch: onSearch,
    loading,
    error,
    reload,
  };
}

/** Debounces a value — used so typing in a search box doesn't hammer the API. */
export function useDebounced(value, delay = 300) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}
