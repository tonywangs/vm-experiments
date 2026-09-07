import type { Shipment } from "../types";
import { StatusBadge } from "./StatusBadge";

export function ShipmentSummary({ shipment }: { shipment: Shipment }) {
  return (
    <section className="summary" aria-label="Current shipment snapshot">
      <div className="summary-icon" aria-hidden="true">
        ▱
      </div>
      <div className="summary-main">
        <div className="eyebrow">
          {shipment.id} · {shipment.carrier}
        </div>
        <h1>{shipment.item}</h1>
        <p>
          {shipment.recipient}{" "}
          <span className="muted">→ {shipment.destination}</span>
        </p>
      </div>
      <div className="summary-state">
        <StatusBadge status={shipment.status} />
        <strong>Revision {shipment.revision}</strong>
        <span>{shipment.location}</span>
        <small>
          Provider time {new Date(shipment.updatedAt).toLocaleTimeString()}
        </small>
      </div>
    </section>
  );
}
