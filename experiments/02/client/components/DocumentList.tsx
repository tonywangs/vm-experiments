import type { Document } from '../types';

interface Props {
  documents: Document[];
  onOpen: (document: Document) => void;
  title?: string;
}

export function DocumentList({ documents, onOpen, title = 'Library' }: Props) {
  return (
    <section className="document-list" aria-label={title}>
      <div className="section-heading"><h2>{title}</h2><span>{documents.length} documents</span></div>
      {documents.length === 0 && <p className="empty-state">No documents in this view. Import a source or broaden your search.</p>}
      {documents.map((document) => (
        <button key={document.id} className="document-row" onClick={() => onOpen(document)}>
          <span className="document-symbol" aria-hidden="true">▤</span>
          <span className="document-summary">
            <strong>{document.title}</strong>
            <span>{document.sourceName} · {document.tags.join(' / ')}</span>
            <p>{document.body.slice(0, 135)}…</p>
          </span>
          <span className="arrow" aria-hidden="true">↗</span>
        </button>
      ))}
    </section>
  );
}
