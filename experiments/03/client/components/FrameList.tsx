import type { Frame } from '../types';

interface Props {
  frames: Frame[];
  selectedId: string;
  onSelect: (id: string) => void;
}

export function FrameList({ frames, selectedId, onSelect }: Props) {
  return (
    <nav className="frame-list" aria-label="Screenshots">
      <div className="eyebrow">REVIEW COLLECTION</div>
      {frames.map((frame, index) => (
        <button key={frame.id} className={frame.id === selectedId ? 'frame-item selected' : 'frame-item'}
          aria-current={frame.id === selectedId ? 'page' : undefined} onClick={() => onSelect(frame.id)}>
          <span className="frame-number">0{index + 1}</span>
          <span><strong>{frame.title}</strong><small>{frame.description}</small></span>
        </button>
      ))}
      <p className="sidebar-note">Local experiment<br />All screenshots and model responses stay on this VM.</p>
    </nav>
  );
}
