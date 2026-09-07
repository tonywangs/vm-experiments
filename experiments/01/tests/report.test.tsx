// @vitest-environment jsdom
import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { ReportView } from '../client/components/ReportView';
import { captures } from '../server/fixtures/captures';
import { makeReport } from '../server/fixtures/provider';
import type { Run } from '../client/types';

afterEach(cleanup);

describe('report presentation', () => {
  it('shows the report question and links findings to evidence IDs', () => {
    const capture = captures[0];
    const run: Run = {
      id: 'example-run', captureId: capture.id, question: 'What is the promise?',
      profile: 'normal', status: 'succeeded', report: makeReport(capture, 'What is the promise?'),
      error: null, requestedAt: '2026-08-28T10:30:00Z', completedAt: '2026-08-28T10:30:01Z',
    };
    const onSelectEvidence = vi.fn();
    render(<ReportView publishedRun={run} latestRun={run} evidence={capture.evidence} onSelectEvidence={onSelectEvidence} />);
    expect(screen.getByTestId('report-question').textContent).toBe('What is the promise?');
    fireEvent.click(screen.getByRole('button', { name: /Primary headline/ }));
    expect(onSelectEvidence).toHaveBeenCalledWith('atlas-headline');
  });
});
