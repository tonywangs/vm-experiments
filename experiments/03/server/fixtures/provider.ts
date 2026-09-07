import type { LayoutSuggestion, Revision } from '../types';

const checks: Record<string, { label: string; body: string; x: number; y: number }[]> = {
  checkout: [
    { label: 'Primary action', body: 'Check the contrast and label of the payment action.', x: 0.72, y: 0.79 },
    { label: 'Reading order', body: 'Check whether the order summary reads before the action.', x: 0.72, y: 0.4 },
  ],
  onboarding: [
    { label: 'Next step', body: 'Check that the next step is clear before asking for commitment.', x: 0.5, y: 0.76 },
  ],
  library: [
    { label: 'Empty state', body: 'Check whether someone can tell how to add their first reference.', x: 0.5, y: 0.5 },
  ],
};

export function inspectLayout(revision: Revision): LayoutSuggestion[] {
  const template = checks[revision.frameId] || [];
  console.info(JSON.stringify({ event: 'layout.inspect', revisionId: revision.id, fixture: 'local-v1', count: template.length }));
  return template.map(({ label, body, x, y }) => ({
    label,
    body,
    sourceX: Math.round(x * revision.width),
    sourceY: Math.round(y * revision.height),
  }));
}
