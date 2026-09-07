import type { Store } from './repository';
import type { AnalysisProvider, Profile } from './types';
import { fixtureProvider } from './fixtures/provider';

export function createAnalysisService(store: Store, provider: AnalysisProvider = fixtureProvider) {
  const active = new Set<Promise<void>>();

  function startRun(captureId: string, question: string, profile: Profile) {
    const capture = store.getCapture(captureId);
    if (!capture) throw new Error('Capture not found');
    const run = store.createRun(captureId, question, profile);
    const task = Promise.resolve()
      .then(() => provider({ capture, question, profile }))
      .then(
        (report) => store.finishRun(run.id, report),
        (error: unknown) => store.failRun(run.id, error instanceof Error ? error.message : 'Analysis failed'),
      );
    active.add(task);
    void task.finally(() => active.delete(task));
    return run;
  }

  return {
    startRun,
    async waitForIdle() {
      await Promise.all([...active]);
    },
  };
}
