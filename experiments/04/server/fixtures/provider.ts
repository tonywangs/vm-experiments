import { randomUUID } from "node:crypto";
import type {
  DeliveryEnvelope,
  Scenario,
  Shipment,
  ShipmentEvent,
} from "../types";

export const scenarios: { id: Scenario; title: string; description: string }[] =
  [
    {
      id: "normal",
      title: "Normal update",
      description: "One newer snapshot arrives.",
    },
    {
      id: "duplicate",
      title: "Duplicate delivery",
      description:
        "One provider event arrives twice, in two delivery envelopes.",
    },
    {
      id: "out-of-order",
      title: "Late arrival",
      description:
        "A delivered snapshot arrives before an older in-transit snapshot.",
    },
    {
      id: "interrupted",
      title: "Interrupted apply",
      description:
        "A one-time storage failure interrupts a delivery after its journal write.",
    },
  ];

function snapshot(
  shipment: Shipment,
  revision: number,
  status: ShipmentEvent["status"],
): ShipmentEvent {
  return {
    eventId: `evt_${randomUUID()}`,
    shipmentId: shipment.id,
    revision,
    status,
    location:
      status === "delivered" ? shipment.destination : "Regional sorting center",
    occurredAt: new Date(Date.UTC(2026, 5, 12, 9, revision)).toISOString(),
  };
}

function envelope(
  event: ShipmentEvent,
  failAfterJournal = false,
): DeliveryEnvelope {
  return { deliveryId: `dlv_${randomUUID()}`, event, failAfterJournal };
}

export function makeScenario(
  shipment: Shipment,
  scenario: Scenario,
): DeliveryEnvelope[] {
  if (scenario === "out-of-order") {
    return [
      envelope(snapshot(shipment, shipment.revision + 2, "delivered")),
      envelope(snapshot(shipment, shipment.revision + 1, "in_transit")),
    ];
  }
  const event = snapshot(shipment, shipment.revision + 1, "in_transit");
  if (scenario === "duplicate") return [envelope(event), envelope(event)];
  return [envelope(event, scenario === "interrupted")];
}
