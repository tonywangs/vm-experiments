import type { CaptureSummary } from '../types';

export function CaptureList({
  captures,
  selectedId,
  onSelect,
}: {
  captures: CaptureSummary[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  return (
    <nav className="capture-list" aria-label="Saved captures">
      {captures.map((capture, index) => (
        <button
          key={capture.id}
          className={`capture-item ${selectedId === capture.id ? 'selected' : ''}`}
          aria-current={selectedId === capture.id ? 'page' : undefined}
          data-testid={`capture-${capture.id}`}
          onClick={() => onSelect(capture.id)}
        >
          <span
            className={`capture-thumbnail thumbnail-${capture.id}`}
            aria-hidden="true"
          >
            {capture.title[0]}
          </span>
          <span className="capture-item-copy">
            <strong>{capture.title.split(' / ')[0]}</strong>
            <small>{capture.category}</small>
          </span>
          <span className="capture-number">0{index + 1}</span>
        </button>
      ))}
    </nav>
  );
}
