import type { DeliveryEnvelope, ShipmentEvent } from "./types";

export function parseEnvelope(value: unknown): DeliveryEnvelope | null {
  if (!value || typeof value !== "object") return null;
  const envelope = value as Record<string, unknown>;
  const event = envelope.event as Record<string, unknown> | undefined;
  if (
    typeof envelope.deliveryId !== "string" ||
    !envelope.deliveryId ||
    !event ||
    typeof event !== "object"
  )
    return null;
  if (
    typeof event.eventId !== "string" ||
    !event.eventId ||
    typeof event.shipmentId !== "string" ||
    !event.shipmentId
  )
    return null;
  if (!Number.isSafeInteger(event.revision) || Number(event.revision) < 1)
    return null;
  if (
    !["label_created", "in_transit", "delivered"].includes(String(event.status))
  )
    return null;
  if (
    typeof event.location !== "string" ||
    typeof event.occurredAt !== "string" ||
    !Number.isFinite(Date.parse(event.occurredAt))
  )
    return null;
  if (
    envelope.failAfterJournal !== undefined &&
    typeof envelope.failAfterJournal !== "boolean"
  )
    return null;
  return {
    deliveryId: envelope.deliveryId,
    event: event as unknown as ShipmentEvent,
    failAfterJournal: envelope.failAfterJournal === true,
  };
}
