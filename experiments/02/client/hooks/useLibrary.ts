import { useCallback, useEffect, useRef, useState } from 'react';
import { api } from '../api';
import type { Document, SourceSummary } from '../types';

export function useLibrary() {
  const [sources, setSources] = useState<SourceSummary[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [importing, setImporting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const alive = useRef(true);

  const refresh = useCallback(async () => {
    const [nextSources, nextDocuments] = await Promise.all([api.sources(), api.documents()]);
    if (alive.current) {
      setSources(nextSources);
      setDocuments(nextDocuments);
    }
  }, []);

  useEffect(() => {
    alive.current = true;
    void refresh().catch((reason: Error) => {
      if (alive.current) setError(reason.message);
    });
    return () => { alive.current = false; };
  }, [refresh]);

  async function importSource(sourceId: string) {
    setImporting(sourceId);
    setError(null);
    setMessage('');
    try {
      const receipt = await api.importSource(sourceId);
      await refresh();
      if (alive.current) setMessage(`Import complete: ${receipt.received} documents received across ${receipt.pages} pages.`);
    } catch (reason) {
      if (alive.current) setError(reason instanceof Error ? reason.message : 'Import failed');
    } finally {
      if (alive.current) setImporting(null);
    }
  }

  return { sources, documents, importing, error, message, importSource };
}
