import { useState } from "react";
import type { Delivery } from "../types";
import { StatusBadge } from "./StatusBadge";

export function DeliveryList({ deliveries }: { deliveries: Delivery[] }) {
  const [expanded, setExpanded] = useState<string | null>(null);
  return (
    <section className="panel" aria-label="Delivery inbox">
      <div className="panel-heading">
        <div>
          <h2>Delivery inbox</h2>
          <p>Every envelope, including failures and redeliveries</p>
        </div>
        <span className="count">{deliveries.length}</span>
      </div>
      {!deliveries.length ? (
        <div className="empty">
          No deliveries yet. Send an update above to populate the inbox.
        </div>
      ) : (
        <div className="delivery-list">
          {deliveries.map((delivery) => (
            <article className="delivery-row" key={delivery.id}>
              <div className="delivery-header">
                <button
                  className="text-button"
                  onClick={() =>
                    setExpanded(expanded === delivery.id ? null : delivery.id)
                  }
                  aria-expanded={expanded === delivery.id}
                >
                  {delivery.id.slice(0, 16)}…
                </button>
                <StatusBadge status={delivery.status} />
              </div>
              <div className="delivery-meta">
                <span>Revision {delivery.event.revision}</span>
                <span>
                  {new Date(delivery.receivedAt).toLocaleTimeString()}
                </span>
              </div>
              <div className="event-id">Event {delivery.eventId}</div>
              {delivery.replayOf && (
                <p className="replay-context">Replay of {delivery.replayOf}</p>
              )}
              {delivery.error && (
                <p role="alert" className="error">
                  {delivery.error}
                </p>
              )}
              {expanded === delivery.id && (
                <pre aria-label="Provider event payload">
                  {JSON.stringify(delivery.event, null, 2)}
                </pre>
              )}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
