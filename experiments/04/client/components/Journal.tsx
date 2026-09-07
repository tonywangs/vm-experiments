import type { JournalEntry } from "../types";
import { StatusBadge } from "./StatusBadge";

export function Journal({ entries }: { entries: JournalEntry[] }) {
  return (
    <section className="panel journal" aria-label="Processed event journal">
      <div className="panel-heading">
        <div>
          <h2>Processed events</h2>
          <p>Durable event history for this shipment</p>
        </div>
        <span className="count">{entries.length}</span>
      </div>
      {!entries.length ? (
        <div className="empty">The event journal is empty.</div>
      ) : (
        <ol>
          {entries.map((entry) => (
            <li key={entry.id}>
              <div className="journal-dot" />
              <div>
                <div className="journal-top">
                  <strong>Revision {entry.revision}</strong>
                  <StatusBadge status={entry.status} />
                </div>
                <code>{entry.eventId}</code>
                <small>
                  Received {new Date(entry.recordedAt).toLocaleTimeString()}
                </small>
              </div>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
