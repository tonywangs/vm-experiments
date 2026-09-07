import { EmptyState } from './EmptyState';
import type { Evidence, Run } from '../types';

export function ReportView({
  publishedRun,
  latestRun,
  evidence,
  onSelectEvidence,
}: {
  publishedRun: Run | null;
  latestRun: Run | null;
  evidence: Evidence[];
  onSelectEvidence: (id: string) => void;
}) {
  if (!publishedRun?.report) {
    return (
      <div className="report-empty">
        <EmptyState
          title="Your findings will appear here"
          description="Ask a question to begin exploring this capture."
        />
      </div>
    );
  }
  const isPrevious = latestRun !== null && publishedRun.id !== latestRun.id;
  return (
    <div className="report-panel" data-testid="report-panel">
      <div className="subsection-heading">
        <h2>Research notes</h2>
        <span>{publishedRun.report.findings.length} FINDINGS</span>
      </div>
      {isPrevious && (
        <p className="previous-report" data-testid="previous-report">
          Showing the previous report while the latest attempt{' '}
          {latestRun.status === 'failed' ? 'has an error' : 'is in progress'}.
        </p>
      )}
      <div className="report-context">
        <span>QUESTION BEHIND THIS REPORT</span>
        <p data-testid="report-question">{publishedRun.question}</p>
      </div>
      <p className="report-summary">{publishedRun.report.summary}</p>
      <div className="findings-list">
        {publishedRun.report.findings.map((finding, index) => (
          <article className="finding" key={finding.id}>
            <span className="finding-index">0{index + 1}</span>
            <div>
              <h3>{finding.title}</h3>
              <p>{finding.body}</p>
              <div className="evidence-links">
                {finding.evidenceIds.map((id) => {
                  const sourceIndex = evidence.findIndex(
                    (item) => item.id === id,
                  );
                  const source = evidence[sourceIndex];
                  return source ? (
                    <button
                      key={id}
                      onClick={() => onSelectEvidence(id)}
                      title={source.text}
                    >
                      <span>{sourceIndex + 1}</span>
                      {source.label}
                      <span aria-hidden="true">↖</span>
                    </button>
                  ) : null;
                })}
              </div>
            </div>
          </article>
        ))}
      </div>
      <p className="report-footnote">
        Generated from local fixtures. Treat findings as hypotheses to test.
      </p>
    </div>
  );
}
