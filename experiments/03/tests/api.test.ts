import { afterEach, beforeEach, expect, test } from 'vitest';
import type { Server } from 'node:http';
import type { AddressInfo } from 'node:net';
import { createApp } from '../server/app';
import { createStore, type Store } from '../server/repository';

let server: Server;
let store: Store;
let base: string;

beforeEach(async () => {
  store = createStore(':memory:');
  const app = createApp(store);
  server = await new Promise<Server>(resolve => {
    const listening = app.listen(0, '127.0.0.1', () => resolve(listening));
  });
  base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
});

afterEach(async () => {
  await new Promise<void>((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
  store.close();
});

test('serves health and accepts a normal comment', async () => {
  expect((await (await fetch(`${base}/api/health`)).json()).ok).toBe(true);
  const response = await fetch(`${base}/api/frames/library/revisions/library-v1/annotations`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ x: 0.4, y: 0.3, body: '  A note  ' }),
  });
  expect(response.status).toBe(201);
  expect((await response.json()).annotation.body).toBe('A note');
});

test('rejects malformed coordinates and a revision from another frame', async () => {
  const bad = await fetch(`${base}/api/frames/library/revisions/library-v1/annotations`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ x: 1.4, y: 0.3, body: 'A note' }),
  });
  expect(bad.status).toBe(400);
  expect((await fetch(`${base}/api/frames/checkout?revision=onboarding-v1`)).status).toBe(404);
});
