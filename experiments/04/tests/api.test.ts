import { afterAll, beforeAll, expect, it } from "vitest";
import type { Server } from "node:http";
import { createApp } from "../server/app";

const app = createApp({ databasePath: ":memory:" });
let server: Server;
let base: string;
beforeAll(async () => {
  server = app.listen(0, "127.0.0.1");
  await new Promise<void>((resolve) => server.once("listening", resolve));
  base = `http://127.0.0.1:${(server.address() as { port: number }).port}`;
});
afterAll(async () => {
  await new Promise<void>((resolve, reject) =>
    server.close((error) => (error ? reject(error) : resolve())),
  );
  app.locals.store.close();
});
it("serves health and local simulator configuration", async () => {
  expect(await (await fetch(`${base}/api/health`)).json()).toEqual({
    ok: true,
    service: "parcelroom",
  });
  expect(
    await (await fetch(`${base}/api/simulator/scenarios`)).json(),
  ).toHaveLength(4);
});
it("rejects a malformed delivery and still serves the workspace", async () => {
  const result = await fetch(`${base}/api/webhooks/parcelwave`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: "{}",
  });
  expect(result.status).toBe(400);
  expect((await fetch(`${base}/api/shipments`)).status).toBe(200);
});
