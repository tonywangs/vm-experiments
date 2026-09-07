// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { AnswerPanel } from '../client/components/AnswerPanel';
import type { Document, SearchResult } from '../client/types';

const document: Document = {
  id: 'sample', remoteId: 'sample', sourceId: 'atlas', sourceName: 'Atlas product notes',
  title: 'A sample note', body: 'A useful research finding.', tags: ['research'],
  updatedAt: '2026-08-19T00:00:00Z', url: 'https://atlas.example/sample',
};
const result: SearchResult = {
  query: 'research', answer: 'A useful research finding. [1]', documents: [document],
  citations: [{ number: 1, documentId: 'sample', quote: document.body }],
};
afterEach(cleanup);

it('renders the answer and opens its only evidence document', () => {
  const onOpen = vi.fn();
  render(<AnswerPanel result={result} documents={[document]} onOpen={onOpen} />);
  expect(screen.getByText(result.answer)).toBeTruthy();
  fireEvent.click(screen.getByRole('button', { name: 'Source 1' }));
  expect(onOpen).toHaveBeenCalledWith(document);
});

it('renders empty evidence without a source button', () => {
  render(<AnswerPanel result={{ ...result, answer: 'No matching evidence.', citations: [], documents: [] }} documents={[]} onOpen={() => {}} />);
  expect(screen.queryByRole('button', { name: 'Source 1' })).toBeNull();
});
