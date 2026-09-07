import { useState, type FormEvent } from "react";
import { api } from "../api";
import type { BatchSize, Catalog } from "../types";

export function Composer({ catalog, onCreated }: { catalog: Catalog | null; onCreated: (id: string) => void }) {
  const [name, setName] = useState("");
  const [size, setSize] = useState<BatchSize>("small");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true); setError(null);
    try {
      const batch = await api.create(name.trim(), size);
      onCreated(batch.id);
      setName("");
    } catch (reason) { setError((reason as Error).message); }
    finally { setBusy(false); }
  }

  return <form className="composer" onSubmit={(event) => void submit(event)}>
    <p className="eyebrow">New batch</p>
    <h2>Bring your frames together.</h2>
    <label htmlFor="batch-name">Review name</label>
    <input id="batch-name" value={name} onChange={(event) => setName(event.target.value)}
      placeholder="e.g. September campaign" maxLength={80} required />
    <label htmlFor="batch-size">Collection</label>
    <select id="batch-size" value={size} onChange={(event) => setSize(event.target.value as BatchSize)}>
      {(catalog?.sizes || []).map((entry) => <option key={entry.id} value={entry.id}>{entry.label} · {entry.count} frames</option>)}
    </select>
    <p className="muted composer-description">{catalog?.sizes.find((entry) => entry.id === size)?.description}</p>
    {error && <p role="alert" className="error-text">{error}</p>}
    <button className="primary" disabled={busy || !catalog || !name.trim()} type="submit">
      {busy ? "Submitting…" : "Start review"}<span aria-hidden="true">↗</span>
    </button>
    <p className="footnote">Local collection · No external provider account needed</p>
  </form>;
}
