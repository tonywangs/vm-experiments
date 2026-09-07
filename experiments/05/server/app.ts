import express from "express";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { assets, sizes } from "./catalog";
import { configuration } from "./config";
import { createStore, type Store } from "./store";
import { describeError, log } from "./log";
import type { BatchSize } from "./types";

export function createApp(options: { store?: Store; databasePath?: string; exportDir?: string } = {}) {
  const config = configuration();
  const store = options.store || createStore(options.databasePath || config.databasePath);
  const exportDir = options.exportDir || config.exportDir;
  const app = express();
  app.locals.store = store;
  app.use(express.json({ limit: "16kb" }));
  app.get("/api/health", (_request, response) => response.json({ ok: true, service: "contactsheet" }));

  app.get("/api/catalog", (_request, response) => response.json({ assets, sizes }));
  app.get("/api/batches", (_request, response) => response.json(store.listBatches()));
  app.post("/api/batches", (request, response) => {
    const name = typeof request.body?.name === "string" ? request.body.name.trim() : "";
    const size = request.body?.size as BatchSize;
    if (!name || name.length > 80 || !sizes.some((entry) => entry.id === size)) {
      return response.status(400).json({ error: "Provide a name (1–80 characters) and select a review size." });
    }
    const batch = store.createBatch(name, size);
    log("batch.queued", { batchId: batch.id, name, total: batch.total });
    return response.status(202).json(batch);
  });
  app.get("/api/batches/:id", (request, response) => {
    const detail = store.detail(request.params.id);
    return detail ? response.json(detail) : response.status(404).json({ error: "Batch not found" });
  });
  app.post("/api/batches/:id/retry", (request, response) => {
    const existing = store.getBatch(request.params.id);
    if (!existing) return response.status(404).json({ error: "Batch not found" });
    const batch = store.retry(existing.id);
    if (!batch) return response.status(409).json({ error: "Only failed batches can be retried." });
    log("batch.retried", { batchId: batch.id });
    return response.status(202).json(batch);
  });
  app.get("/api/batches/:id/export", (request, response, next) => {
    const batch = store.getBatch(request.params.id);
    if (!batch) return response.status(404).json({ error: "Batch not found" });
    if (batch.status !== "completed" || !batch.exportName) {
      return response.status(409).json({ error: "This batch does not have a completed export." });
    }
    return response.download(resolve(exportDir, batch.exportName), `${batch.id}.json`, (error) => {
      if (error && !response.headersSent) next(error);
    });
  });
  app.use("/api", (_request, response) => response.status(404).json({ error: "API route not found" }));
  app.use("/assets", express.static(resolve("public/assets")));
  if (existsSync(resolve("dist/index.html"))) {
    app.use(express.static(resolve("dist")));
    app.get("/", (_request, response) => response.sendFile(resolve("dist/index.html")));
  }
  app.use((_request, response) => response.status(404).json({ error: "Route not found" }));
  app.use((error: Error, _request: express.Request, response: express.Response, _next: express.NextFunction) => {
    log("request.failed", { error: describeError(error) });
    response.status(500).json({ error: "Request could not be completed; consult the API log." });
  });
  return app;
}
