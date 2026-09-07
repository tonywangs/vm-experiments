import express from 'express';
import { createStore, type Store } from './repository';
import { getDatabasePath } from './env';
import { inspectLayout } from './fixtures/provider';

export function createApp(store: Store = createStore(getDatabasePath())) {
  const app = express();
  app.locals.store = store;
  app.use(express.json({ limit: '32kb' }));
  app.use((req, res, next) => {
    const started = Date.now();
    res.on('finish', () => {
      console.info(JSON.stringify({ event: 'http', method: req.method, path: req.path, status: res.statusCode, durationMs: Date.now() - started }));
    });
    next();
  });

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true, application: 'frameboard', provider: 'local-v1' });
  });

  app.get('/api/frames', (_req, res) => {
    res.json({ frames: store.listFrames() });
  });

  app.get('/api/frames/:frameId', (req, res) => {
    const revisionId = typeof req.query.revision === 'string' ? req.query.revision : undefined;
    const detail = store.detail(req.params.frameId, revisionId);
    if (!detail) return res.status(404).json({ error: 'Frame or revision was not found.' });
    res.json(detail);
  });

  app.post('/api/frames/:frameId/revisions/:revisionId/annotations', (req, res) => {
    const { frameId, revisionId } = req.params;
    if (!store.getRevision(frameId, revisionId)) {
      return res.status(404).json({ error: 'Frame or revision was not found.' });
    }
    const { x, y, body } = req.body || {};
    const validCoordinate = (value: unknown) => typeof value === 'number' && Number.isFinite(value) && value >= 0 && value <= 1;
    if (!validCoordinate(x) || !validCoordinate(y) || typeof body !== 'string' || !body.trim() || body.length > 2000) {
      return res.status(400).json({ error: 'Provide x and y in [0, 1], and a comment of 1–2000 characters.' });
    }
    const pin = store.addAnnotation(frameId, revisionId, x, y, body.trim());
    res.status(201).json({ annotation: pin });
  });

  app.get('/api/frames/:frameId/revisions/:revisionId/suggestions', (req, res) => {
    const revision = store.getRevision(req.params.frameId, req.params.revisionId);
    if (!revision) return res.status(404).json({ error: 'Frame or revision was not found.' });
    res.json({ suggestions: inspectLayout(revision) });
  });

  app.use('/api', (_req, res) => {
    res.status(404).json({ error: 'This API route does not exist.' });
  });

  app.use((error: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error(JSON.stringify({ event: 'http.error', message: error.message }));
    res.status(500).json({ error: 'The review could not be saved. See the API log.' });
  });
  return app;
}
