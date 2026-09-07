import type { Annotation } from '../types';

interface Props {
  annotation: Annotation;
  onClose: () => void;
}

export function CommentDetail({ annotation, onClose }: Props) {
  return (
    <section className="comment-detail" aria-label="Selected comment">
      <div className="section-title"><h2>Comment detail</h2><button className="text-button" onClick={onClose}>Close</button></div>
      <p>{annotation.body}</p>
      <dl>
        <div><dt>State</dt><dd>{annotation.resolved ? 'Resolved' : 'Open'}</dd></div>
        <div><dt>Location</dt><dd>{Math.round(annotation.x * 100)}%, {Math.round(annotation.y * 100)}%</dd></div>
      </dl>
    </section>
  );
}
