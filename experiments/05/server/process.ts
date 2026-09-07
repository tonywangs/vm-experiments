import { analyzeAsset } from "./adapter";
import { exportDocument, writeExport } from "./export";
import { describeError, log } from "./log";
import type { Store } from "./store";
import type { Batch } from "./types";

export async function processBatch(store: Store, batch: Batch, options: {
  concurrency: number; assetDir: string; exportDir: string;
}) {
  const items = store.getItems(batch.id);
  let cursor = 0;
  const failures: string[] = [];
  log("batch.started", { batchId: batch.id, total: batch.total, concurrency: options.concurrency });

  async function consume() {
    while (cursor < items.length) {
      const item = items[cursor++];
      try {
        const analysis = await analyzeAsset(item.assetId, options.assetDir);
        store.completeItem(item.id, analysis);
      } catch (error) {
        const message = describeError(error);
        failures.push(message);
        store.failItem(item.id, message);
        log("item.failed", { batchId: batch.id, ordinal: item.ordinal, error: message });
      }
    }
  }

  try {
    await Promise.all(Array.from({ length: Math.min(items.length, options.concurrency) }, consume));
    if (failures.length) throw new Error(`${failures.length} frame(s) could not be analyzed: ${failures[0]}`);
    const document = exportDocument(batch, store.getItems(batch.id));
    const name = await writeExport(options.exportDir, document);
    store.complete(batch.id, name);
    log("batch.completed", { batchId: batch.id, exportName: name, total: batch.total });
  } catch (error) {
    const message = describeError(error);
    store.fail(batch.id, message);
    log("batch.failed", { batchId: batch.id, error: message });
  }
}
