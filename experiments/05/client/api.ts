import type { Batch, BatchDetail, BatchSize, Catalog } from "./types";

async function request<T>(url: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(url, options);
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || `Request failed (${response.status})`);
  return result as T;
}

export const api = {
  catalog: (signal?: AbortSignal) => request<Catalog>("/api/catalog", { signal }),
  batches: (signal?: AbortSignal) => request<Batch[]>("/api/batches", { signal }),
  detail: (id: string, signal?: AbortSignal) => request<BatchDetail>(`/api/batches/${encodeURIComponent(id)}`, { signal }),
  create: (name: string, size: BatchSize) => request<Batch>("/api/batches", {
    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, size }),
  }),
  retry: (id: string) => request<Batch>(`/api/batches/${encodeURIComponent(id)}/retry`, { method: "POST" }),
};
