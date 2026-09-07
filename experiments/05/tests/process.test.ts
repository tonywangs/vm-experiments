import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { afterEach, describe, expect, test } from "vitest";
import { createStore, type Store } from "../server/store";
import { processBatch } from "../server/process";

let store: Store;
let directory: string;
afterEach(async () => {
  store?.close();
  if (directory) await rm(directory, { recursive: true, force: true });
});

describe("local visual reviews", () => {
  test.each(["small", "launch"] as const)("completes and exports the %s collection", async (size) => {
    directory = await mkdtemp(join(tmpdir(), "contactsheet-test-"));
    store = createStore(join(directory, "review.sqlite"));
    store.createBatch("Test collection", size);
    const batch = store.claim()!;
    await processBatch(store, batch, { concurrency: 96, assetDir: resolve("public/assets"), exportDir: directory });
    const completed = store.getBatch(batch.id)!;
    expect(completed.status).toBe("completed");
    expect(completed.finished).toBe(batch.total);
    const exported = JSON.parse(await readFile(join(directory, completed.exportName!), "utf8"));
    expect(exported.items).toHaveLength(batch.total);
    expect(exported.items[0].analysis.model).toBe("local-vision-2026-08");
    expect(exported.items.map((item: { ordinal: number }) => item.ordinal))
      .toEqual(Array.from({ length: batch.total }, (_, ordinal) => ordinal));
  });
});
