import { EvidenceList } from './EvidenceList';
import type { Capture } from '../types';

export function CaptureViewer({
  capture,
  selectedEvidence,
  onSelectEvidence,
}: {
  capture: Capture;
  selectedEvidence: string | null;
  onSelectEvidence: (id: string | null) => void;
}) {
  return (
    <>
      <div className="capture-heading">
        <span className="category-pill">{capture.category}</span>
        <span className="saved-label">SAVED CAPTURE</span>
        <h2 data-testid="capture-title">{capture.title}</h2>
        <p>{capture.description}</p>
      </div>
      <figure className="capture-frame">
        <div className="browser-chrome">
          <span />
          <span />
          <span />
          <div>{new URL(capture.sourceUrl).hostname}</div>
          <span className="capture-lock" aria-hidden="true">
            ↗
          </span>
        </div>
        <img
          src={capture.imageUrl}
          alt={`Saved screenshot of ${capture.title}`}
        />
        <figcaption>
          <span>
            Captured{' '}
            {new Date(capture.capturedAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
            })}
          </span>
          <span>Static evidence</span>
        </figcaption>
      </figure>
      <EvidenceList
        evidence={capture.evidence}
        selectedId={selectedEvidence}
        onSelect={onSelectEvidence}
      />
    </>
  );
}
