import { useEffect, useRef, useState } from 'react';
import { api } from './api';
import { sourceToPoint } from './geometry';
import { useReview } from './hooks/useReview';
import { FrameList } from './components/FrameList';
import { ReviewToolbar } from './components/ReviewToolbar';
import { ImageCanvas } from './components/ImageCanvas';
import { DraftComposer } from './components/DraftComposer';
import { CommentList } from './components/CommentList';
import { CommentDetail } from './components/CommentDetail';
import { LayoutChecks } from './components/LayoutChecks';
import type { DraftPin, Frame, LayoutSuggestion, Point } from './types';

export default function App() {
  const [frames, setFrames] = useState<Frame[]>([]);
  const [frameId, setFrameId] = useState('checkout');
  const [revisionId, setRevisionId] = useState<string>();
  const [zoom, setZoom] = useState(0.5);
  const [draft, setDraft] = useState<DraftPin | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [listError, setListError] = useState<string | null>(null);
  const { detail, error, loading, refresh } = useReview(frameId, revisionId);
  const scope = `${frameId}:${revisionId || 'current'}`;
  const currentScope = useRef(scope);
  currentScope.current = scope;

  useEffect(() => {
    const controller = new AbortController();
    void api.frames(controller.signal).then(setFrames).catch((reason: unknown) => {
      if (!controller.signal.aborted) setListError(reason instanceof Error ? reason.message : 'Could not load screenshots.');
    });
    return () => controller.abort();
  }, []);

  function selectFrame(id: string) {
    setFrameId(id);
    setRevisionId(undefined);
    setSelectedId(null);
    setSaveError(null);
  }

  function selectRevision(id: string) {
    setRevisionId(id);
    setSelectedId(null);
    setSaveError(null);
  }

  function placeDraft(point: Point) {
    setDraft({ ...point, body: draft?.body || '' });
    setSelectedId(null);
    setSaveError(null);
  }

  function useSuggestion(suggestion: LayoutSuggestion) {
    if (!detail) return;
    const point = sourceToPoint(suggestion.sourceX, suggestion.sourceY, detail.revision.width, detail.revision.height);
    setDraft({ ...point, body: suggestion.body });
    setSelectedId(null);
    setSaveError(null);
  }

  async function saveDraft() {
    if (!draft || !detail || saving) return;
    const requestScope = scope;
    setSaving(true);
    setSaveError(null);
    try {
      const pin = await api.annotate(detail.frame.id, detail.revision.id, { x: draft.x, y: draft.y }, draft.body);
      if (currentScope.current === requestScope) {
        setDraft(null);
        setSelectedId(pin.id);
        refresh();
      }
    } catch (reason) {
      if (currentScope.current === requestScope) setSaveError(reason instanceof Error ? reason.message : 'Could not save comment.');
    } finally {
      setSaving(false);
    }
  }

  const selected = detail?.annotations.find(annotation => annotation.id === selectedId);

  return (
    <div className="app-shell">
      <header className="brand"><span className="brand-mark">f</span><strong>frameboard</strong><span>Visual feedback, in context.</span><small>EXPERIMENT 03</small></header>
      <div className="workspace">
        <aside className="sidebar"><FrameList frames={frames} selectedId={frameId} onSelect={selectFrame} />{listError && <p role="alert">{listError}</p>}</aside>
        <main>
          {loading && <div className="loading" role="status">Loading review…</div>}
          {error && <div className="loading error" role="alert">{error}<button onClick={refresh}>Try again</button></div>}
          {detail && <>
            <ReviewToolbar detail={detail} zoom={zoom} onRevision={selectRevision} onZoom={setZoom} />
            <div className="review-layout">
              <ImageCanvas revision={detail.revision} annotations={detail.annotations} draft={draft} zoom={zoom}
                selectedAnnotationId={selectedId} onPlace={placeDraft} onSelect={setSelectedId} />
              <aside className="review-panel">
                {draft && <DraftComposer draft={draft} saving={saving} error={saveError}
                  onBody={body => setDraft(value => value ? { ...value, body } : null)} onCancel={() => setDraft(null)} onSave={() => void saveDraft()} />}
                {selected && <CommentDetail annotation={selected} onClose={() => setSelectedId(null)} />}
                <CommentList annotations={detail.annotations} selectedId={selectedId} onSelect={setSelectedId} />
                <LayoutChecks revision={detail.revision} onUse={useSuggestion} />
              </aside>
            </div>
          </>}
        </main>
      </div>
    </div>
  );
}
