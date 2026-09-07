import { describe, expect, test } from 'vitest';
import { createStore } from '../server/repository';
import { inspectLayout } from '../server/fixtures/provider';

 describe('Seed and basic persistence', () => {
  test('seeds three frames and selects the current revision', () => {
    const store = createStore(':memory:');
    try {
      expect(store.listFrames()).toHaveLength(3);
      expect(store.detail('checkout')?.revision.id).toBe('checkout-v2');
      expect(store.detail('checkout')?.revisions).toHaveLength(2);
    } finally { store.close(); }
  });

  test('adds a comment with its supplied ownership and location', () => {
    const store = createStore(':memory:');
    try {
      const pin = store.addAnnotation('library', 'library-v1', 0.5, 0.25, 'A useful note');
      expect(pin).toMatchObject({ x: 0.5, y: 0.25, body: 'A useful note', resolved: false });
      expect(store.detail('library')?.annotations.map(value => value.id)).toContain(pin.id);
    } finally { store.close(); }
  });

  test('the local model is deterministic and leaves the database untouched', () => {
    const store = createStore(':memory:');
    try {
      const revision = store.detail('onboarding')!.revision;
      const before = store.detail('onboarding')!.annotations;
      expect(inspectLayout(revision)).toEqual(inspectLayout(revision));
      expect(inspectLayout(revision)[0]).toMatchObject({ sourceX: 360, sourceY: 836 });
      expect(store.detail('onboarding')!.annotations).toEqual(before);
    } finally { store.close(); }
  });
});
