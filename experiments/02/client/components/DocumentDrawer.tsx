import { useEffect, useRef } from 'react';
import type { Document } from '../types';

interface Props {
  document: Document;
  onClose: () => void;
}

export function DocumentDrawer({ document, onClose }: Props) {
  const close = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    close.current?.focus();
    const listener = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose(); };
    window.addEventListener('keydown', listener);
    return () => window.removeEventListener('keydown', listener);
  }, [onClose]);
  return (
    <div className="drawer-backdrop" onClick={onClose}>
      <aside className="document-drawer" role="dialog" aria-modal="true" aria-label="Source document" onClick={(event) => event.stopPropagation()}>
        <button ref={close} className="close-button" onClick={onClose}>Close source</button>
        <span className="eyebrow">{document.sourceName}</span>
        <h2>{document.title}</h2>
        <p className="document-meta">Updated {new Date(document.updatedAt).toLocaleDateString()} · {document.tags.join(', ')}</p>
        <div className="document-body">{document.body}</div>
        <a className="original-link" href={document.url} target="_blank" rel="noreferrer">Open original document ↗</a>
        <p className="fine-print">These example source addresses are fictional. Full evidence is stored locally above.</p>
      </aside>
    </div>
  );
}
