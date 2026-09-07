import { useState } from "react";
import { api } from "../api";
import type { Asset, BatchDetail } from "../types";
import { AssetGrid } from "./AssetGrid";
import { EventTimeline } from "./EventTimeline";
import { StatusBadge } from "./StatusBadge";

export function Review({ detail, assets, onRefresh }: {
  detail: BatchDetail; assets: Asset[]; onRefresh: () => void;
}) {
  const { batch } = detail;
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  async function retry() {
    setBusy(true); setError(null);
    try { await api.retry(batch.id); onRefresh(); }
    catch (reason) { setError((reason as Error).message); }
    finally { setBusy(false); }
  }
  return <section className="review" aria-label="Selected review">
    <header className="review-heading">
      <div><p className="eyebrow">Contact sheet</p><h2>{batch.name}</h2>
        <p className="muted">{batch.total} frames · Created {new Date(batch.createdAt).toLocaleString()}</p></div>
      <StatusBadge status={batch.status} />
    </header>
    <div className="review-toolbar">
      <div><strong>{batch.finished}</strong><span className="muted"> / {batch.total} frames reviewed</span>
        <progress aria-label="Frames reviewed" value={batch.finished} max={batch.total} /></div>
      {batch.status === "completed" && <a className="secondary" href={`/api/batches/${encodeURIComponent(batch.id)}/export`} download>Download JSON ↓</a>}
      {batch.status === "failed" && <button type="button" className="secondary" disabled={busy} onClick={() => void retry()}>
        {busy ? "Queuing…" : "Retry review"}</button>}
    </div>
    {batch.status === "queued" && <div className="notice">Your frames are in the queue. This view updates automatically.</div>}
    {batch.error && <div className="notice error-notice" role="alert"><strong>Review could not finish</strong><p>{batch.error}</p></div>}
    {error && <p className="error-text" role="alert">{error}</p>}
    <AssetGrid items={detail.items} assets={assets} />
    <EventTimeline events={detail.events} />
    <p className="footnote record-id">Batch {batch.id} · Attempts {batch.attempts}</p>
  </section>;
}
