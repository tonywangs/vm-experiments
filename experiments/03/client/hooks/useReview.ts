import { useCallback, useEffect, useRef, useState } from 'react';
import { api } from '../api';
import type { ReviewDetail } from '../types';

export function useReview(frameId: string, revisionId: string | undefined) {
  const [detail, setDetail] = useState<ReviewDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [reload, setReload] = useState(0);
  const generation = useRef(0);
  const refresh = useCallback(() => setReload(value => value + 1), []);

  useEffect(() => {
    const controller = new AbortController();
    const current = ++generation.current;
    setLoading(true);
    setError(null);
    setDetail(null);
    void api.detail(frameId, revisionId, controller.signal)
      .then(value => {
        if (!controller.signal.aborted && current === generation.current) setDetail(value);
      })
      .catch((reason: unknown) => {
        if (!controller.signal.aborted && current === generation.current) {
          setError(reason instanceof Error ? reason.message : 'Could not load this review.');
        }
      })
      .finally(() => {
        if (!controller.signal.aborted && current === generation.current) setLoading(false);
      });
    return () => controller.abort();
  }, [frameId, revisionId, reload]);

  return { detail, error, loading, refresh };
}
