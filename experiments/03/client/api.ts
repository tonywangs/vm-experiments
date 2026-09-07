import type { Annotation, Frame, LayoutSuggestion, Point, ReviewDetail } from './types';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, init);
  const payload = await response.json();
  if (!response.ok) throw new Error(payload.error || `Request failed (${response.status}).`);
  return payload as T;
}

function revisionPath(frameId: string, revisionId: string): string {
  return `/api/frames/${encodeURIComponent(frameId)}/revisions/${encodeURIComponent(revisionId)}`;
}

export const api = {
  async frames(signal?: AbortSignal): Promise<Frame[]> {
    return (await request<{ frames: Frame[] }>('/api/frames', { signal })).frames;
  },
  detail(frameId: string, revisionId?: string, signal?: AbortSignal): Promise<ReviewDetail> {
    const query = revisionId ? `?revision=${encodeURIComponent(revisionId)}` : '';
    return request(`/api/frames/${encodeURIComponent(frameId)}${query}`, { signal });
  },
  async annotate(frameId: string, revisionId: string, point: Point, body: string): Promise<Annotation> {
    const result = await request<{ annotation: Annotation }>(`${revisionPath(frameId, revisionId)}/annotations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...point, body }),
    });
    return result.annotation;
  },
  async suggestions(frameId: string, revisionId: string, signal?: AbortSignal): Promise<LayoutSuggestion[]> {
    return (await request<{ suggestions: LayoutSuggestion[] }>(`${revisionPath(frameId, revisionId)}/suggestions`, { signal })).suggestions;
  },
};
