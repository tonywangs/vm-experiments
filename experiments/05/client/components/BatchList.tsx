import type { Batch } from "../types";
import { StatusBadge } from "./StatusBadge";

export function BatchList({ batches, selectedId, onSelect }: {
  batches: Batch[]; selectedId: string | null; onSelect: (id: string) => void;
}) {
  return <section className="batch-list" aria-label="Review batches">
    <div className="section-heading"><h2>All reviews</h2><span>{batches.length}</span></div>
    {!batches.length && <p className="empty">Create a batch to begin reviewing.</p>}
    {batches.map((batch) => <button key={batch.id} type="button"
      className={`batch-button ${selectedId === batch.id ? "selected" : ""}`}
      onClick={() => onSelect(batch.id)} aria-pressed={selectedId === batch.id}>
      <strong>{batch.name}</strong>
      <span className="batch-meta">{batch.total} frames · {new Date(batch.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}</span>
      <StatusBadge status={batch.status} />
    </button>)}
  </section>;
}
