import type { DraftPin } from '../types';

interface Props {
  draft: DraftPin;
  saving: boolean;
  error: string | null;
  onBody: (body: string) => void;
  onCancel: () => void;
  onSave: () => void;
}

export function DraftComposer({ draft, saving, error, onBody, onCancel, onSave }: Props) {
  return (
    <form className="draft-composer" onSubmit={event => { event.preventDefault(); onSave(); }}>
      <div className="eyebrow">NEW COMMENT</div>
      <p className="muted">Location {Math.round(draft.x * 100)}%, {Math.round(draft.y * 100)}%</p>
      <label htmlFor="comment-body">Comment</label>
      <textarea id="comment-body" autoFocus maxLength={2000} placeholder="What should the team look at?"
        value={draft.body} onChange={event => onBody(event.target.value)} />
      {error && <p role="alert" className="error">{error}</p>}
      <div className="button-row">
        <button type="button" className="secondary" onClick={onCancel} disabled={saving}>Cancel</button>
        <button type="submit" disabled={saving || !draft.body.trim()}>{saving ? 'Saving…' : 'Save comment'}</button>
      </div>
    </form>
  );
}
