export type BatchSize = "small" | "launch";
export type BatchStatus = "queued" | "processing" | "completed" | "failed";

export interface Asset {
  id: string;
  title: string;
  filename: string;
  accent: string;
}

export interface Analysis {
  summary: string;
  palette: string;
  attention: "clear" | "review";
  model: string;
}

export interface Batch {
  id: string;
  name: string;
  size: BatchSize;
  status: BatchStatus;
  total: number;
  finished: number;
  attempts: number;
  createdAt: string;
  updatedAt: string;
  error: string | null;
  exportName: string | null;
}

export interface BatchItem {
  id: string;
  batchId: string;
  ordinal: number;
  assetId: string;
  status: "pending" | "completed" | "failed";
  analysis: Analysis | null;
  error: string | null;
}

export interface BatchEvent {
  id: number;
  batchId: string;
  kind: string;
  message: string;
  at: string;
}

export interface BatchDetail {
  batch: Batch;
  items: BatchItem[];
  events: BatchEvent[];
}

export interface ExportDocument {
  schemaVersion: 1;
  batchId: string;
  name: string;
  createdAt: string;
  total: number;
  items: Array<{ ordinal: number; assetId: string; analysis: Analysis }>;
}
