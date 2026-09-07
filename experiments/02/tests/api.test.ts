import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import type { AddressInfo } from 'node:net';
import type { Server } from 'node:http';
import { createApp } from '../server/app';

describe('HTTP smoke coverage', () => {
  let app: ReturnType<typeof createApp>;
  let server: Server;
  let origin: string;

  beforeEach(async () => {
    app = createApp({ databasePath: ':memory:' });
    server = await new Promise<Server>((resolve) => {
      const listener = app.listen(0, '127.0.0.1', () => resolve(listener));
    });
    origin = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  });

  afterEach(async () => {
    await new Promise<void>((resolve) => server.close(() => resolve()));
    app.locals.store.close();
  });

  it('serves health and two source summaries', async () => {
    expect(await (await fetch(`${origin}/api/health`)).json()).toEqual({ ok: true });
    const { sources } = await (await fetch(`${origin}/api/sources`)).json();
    expect(sources).toHaveLength(2);
    expect(sources[0].documentCount).toBe(1);
  });

  it('searches the local sample and produces a cited answer', async () => {
    const response = await fetch(`${origin}/api/search`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ query: 'onboarding' }),
    });
    const result = await response.json();
    expect(response.status).toBe(200);
    expect(result.citations).toHaveLength(1);
    expect(result.citations[0].documentId).toBe(result.documents[0].id);
    expect(result.answer).toContain('[1]');
  });

  it('rejects blank queries and unknown sources', async () => {
    const response = await fetch(`${origin}/api/search`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ query: ' ' }),
    });
    expect(response.status).toBe(400);
    expect((await fetch(`${origin}/api/sources/missing/import`, { method: 'POST' })).status).toBe(404);
  });
});
