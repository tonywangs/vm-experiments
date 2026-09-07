import type { Run } from '../types';

export function AttemptStatus({ run }: { run: Run | null }) {
  if (!run) return null;
  const statusLabel = {
    running: 'Analysis running',
    succeeded: 'Latest attempt complete',
    failed: 'Latest attempt failed',
  }[run.status];
  return (
    <div
      className={`attempt-status status-${run.status}`}
      data-testid="attempt-status"
      role="status"
    >
      <span
        className={`status-indicator ${run.status === 'running' ? 'pulse' : ''}`}
        aria-hidden="true"
      />
      <div>
        <strong>{statusLabel}</strong>
        <span className="attempt-question">{run.question}</span>
        {run.error && (
          <span data-testid="attempt-error" className="attempt-error">
            {run.error}
          </span>
        )}
      </div>
      <span className="attempt-id" title={run.id}>
        #{run.id.slice(0, 6)}
      </span>
    </div>
  );
}
