import { useEffect, useState } from 'react';
import { listCaptures, startAnalysis } from './api';
import { useCaptureDetail } from './hooks/useCaptureDetail';
import { CaptureList } from './components/CaptureList';
import { CaptureViewer } from './components/CaptureViewer';
import { QuestionComposer } from './components/QuestionComposer';
import { AttemptStatus } from './components/AttemptStatus';
import { ReportView } from './components/ReportView';
import { EmptyState } from './components/EmptyState';
import type { CaptureSummary, Profile } from './types';

export function App() {
  const [captures, setCaptures] = useState<CaptureSummary[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [listError, setListError] = useState<string | null>(null);
  const [question, setQuestion] = useState(
    'What might be unclear to a first-time visitor?',
  );
  const [profile, setProfile] = useState<Profile>('normal');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [selectedEvidence, setSelectedEvidence] = useState<string | null>(null);
  const { detail, error, refresh } = useCaptureDetail(selectedId);

  useEffect(() => {
    let active = true;
    void listCaptures().then(
      (items) => {
        if (!active) return;
        setCaptures(items);
        setSelectedId(items[0]?.id ?? null);
      },
      (cause: unknown) => {
        if (active)
          setListError(
            cause instanceof Error ? cause.message : 'Could not load workspace',
          );
      },
    );
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    setSelectedEvidence(null);
    setSubmitError(null);
  }, [selectedId]);

  async function analyze() {
    if (!selectedId || !question.trim()) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      await startAnalysis(selectedId, question, profile);
      await refresh();
    } catch (cause) {
      setSubmitError(
        cause instanceof Error ? cause.message : 'Could not start analysis',
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a className="brand" href="/" aria-label="Traceboard home">
          <span className="brand-mark" aria-hidden="true">
            t
          </span>
          <span>
            traceboard<span className="brand-period">.</span>
          </span>
        </a>
        <div className="workspace-label">
          <span className="workspace-icon">R</span>
          <div>
            Research workspace<small>Product explorations</small>
          </div>
        </div>
        <div className="section-label">
          CAPTURES <span>{captures.length.toString().padStart(2, '0')}</span>
        </div>
        {listError ? (
          <p className="inline-error">{listError}</p>
        ) : (
          <CaptureList
            captures={captures}
            selectedId={selectedId}
            onSelect={setSelectedId}
          />
        )}
        <div className="sidebar-note">
          <span className="status-dot" />
          LOCAL EXPERIMENT
          <p>Saved captures. Small questions. Findings you can trace back.</p>
          <small>Fixture provider · no API keys</small>
        </div>
      </aside>

      <main className="workspace-main">
        <header className="topbar">
          <div>
            <span className="breadcrumb">Workspace</span>
            <span className="slash">/</span>Capture review
          </div>
          <span className="prototype-tag">EXPERIMENT 014</span>
        </header>
        <div className="page-intro">
          <div>
            <p className="eyebrow">A CLOSER LOOK</p>
            <h1>Turn observations into questions.</h1>
            <p>Explore what an interface says, promises, and leaves unsaid.</p>
          </div>
          <span className="collection-badge">
            PRODUCT RESEARCH <span>↗</span>
          </span>
        </div>

        {error && (
          <div className="load-error" role="alert">
            {error}
            <button onClick={() => void refresh()}>Refresh capture</button>
          </div>
        )}
        {!detail ? (
          <EmptyState
            title={
              captures.length ? 'Opening capture…' : 'Loading your workspace…'
            }
            description="Preparing the saved screenshot and its evidence."
          />
        ) : (
          <div className="review-grid">
            <section className="source-column">
              <CaptureViewer
                capture={detail.capture}
                selectedEvidence={selectedEvidence}
                onSelectEvidence={setSelectedEvidence}
              />
            </section>
            <section
              className="analysis-column"
              aria-label="Analysis workspace"
            >
              <QuestionComposer
                question={question}
                onQuestionChange={setQuestion}
                profile={profile}
                onProfileChange={setProfile}
                submitting={submitting}
                onSubmit={() => void analyze()}
              />
              {submitError && (
                <p role="alert" className="inline-error">
                  {submitError}
                </p>
              )}
              <AttemptStatus run={detail.latestRun} />
              <ReportView
                publishedRun={detail.publishedRun}
                latestRun={detail.latestRun}
                evidence={detail.capture.evidence}
                onSelectEvidence={setSelectedEvidence}
              />
            </section>
          </div>
        )}
        <footer className="page-footer">
          <span>Traceboard / working prototype</span>
          <span>Observations are a starting point, not a user study.</span>
        </footer>
      </main>
    </div>
  );
}
