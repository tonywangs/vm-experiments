import type { Document, ImportReceipt, SearchInput, SearchResult, SourceSummary } from './types';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`/api${path}`, init);
  const body = await response.json();
  if (!response.ok) throw new Error(body.error || `Request failed (${response.status})`);
  return body as T;
}

export const api = {
  sources: () => request<{ sources: SourceSummary[] }>('/sources').then((body) => body.sources),
  documents: (sourceId?: string) => request<{ documents: Document[] }>(`/documents${sourceId ? `?sourceId=${encodeURIComponent(sourceId)}` : ''}`).then((body) => body.documents),
  importSource: (sourceId: string) => request<{ receipt: ImportReceipt }>(`/sources/${encodeURIComponent(sourceId)}/import`, { method: 'POST' }).then((body) => body.receipt),
  search: (input: SearchInput) => request<SearchResult>('/search', {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(input),
  }),
};
