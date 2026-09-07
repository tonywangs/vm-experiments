import type { ReviewDetail } from '../types';

interface Props {
  detail: ReviewDetail;
  zoom: number;
  onRevision: (id: string) => void;
  onZoom: (value: number) => void;
}

export function ReviewToolbar({ detail, zoom, onRevision, onZoom }: Props) {
  return (
    <header className="review-toolbar">
      <div><h1>{detail.frame.title}</h1><p>{detail.revision.width} × {detail.revision.height} · Click the image to leave a comment.</p></div>
      <div className="toolbar-controls">
        <label>Revision
          <select aria-label="Revision" value={detail.revision.id} onChange={event => onRevision(event.target.value)}>
            {detail.revisions.map(revision => <option key={revision.id} value={revision.id}>{revision.label}</option>)}
          </select>
        </label>
        <label>Zoom
          <select aria-label="Zoom" value={zoom} onChange={event => onZoom(Number(event.target.value))}>
            <option value={0.5}>50%</option><option value={0.75}>75%</option><option value={1}>100%</option>
          </select>
        </label>
      </div>
    </header>
  );
}
