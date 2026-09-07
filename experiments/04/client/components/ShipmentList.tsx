import type { Shipment } from "../types";
import { StatusBadge } from "./StatusBadge";

export function ShipmentList({
  shipments,
  selectedId,
  onSelect,
}: {
  shipments: Shipment[];
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  return (
    <nav aria-label="Shipments" className="shipment-list">
      <div className="section-label">
        Active shipments <span>{shipments.length}</span>
      </div>
      {shipments.map((shipment) => (
        <button
          key={shipment.id}
          className={
            selectedId === shipment.id ? "shipment selected" : "shipment"
          }
          aria-pressed={selectedId === shipment.id}
          onClick={() => onSelect(shipment.id)}
        >
          <div className="shipment-title">
            {shipment.recipient}
            <span>↗</span>
          </div>
          <div className="muted">{shipment.item}</div>
          <div className="shipment-footer">
            <StatusBadge status={shipment.status} />
            <small>v{shipment.revision}</small>
          </div>
        </button>
      ))}
    </nav>
  );
}
