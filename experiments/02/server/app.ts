import express from 'express';
import { createStore } from './repository';
import { createImporter } from './importer';
import { fetchPage } from './fixtures/provider';
import { sources } from './fixtures/sources';
import { searchDocuments } from './search';
import { getDatabasePath } from './env';
import type { PageProvider } from './types';

interface Options {
  databasePath?: string;
  provider?: PageProvider;
}

export function createApp(options: Options = {}) {
  const store = createStore(options.databasePath ?? getDatabasePath());
  const importer = createImporter(store, options.provider ?? fetchPage);
  const app = express();
  app.locals.store = store;
  app.locals.importer = importer;
  app.use(express.json({ limit: '32kb' }));
  app.get('/api/health', (_request, response) => response.json({ ok: true }));
  app.get('/api/sources', (_request, response) => response.json({ sources: store.listSources() }));
  app.post('/api/sources/:id/import', async (request, response) => {
    if (!sources.some((source) => source.id === request.params.id)) {
      response.status(404).json({ error: 'Source not found' });
      return;
    }
    try {
      response.json({ receipt: await importer.importSource(request.params.id) });
    } catch (error) {
      response.status(502).json({ error: error instanceof Error ? error.message : 'Import failed' });
    }
  });
  app.get('/api/documents', (request, response) => {
    const sourceId = typeof request.query.sourceId === 'string' ? request.query.sourceId : undefined;
    response.json({ documents: store.listDocuments(sourceId) });
  });
  app.get('/api/documents/:id', (request, response) => {
    const document = store.getDocument(request.params.id);
    if (!document) response.status(404).json({ error: 'Document not found' });
    else response.json({ document });
  });
  app.post('/api/search', (request, response) => {
    const query = request.body?.query;
    const sourceId = request.body?.sourceId;
    if (typeof query !== 'string' || !query.trim() || query.length > 500) {
      response.status(400).json({ error: 'Enter a query between 1 and 500 characters.' });
      return;
    }
    if (sourceId !== undefined && (typeof sourceId !== 'string' || !sources.some((source) => source.id === sourceId))) {
      response.status(400).json({ error: 'Choose a known source.' });
      return;
    }
    response.json(searchDocuments(store, { query: query.trim(), sourceId }));
  });
  app.use((error: Error, _request: express.Request, response: express.Response, _next: express.NextFunction) => {
    console.error(JSON.stringify({ event: 'api.error', message: error.message }));
    response.status(500).json({ error: 'The request could not be completed.' });
  });
  return app;
}
