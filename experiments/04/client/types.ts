export type ShipmentStatus = "label_created" | "in_transit" | "delivered";
export interface Shipment {
  id: string;
  recipient: string;
  destination: string;
  item: string;
  carrier: string;
  revision: number;
  status: ShipmentStatus;
  location: string;
  updatedAt: string;
}
export interface ShipmentEvent {
  eventId: string;
  shipmentId: string;
  revision: number;
  status: ShipmentStatus;
  location: string;
  occurredAt: string;
}
export interface Delivery {
  id: string;
  eventId: string;
  shipmentId: string;
  event: ShipmentEvent;
  status: "received" | "applied" | "duplicate" | "ignored" | "failed";
  error: string | null;
  replayOf: string | null;
  receivedAt: string;
}
export interface JournalEntry {
  id: number;
  eventId: string;
  deliveryId: string;
  shipmentId: string;
  revision: number;
  status: ShipmentStatus;
  recordedAt: string;
}
export interface ShipmentDetail {
  shipment: Shipment;
  deliveries: Delivery[];
  journal: JournalEntry[];
}
export interface Scenario {
  id: string;
  title: string;
  description: string;
}
