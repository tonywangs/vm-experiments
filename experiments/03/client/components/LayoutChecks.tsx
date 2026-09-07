import { useEffect, useState } from 'react';
import { api } from '../api';
import type { LayoutSuggestion, Revision } from '../types';

interface Props {
  revision: Revision;
  onUse: (suggestion: LayoutSuggestion) => void;
}

export function LayoutChecks({ revision, onUse }: Props) {
  const [suggestions, setSuggestions] = useState<LayoutSuggestion[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [requested, setRequested] = useState(false);

  useEffect(() => {
    setSuggestions(null);
    setRequested(false);
  }, [revision.id]);

  useEffect(() => {
    if (!requested) return;
    const controller = new AbortController();
    setLoading(true);
    setError(null);
    void api.suggestions(revision.frameId, revision.id, controller.signal)
      .then(value => { if (!controller.signal.aborted) setSuggestions(value); })
      .catch((reason: unknown) => {
        if (!controller.signal.aborted) setError(reason instanceof Error ? reason.message : 'Layout check failed.');
      })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [revision.frameId, revision.id, requested]);

  return (
    <section className="layout-checks">
      <div className="eyebrow">LOCAL ASSISTANT</div>
      <h2>A second pair of eyes</h2>
      <p>Generate deterministic prompts for reviewing this screenshot. Suggestions become comments only after you save them.</p>
      {!suggestions && <button className="secondary" disabled={loading} onClick={() => setRequested(true)}>{loading ? 'Checking…' : 'Run layout check'}</button>}
      {error && <p role="alert">{error}</p>}
      {suggestions?.map(suggestion => <button className="suggestion" key={suggestion.label} onClick={() => onUse(suggestion)}>{suggestion.label}<span>Use as draft →</span></button>)}
    </section>
  );
}
