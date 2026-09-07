import { useEffect, useRef } from 'react';
import type { Evidence } from '../types';

export function EvidenceList({
  evidence,
  selectedId,
  onSelect,
}: {
  evidence: Evidence[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
}) {
  const listRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!selectedId) return;
    const node = listRef.current?.querySelector<HTMLElement>(
      `[data-evidence-id="${selectedId}"]`,
    );
    node?.scrollIntoView?.({ behavior: 'smooth', block: 'nearest' });
  }, [selectedId]);

  return (
    <div className="evidence-section" ref={listRef}>
      <div className="subsection-heading">
        <h3>Evidence from this capture</h3>
        <span>{evidence.length} EXCERPTS</span>
      </div>
      <p className="section-description">
        Text extracted alongside the screenshot.
      </p>
      <div className="evidence-list">
        {evidence.map((item, index) => (
          <button
            key={item.id}
            id={`evidence-${item.id}`}
            data-evidence-id={item.id}
            className={`evidence-item ${selectedId === item.id ? 'highlighted' : ''}`}
            onClick={() => onSelect(selectedId === item.id ? null : item.id)}
            aria-pressed={selectedId === item.id}
          >
            <span className="evidence-index">{index + 1}</span>
            <span>
              <strong>{item.label}</strong>
              <span className="evidence-text">“{item.text}”</span>
              <small>{item.region}</small>
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
