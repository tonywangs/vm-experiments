import { useCallback, useEffect, useState } from 'react';
import { getCapture } from '../api';
import type { CaptureDetail } from '../types';

export function useCaptureDetail(captureId: string | null) {
  const [detail, setDetail] = useState<CaptureDetail | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!captureId) return;
    try {
      const data = await getCapture(captureId);
      setDetail(data);
      setError(null);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not load capture');
    }
  }, [captureId]);

  useEffect(() => {
    setDetail(null);
    setError(null);
    void refresh();
    const timer = window.setInterval(() => void refresh(), 1200);
    return () => window.clearInterval(timer);
  }, [refresh]);

  return { detail, error, refresh };
}
