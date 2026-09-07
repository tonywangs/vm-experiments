import { mkdir, rename, writeFile, unlink } from "node:fs/promises";
import { join } from "node:path";
import type { Batch, BatchItem, ExportDocument } from "./types";

export function exportDocument(batch: Batch, items: BatchItem[]): ExportDocument {
  if (items.length !== batch.total || items.some((item) => !item.analysis || item.status !== "completed")) {
    throw new Error("Cannot export an incomplete review");
  }
  return {
    schemaVersion: 1, batchId: batch.id, name: batch.name,
    createdAt: batch.createdAt, total: batch.total,
    items: items.map((item) => ({ ordinal: item.ordinal, assetId: item.assetId, analysis: item.analysis! })),
  };
}

export async function writeExport(directory: string, document: ExportDocument) {
  await mkdir(directory, { recursive: true });
  const name = `${document.batchId}.json`;
  const temporary = join(directory, `.${document.batchId}.${process.pid}.tmp`);
  try {
    await writeFile(temporary, JSON.stringify(document, null, 2) + "\n", { flag: "wx" });
    await rename(temporary, join(directory, name));
  } catch (error) {
    await unlink(temporary).catch(() => undefined);
    throw error;
  }
  return name;
}
