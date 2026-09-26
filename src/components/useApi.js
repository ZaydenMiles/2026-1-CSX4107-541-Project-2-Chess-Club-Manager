"use client";

import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/client";

// Loads `path` from the REST API and re-fetches whenever it changes. Pass null to skip.
export function useApi(path) {
  const [version, setVersion] = useState(0);
  const [result, setResult] = useState({ key: null, data: null, error: null });
  const key = path ? `${path}#${version}` : null;

  useEffect(() => {
    if (!key) return;
    let cancelled = false;
    api(path)
      .then((data) => !cancelled && setResult({ key, data, error: null }))
      .catch((error) => !cancelled && setResult({ key, data: null, error }));
    return () => {
      cancelled = true;
    };
  }, [key, path]);

  const reload = useCallback(() => setVersion((v) => v + 1), []);
  const loading = Boolean(key) && result.key !== key;
  // Keep showing the previous data while a new request is in flight.
  return { data: result.data, error: loading ? null : result.error, loading, reload };
}
