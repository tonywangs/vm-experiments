import type { Annotation } from '../types';

interface Props {
  annotations: Annotation[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export function CommentList({ annotations, selectedId, onSelect }: Props) {
  return (
    <section className="comments" aria-label="Comments">
      <div className="section-title"><h2>Comments</h2><span>{annotations.length}</span></div>
      {annotations.length === 0 && <p className="empty">No comments on this view. Click the screenshot to start a review.</p>}
      <ol>
        {annotations.map((annotation, index) => (
          <li key={annotation.id}>
            <button className={selectedId === annotation.id ? 'comment selected' : 'comment'} onClick={() => onSelect(annotation.id)}>
              <span className="comment-number">{index + 1}</span>
              <span><span className="comment-body">{annotation.body}</span>
                <small>{annotation.resolved ? 'Resolved' : 'Open'} · {new Date(annotation.createdAt).toLocaleDateString()}</small>
              </span>
            </button>
          </li>
        ))}
      </ol>
    </section>
  );
}
