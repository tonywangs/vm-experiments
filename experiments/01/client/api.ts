import type { CaptureDetail, CaptureSummary, Profile, Run } from './types';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`/api${path}`, init);
  const body = await response.json();
  if (!response.ok) throw new Error(body.error || `Request failed (${response.status})`);
  return body as T;
}

export async function listCaptures(): Promise<CaptureSummary[]> {
  const data = await request<{ captures: CaptureSummary[] }>('/captures');
  return data.captures;
}

export function getCapture(id: string): Promise<CaptureDetail> {
  return request(`/captures/${encodeURIComponent(id)}`);
}

export async function startAnalysis(captureId: string, question: string, profile: Profile): Promise<Run> {
  const data = await request<{ run: Run }>(`/captures/${encodeURIComponent(captureId)}/runs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question, profile }),
  });
  return data.run;
}
