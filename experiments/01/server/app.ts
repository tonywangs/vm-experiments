import express, { type ErrorRequestHandler } from 'express';
import { createStore } from './repository';
import { createAnalysisService } from './analysis';
import { getDatabasePath } from './env';
import { storageLatency } from './fixtures/captures';
import type { AnalysisProvider, Profile } from './types';

const profiles = new Set<Profile>(['normal', 'slow', 'fast', 'failure']);

export function createApp(options: {
  databasePath?: string;
  detailLatency?: boolean;
  provider?: AnalysisProvider;
} = {}) {
  const app = express();
  const store = createStore(options.databasePath ?? getDatabasePath());
  const analysis = createAnalysisService(store, options.provider);
  app.locals.store = store;
  app.locals.analysis = analysis;
  app.use(express.json({ limit: '32kb' }));

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true });
  });

  app.get('/api/captures', (_req, res) => {
    res.json({ captures: store.listCaptures() });
  });

  app.get('/api/captures/:id', async (req, res) => {
    const detail = store.getDetail(req.params.id);
    if (!detail) {
      res.status(404).json({ error: 'Capture not found' });
      return;
    }
    if (options.detailLatency !== false) {
      await new Promise((resolve) => setTimeout(resolve, storageLatency[req.params.id] ?? 100));
    }
    res.json(detail);
  });

  app.post('/api/captures/:id/runs', (req, res) => {
    if (!store.getCapture(req.params.id)) {
      res.status(404).json({ error: 'Capture not found' });
      return;
    }
    const question: unknown = req.body?.question;
    const profile: unknown = req.body?.profile ?? 'normal';
    if (typeof question !== 'string' || !question.trim() || question.length > 800) {
      res.status(400).json({ error: 'Ask a question between 1 and 800 characters.' });
      return;
    }
    if (typeof profile !== 'string' || !profiles.has(profile as Profile)) {
      res.status(400).json({ error: 'Unknown fixture profile.' });
      return;
    }
    const run = analysis.startRun(req.params.id, question, profile as Profile);
    res.status(202).json({ run });
  });

  app.get('/api/runs/:id', (req, res) => {
    const run = store.getRun(req.params.id);
    if (!run) {
      res.status(404).json({ error: 'Run not found' });
      return;
    }
    res.json({ run });
  });

  app.use('/api', (_req, res) => {
    res.status(404).json({ error: 'Unknown API route' });
  });

  const handleError: ErrorRequestHandler = (error, _req, res, _next) => {
    if (error instanceof SyntaxError && 'body' in error) {
      res.status(400).json({ error: 'Request body must be valid JSON.' });
      return;
    }
    console.error(error);
    res.status(500).json({ error: 'Something went wrong. Please try again.' });
  };
  app.use(handleError);
  return app;
}
