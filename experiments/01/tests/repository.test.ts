import { describe, expect, it } from 'vitest';
import { createStore } from '../server/repository';

describe('local workspace', () => {
  it('seeds three captures with evidence-backed published reports', () => {
    const store = createStore(':memory:');
    try {
      const captures = store.listCaptures();
      expect(captures).toHaveLength(3);
      for (const capture of captures) {
        const detail = store.getDetail(capture.id)!;
        expect(detail.capture.evidence).toHaveLength(capture.evidenceCount);
        expect(detail.publishedRun?.status).toBe('succeeded');
        const ids = new Set(detail.capture.evidence.map((item) => item.id));
        for (const finding of detail.publishedRun!.report!.findings) {
          expect(finding.evidenceIds.every((id) => ids.has(id))).toBe(true);
        }
      }
    } finally {
      store.close();
    }
  });

  it('does not invent an unknown capture', () => {
    const store = createStore(':memory:');
    try {
      expect(store.getCapture('missing')).toBeNull();
      expect(store.getDetail('missing')).toBeNull();
      expect(store.getRun('missing')).toBeNull();
    } finally {
      store.close();
    }
  });
});
