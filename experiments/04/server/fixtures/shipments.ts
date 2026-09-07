import type { Shipment } from "../types";

export const seedShipments: Shipment[] = [
  {
    id: "box-atlas",
    recipient: "Maya Chen",
    destination: "San Francisco, CA",
    item: "Field recorder",
    carrier: "Parcelwave",
    revision: 1,
    status: "label_created",
    location: "Oakland warehouse",
    updatedAt: "2026-06-12T09:00:00.000Z",
  },
  {
    id: "box-relay",
    recipient: "Sam Rivera",
    destination: "Portland, OR",
    item: "Desk lamp",
    carrier: "Parcelwave",
    revision: 1,
    status: "label_created",
    location: "Seattle warehouse",
    updatedAt: "2026-06-12T09:10:00.000Z",
  },
  {
    id: "box-prism",
    recipient: "Alex Park",
    destination: "Los Angeles, CA",
    item: "Studio headphones",
    carrier: "Parcelwave",
    revision: 1,
    status: "label_created",
    location: "San Diego warehouse",
    updatedAt: "2026-06-12T09:20:00.000Z",
  },
];
