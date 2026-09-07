export type { Analysis, Asset, Batch, BatchDetail, BatchEvent, BatchItem, BatchSize, BatchStatus } from "../server/types";
import type { Asset, BatchSize } from "../server/types";

export interface Catalog {
  assets: Asset[];
  sizes: Array<{ id: BatchSize; label: string; count: number; description: string }>;
}
