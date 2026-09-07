import { useCallback, useEffect, useState } from "react";
import { api } from "../api";
import type { Batch, BatchDetail, Catalog } from "../types";

export function useWorkspace() {
  const [catalog, setCatalog] = useState<Catalog | null>(null);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<BatchDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [revision, setRevision] = useState(0);
  const refresh = useCallback(() => setRevision((value) => value + 1), []);

  useEffect(() => {
    const controller = new AbortController();
    api.catalog(controller.signal).then(setCatalog).catch((reason: Error) => {
      if (!controller.signal.aborted) setError(reason.message);
    });
    return () => controller.abort();
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    let pending = false;
    const update = async () => {
      if (pending) return;
      pending = true;
      try {
        const list = await api.batches(controller.signal);
        const current = selectedId || list[0]?.id;
        const result = current ? await api.detail(current, controller.signal) : null;
        if (controller.signal.aborted) return;
        setBatches(list);
        setDetail(result);
        setError(null);
        if (!selectedId && current) setSelectedId(current);
      } catch (reason) {
        if (!controller.signal.aborted) setError((reason as Error).message);
      } finally { pending = false; }
    };
    void update();
    const timer = window.setInterval(() => void update(), 1000);
    return () => { controller.abort(); window.clearInterval(timer); };
  }, [selectedId, revision]);

  return {
    catalog, batches, selectedId, detail: detail?.batch.id === selectedId ? detail : null,
    error, refresh, select: setSelectedId,
  };
}
