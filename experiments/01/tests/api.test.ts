import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import type { AddressInfo } from 'node:net';
import type { Server } from 'node:http';
import { createApp } from '../server/app';
import { makeReport } from '../server/fixtures/provider';

describe('HTTP smoke coverage', () => {
  let app: ReturnType<typeof createApp>;
  let server: Server;
  let baseUrl: string;

  beforeEach(async () => {
    app = createApp({
      databasePath: ':memory:',
      detailLatency: false,
      provider: async ({ capture, question }) => makeReport(capture, question),
    });
    server = await new Promise<Server>((resolve) => {
      const listening = app.listen(0, '127.0.0.1', () => resolve(listening));
    });
    baseUrl = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  });

  afterEach(async () => {
    await app.locals.analysis.waitForIdle();
    await new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
    app.locals.store.close();
  });

  it('serves health and capture summaries', async () => {
    expect(await (await fetch(`${baseUrl}/api/health`)).json()).toEqual({ ok: true });
    const body = await (await fetch(`${baseUrl}/api/captures`)).json();
    expect(body.captures).toHaveLength(3);
  });

  it('creates an attempt and publishes its normal result', async () => {
    const response = await fetch(`${baseUrl}/api/captures/atlas/runs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question: 'What should I investigate?', profile: 'normal' }),
    });
    expect(response.status).toBe(202);
    const { run } = await response.json();
    expect(run.captureId).toBe('atlas');
    await app.locals.analysis.waitForIdle();
    const detail = await (await fetch(`${baseUrl}/api/captures/atlas`)).json();
    expect(detail.publishedRun.id).toBe(run.id);
    expect(detail.publishedRun.report.findings).toHaveLength(3);
    expect(detail.latestRun.question).toBe('What should I investigate?');
  });

  it('rejects invalid questions and unknown capture IDs', async () => {
    const invalid = await fetch(`${baseUrl}/api/captures/atlas/runs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question: '  ' }),
    });
    expect(invalid.status).toBe(400);
    expect((await invalid.json()).error).toMatch(/question/i);
    expect((await fetch(`${baseUrl}/api/captures/missing`)).status).toBe(404);
  });
});
