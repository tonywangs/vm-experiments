import express from "express";
import { createStore, type Store } from "./repository";
import { createReceiver } from "./delivery";
import { getDatabasePath } from "./env";
import { makeScenario, scenarios } from "./fixtures/provider";
import { parseEnvelope } from "./validation";
import type { Scenario } from "./types";

export function createApp(
  options: { databasePath?: string; store?: Store } = {},
) {
  const store =
    options.store || createStore(options.databasePath || getDatabasePath());
  const receiver = createReceiver(store);
  const app = express();
  app.locals.store = store;
  app.locals.receiver = receiver;
  app.use(express.json({ limit: "32kb" }));
  app.get("/api/health", (_request, response) =>
    response.json({ ok: true, service: "parcelroom" }),
  );
  app.get("/api/shipments", (_request, response) =>
    response.json(store.listShipments()),
  );
  app.get("/api/shipments/:id", (request, response) => {
    const detail = store.getDetail(request.params.id);
    if (!detail)
      return response.status(404).json({ error: "Shipment not found" });
    return response.json(detail);
  });
  app.get("/api/simulator/scenarios", (_request, response) =>
    response.json(scenarios),
  );
  app.post("/api/simulator/play", (request, response) => {
    const shipment = store.getShipment(String(request.body?.shipmentId || ""));
    const scenario = String(request.body?.scenario || "") as Scenario;
    if (!shipment || !scenarios.some((value) => value.id === scenario)) {
      return response
        .status(400)
        .json({ error: "Choose an existing shipment and simulator scenario" });
    }
    const deliveries = makeScenario(shipment, scenario).map((envelope) =>
      receiver.receive(envelope),
    );
    return response.status(201).json({ deliveries });
  });
  app.post("/api/webhooks/parcelwave", (request, response) => {
    const envelope = parseEnvelope(request.body);
    if (!envelope)
      return response
        .status(400)
        .json({ error: "Invalid Parcelwave envelope" });
    if (!store.getShipment(envelope.event.shipmentId))
      return response.status(404).json({ error: "Shipment not found" });
    if (store.getDelivery(envelope.deliveryId))
      return response
        .status(409)
        .json({
          error:
            "Delivery ID already recorded; redelivery requires a fresh envelope ID",
        });
    return response.status(202).json(receiver.receive(envelope));
  });
  app.use((_request, response) =>
    response.status(404).json({ error: "Route not found" }),
  );
  app.use(
    (
      error: Error,
      _request: express.Request,
      response: express.Response,
      _next: express.NextFunction,
    ) => {
      console.error(
        JSON.stringify({ action: "request.error", error: error.message }),
      );
      response.status(500).json({ error: "Request could not be completed" });
    },
  );
  return app;
}
