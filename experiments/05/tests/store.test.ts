import { afterEach, describe, expect, test } from "vitest";
import { createStore, type Store } from "../server/store";

let store: Store;
afterEach(() => store?.close());

describe("queue records", () => {
  test("claims a batch once and preserves its ID through retry", () => {
    store = createStore(":memory:");
    const batch = store.createBatch("Homepage", "small");
    expect(batch.total).toBe(4);
    expect(store.claim()?.id).toBe(batch.id);
    expect(store.claim()).toBeUndefined();
    store.fail(batch.id, "Temporary provider error");
    expect(store.retry(batch.id)?.id).toBe(batch.id);
    expect(store.claim()?.attempts).toBe(2);
    expect(store.detail(batch.id)?.events.map((event) => event.kind)).toEqual([
      "processing", "queued", "failed", "processing", "queued",
    ]);
  });

  test("recovers interrupted work without changing completed batches", () => {
    store = createStore(":memory:");
    const completed = store.createBatch("Previous review", "small");
    store.complete(completed.id, `${completed.id}.json`);
    const queued = store.createBatch("In flight", "launch");
    store.claim();
    expect(store.recoverInterrupted()).toBe(1);
    expect(store.getBatch(queued.id)?.status).toBe("queued");
    expect(store.getBatch(completed.id)?.status).toBe("completed");
    expect(store.getItems(queued.id)).toHaveLength(72);
  });
});
