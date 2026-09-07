import type { Server } from "node:http";
import { afterEach, expect, test } from "vitest";
import { createApp } from "../server/app";
import { createStore, type Store } from "../server/store";

let server: Server;
let store: Store;
afterEach(async () => {
  if (server) await new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
  store?.close();
});

async function serve() {
  store = createStore(":memory:");
  const app = createApp({ store });
  server = app.listen(0, "127.0.0.1");
  await new Promise<void>((resolve) => server.once("listening", resolve));
  const address = server.address();
  if (!address || typeof address === "string") throw new Error("Missing test port");
  return `http://127.0.0.1:${address.port}`;
}

test("API liveness and batch creation work without a worker", async () => {
  const url = await serve();
  expect((await fetch(`${url}/api/health`)).status).toBe(200);
  const response = await fetch(`${url}/api/batches`, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: "  New campaign  ", size: "small" }),
  });
  expect(response.status).toBe(202);
  const batch = await response.json();
  expect(batch).toMatchObject({ name: "New campaign", status: "queued", total: 4 });
  const detail = await (await fetch(`${url}/api/batches/${batch.id}`)).json();
  expect(detail.items).toHaveLength(4);
});

test("rejects invalid input and prevents exporting unfinished work", async () => {
  const url = await serve();
  expect((await fetch(`${url}/api/batches`, {
    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: "", size: "small" }),
  })).status).toBe(400);
  const batch = store.createBatch("Unfinished", "small");
  expect((await fetch(`${url}/api/batches/${batch.id}/export`)).status).toBe(409);
  expect((await fetch(`${url}/api/batches/${batch.id}/retry`, { method: "POST" })).status).toBe(409);
});
