import type { MouseEvent } from 'react';
import { clickToPoint, pointStyle } from '../geometry';
import type { Annotation, DraftPin, Point, Revision } from '../types';

interface Props {
  revision: Revision;
  annotations: Annotation[];
  draft: DraftPin | null;
  zoom: number;
  selectedAnnotationId: string | null;
  onPlace: (point: Point) => void;
  onSelect: (id: string) => void;
}

export function ImageCanvas({ revision, annotations, draft, zoom, selectedAnnotationId, onPlace, onSelect }: Props) {
  function place(event: MouseEvent<HTMLImageElement>) {
    const bounds = event.currentTarget.getBoundingClientRect();
    onPlace(clickToPoint(event.clientX, event.clientY, bounds, revision.width, revision.height));
  }

  return (
    <section className="canvas-scroll" aria-label="Review canvas">
      <div className="image-stage" style={{ width: revision.width * zoom, maxWidth: '100%' }}>
        <img className="review-image" src={revision.imageUrl} alt={`${revision.label} screenshot`}
          width={revision.width} height={revision.height} draggable={false} onClick={place} />
        {annotations.map((pin, index) => (
          <button key={pin.id} type="button" title={pin.body}
            aria-label={`Open comment ${index + 1}`}
            className={`pin ${pin.resolved ? 'resolved' : ''} ${pin.id === selectedAnnotationId ? 'active' : ''}`}
            style={pointStyle(pin)} onClick={() => onSelect(pin.id)}>{index + 1}</button>
        ))}
        {draft && <span className="pin draft" aria-label="Draft pin" style={pointStyle(draft)}>+</span>}
      </div>
      <p className="canvas-caption">{revision.label} · {revision.imageUrl.split('/').pop()} · {Math.round(zoom * 100)}% requested zoom</p>
    </section>
  );
}
