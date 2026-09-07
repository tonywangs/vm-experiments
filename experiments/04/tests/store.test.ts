import { afterEach, describe, expect, it } from "vitest";
import { createStore, type Store } from "../server/repository";
import { createReceiver } from "../server/delivery";
import { makeScenario } from "../server/fixtures/provider";

let store: Store;
afterEach(() => store?.close());
describe("local workspace", () => {
  it("seeds three independent shipment snapshots", () => {
    store = createStore(":memory:");
    expect(store.listShipments()).toHaveLength(3);
    expect(store.getDetail("box-atlas")?.journal).toEqual([]);
    expect(store.getShipment("missing")).toBeNull();
  });
  it("records a normal update and its delivery payload", () => {
    store = createStore(":memory:");
    const envelope = makeScenario(store.getShipment("box-atlas")!, "normal")[0];
    const result = createReceiver(store).receive(envelope);
    expect(result.status).toBe("applied");
    expect(result.event).toEqual(envelope.event);
    expect(store.getDetail("box-atlas")?.journal).toHaveLength(1);
    expect(store.getShipment("box-atlas")?.revision).toBe(2);
    expect(store.getShipment("box-relay")?.revision).toBe(1);
  });
  it("can explicitly reset the prototype data", () => {
    store = createStore(":memory:");
    createReceiver(store).receive(
      makeScenario(store.getShipment("box-atlas")!, "normal")[0],
    );
    store.seed(true);
    expect(store.getShipment("box-atlas")?.revision).toBe(1);
    expect(store.getDetail("box-atlas")?.deliveries).toHaveLength(0);
  });
});
