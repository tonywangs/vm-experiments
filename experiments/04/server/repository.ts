import { DatabaseSync } from "node:sqlite";
import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { seedShipments } from "./fixtures/shipments";
import type {
  Delivery,
  DeliveryEnvelope,
  DeliveryStatus,
  JournalEntry,
  Shipment,
  ShipmentDetail,
  ShipmentEvent,
} from "./types";

type Row = Record<string, string | number | null>;

export function createStore(path: string) {
  if (path !== ":memory:") mkdirSync(dirname(path), { recursive: true });
  const db = new DatabaseSync(path);
  db.exec(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;
    CREATE TABLE IF NOT EXISTS shipments (
      id TEXT PRIMARY KEY, recipient TEXT NOT NULL, destination TEXT NOT NULL,
      item TEXT NOT NULL, carrier TEXT NOT NULL, revision INTEGER NOT NULL,
      status TEXT NOT NULL, location TEXT NOT NULL, updated_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS deliveries (
      id TEXT PRIMARY KEY, event_id TEXT NOT NULL, shipment_id TEXT NOT NULL,
      payload TEXT NOT NULL, status TEXT NOT NULL, error TEXT,
      replay_of TEXT, received_at TEXT NOT NULL,
      FOREIGN KEY(shipment_id) REFERENCES shipments(id)
    );
    CREATE TABLE IF NOT EXISTS event_journal (
      id INTEGER PRIMARY KEY AUTOINCREMENT, event_id TEXT NOT NULL,
      delivery_id TEXT NOT NULL UNIQUE, shipment_id TEXT NOT NULL,
      revision INTEGER NOT NULL, status TEXT NOT NULL, recorded_at TEXT NOT NULL,
      FOREIGN KEY(shipment_id) REFERENCES shipments(id)
    );
    CREATE INDEX IF NOT EXISTS deliveries_by_shipment ON deliveries(shipment_id);
    CREATE INDEX IF NOT EXISTS journal_by_shipment ON event_journal(shipment_id);
  `);

  function shipment(row: Row): Shipment {
    return {
      id: String(row.id),
      recipient: String(row.recipient),
      destination: String(row.destination),
      item: String(row.item),
      carrier: String(row.carrier),
      revision: Number(row.revision),
      status: row.status as Shipment["status"],
      location: String(row.location),
      updatedAt: String(row.updated_at),
    };
  }

  function delivery(row: Row): Delivery {
    return {
      id: String(row.id),
      eventId: String(row.event_id),
      shipmentId: String(row.shipment_id),
      event: JSON.parse(String(row.payload)),
      status: row.status as DeliveryStatus,
      error: row.error === null ? null : String(row.error),
      replayOf: row.replay_of === null ? null : String(row.replay_of),
      receivedAt: String(row.received_at),
    };
  }

  function getShipment(id: string): Shipment | null {
    const row = db.prepare("SELECT * FROM shipments WHERE id = ?").get(id) as
      | Row
      | undefined;
    return row ? shipment(row) : null;
  }

  function getDelivery(id: string): Delivery | null {
    const row = db.prepare("SELECT * FROM deliveries WHERE id = ?").get(id) as
      | Row
      | undefined;
    return row ? delivery(row) : null;
  }

  function listShipments(): Shipment[] {
    return (
      db.prepare("SELECT * FROM shipments ORDER BY id").all() as Row[]
    ).map(shipment);
  }

  function getDetail(id: string): ShipmentDetail | null {
    const value = getShipment(id);
    if (!value) return null;
    const deliveries = (
      db
        .prepare(
          "SELECT * FROM deliveries WHERE shipment_id = ? ORDER BY rowid DESC",
        )
        .all(id) as Row[]
    ).map(delivery);
    const journal = (
      db
        .prepare(
          "SELECT * FROM event_journal WHERE shipment_id = ? ORDER BY id DESC",
        )
        .all(id) as Row[]
    ).map((row) => ({
      id: Number(row.id),
      eventId: String(row.event_id),
      deliveryId: String(row.delivery_id),
      shipmentId: String(row.shipment_id),
      revision: Number(row.revision),
      status: row.status as JournalEntry["status"],
      recordedAt: String(row.recorded_at),
    }));
    return { shipment: value, deliveries, journal };
  }

  function openDelivery(
    envelope: DeliveryEnvelope,
    replayOf: string | null = null,
  ): void {
    db.prepare(
      `INSERT INTO deliveries(id, event_id, shipment_id, payload, status, replay_of, received_at)
      VALUES (?, ?, ?, ?, 'received', ?, ?)`,
    ).run(
      envelope.deliveryId,
      envelope.event.eventId,
      envelope.event.shipmentId,
      JSON.stringify(envelope.event),
      replayOf,
      new Date().toISOString(),
    );
  }

  function finishDelivery(
    id: string,
    status: DeliveryStatus,
    error: string | null = null,
  ): Delivery {
    db.prepare("UPDATE deliveries SET status = ?, error = ? WHERE id = ?").run(
      status,
      error,
      id,
    );
    return getDelivery(id)!;
  }

  function hasProcessed(deliveryId: string): boolean {
    return Boolean(
      db
        .prepare("SELECT 1 FROM event_journal WHERE delivery_id = ?")
        .get(deliveryId),
    );
  }

  function recordEvent(envelope: DeliveryEnvelope): void {
    const { event, deliveryId } = envelope;
    db.prepare(
      `INSERT INTO event_journal(event_id, delivery_id, shipment_id, revision, status, recorded_at)
      VALUES (?, ?, ?, ?, ?, ?)`,
    ).run(
      event.eventId,
      deliveryId,
      event.shipmentId,
      event.revision,
      event.status,
      new Date().toISOString(),
    );
  }

  function updateShipment(event: ShipmentEvent): void {
    db.prepare(
      "UPDATE shipments SET revision = ?, status = ?, location = ?, updated_at = ? WHERE id = ?",
    ).run(
      event.revision,
      event.status,
      event.location,
      event.occurredAt,
      event.shipmentId,
    );
  }

  function transaction<T>(operation: () => T): T {
    db.exec("BEGIN IMMEDIATE");
    try {
      const result = operation();
      db.exec("COMMIT");
      return result;
    } catch (error) {
      db.exec("ROLLBACK");
      throw error;
    }
  }

  function seed(reset = false): void {
    if (reset)
      db.exec(
        "DELETE FROM event_journal; DELETE FROM deliveries; DELETE FROM shipments;",
      );
    if (listShipments().length) return;
    const insert = db.prepare(
      "INSERT INTO shipments VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
    );
    for (const value of seedShipments) {
      insert.run(
        value.id,
        value.recipient,
        value.destination,
        value.item,
        value.carrier,
        value.revision,
        value.status,
        value.location,
        value.updatedAt,
      );
    }
  }

  seed();
  return {
    listShipments,
    getShipment,
    getDelivery,
    getDetail,
    openDelivery,
    finishDelivery,
    hasProcessed,
    recordEvent,
    updateShipment,
    transaction,
    seed,
    close: () => db.close(),
  };
}

export type Store = ReturnType<typeof createStore>;
