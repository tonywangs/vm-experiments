import type { SourceSummary } from '../types';

interface Props {
  source: SourceSummary;
  busy: boolean;
  disabled: boolean;
  onImport: () => void;
}

export function SourceCard({ source, busy, disabled, onImport }: Props) {
  return (
    <article className="source-card">
      <img src={source.icon} alt="" width="40" height="40" />
      <div className="source-copy">
        <h3>{source.name}</h3>
        <p>{source.description}</p>
        <span>{source.documentCount} documents</span>
        <small>{source.lastImport ? `Last imported ${new Date(source.lastImport.completedAt).toLocaleTimeString()}` : 'Local sample only'}</small>
      </div>
      <button disabled={disabled} onClick={onImport} aria-label={`Import ${source.name}`}>
        {busy ? 'Importing…' : 'Import source'}
      </button>
    </article>
  );
}
