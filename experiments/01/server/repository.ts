import { DatabaseSync } from 'node:sqlite';
import { randomUUID } from 'node:crypto';
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { captures } from './fixtures/captures';
import { makeReport } from './fixtures/provider';
import type { Capture, CaptureDetail, CaptureSummary, Profile, Report, Run } from './types';

type CaptureRow = {
  id: string;
  content_json: string;
  latest_run_id: string | null;
  published_run_id: string | null;
};

type RunRow = {
  id: string;
  capture_id: string;
  question: string;
  profile: Profile;
  status: Run['status'];
  report_json: string | null;
  error: string | null;
  requested_at: string;
  completed_at: string | null;
};

function toRun(row: RunRow): Run {
  return {
    id: row.id,
    captureId: row.capture_id,
    question: row.question,
    profile: row.profile,
    status: row.status,
    report: row.report_json ? JSON.parse(row.report_json) as Report : null,
    error: row.error,
    requestedAt: row.requested_at,
    completedAt: row.completed_at,
  };
}

export function createStore(databasePath: string) {
  if (databasePath !== ':memory:') mkdirSync(dirname(databasePath), { recursive: true });
  const db = new DatabaseSync(databasePath);
  db.exec(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;
    CREATE TABLE IF NOT EXISTS captures (
      id TEXT PRIMARY KEY,
      content_json TEXT NOT NULL,
      latest_run_id TEXT,
      published_run_id TEXT
    );
    CREATE TABLE IF NOT EXISTS runs (
      id TEXT PRIMARY KEY,
      capture_id TEXT NOT NULL REFERENCES captures(id),
      question TEXT NOT NULL,
      profile TEXT NOT NULL,
      status TEXT NOT NULL,
      report_json TEXT,
      error TEXT,
      requested_at TEXT NOT NULL,
      completed_at TEXT
    );
    CREATE INDEX IF NOT EXISTS runs_by_capture ON runs(capture_id, requested_at);
  `);

  function getRun(id: string): Run | null {
    const row = db.prepare('SELECT * FROM runs WHERE id = ?').get(id) as RunRow | undefined;
    return row ? toRun(row) : null;
  }

  function getCapture(id: string): Capture | null {
    const row = db.prepare('SELECT content_json FROM captures WHERE id = ?').get(id) as Pick<CaptureRow, 'content_json'> | undefined;
    return row ? JSON.parse(row.content_json) as Capture : null;
  }

  function listCaptures(): CaptureSummary[] {
    const rows = db.prepare('SELECT content_json FROM captures ORDER BY id').all() as Array<Pick<CaptureRow, 'content_json'>>;
    return rows.map((row) => {
      const { evidence: _evidence, ...summary } = JSON.parse(row.content_json) as Capture;
      return summary;
    });
  }

  function getDetail(id: string): CaptureDetail | null {
    const row = db.prepare('SELECT * FROM captures WHERE id = ?').get(id) as CaptureRow | undefined;
    if (!row) return null;
    return {
      capture: JSON.parse(row.content_json) as Capture,
      latestRun: row.latest_run_id ? getRun(row.latest_run_id) : null,
      publishedRun: row.published_run_id ? getRun(row.published_run_id) : null,
    };
  }

  function createRun(captureId: string, question: string, profile: Profile): Run {
    const id = randomUUID();
    const now = new Date().toISOString();
    db.exec('BEGIN');
    try {
      db.prepare(`INSERT INTO runs
        (id, capture_id, question, profile, status, requested_at)
        VALUES (?, ?, ?, ?, 'running', ?)`)
        .run(id, captureId, question, profile, now);
      db.prepare('UPDATE captures SET latest_run_id = ?, published_run_id = NULL WHERE id = ?')
        .run(id, captureId);
      db.exec('COMMIT');
    } catch (error) {
      db.exec('ROLLBACK');
      throw error;
    }
    return getRun(id)!;
  }

  function finishRun(runId: string, report: Report): void {
    const run = getRun(runId);
    if (!run) throw new Error(`Unknown run: ${runId}`);
    db.exec('BEGIN');
    try {
      db.prepare(`UPDATE runs SET status = 'succeeded', report_json = ?,
        completed_at = ?, error = NULL WHERE id = ?`)
        .run(JSON.stringify(report), new Date().toISOString(), runId);
      db.prepare('UPDATE captures SET published_run_id = ? WHERE id = ?')
        .run(runId, run.captureId);
      db.exec('COMMIT');
    } catch (error) {
      db.exec('ROLLBACK');
      throw error;
    }
  }

  function failRun(runId: string, error: string): void {
    db.prepare(`UPDATE runs SET status = 'failed', error = ?, completed_at = ? WHERE id = ?`)
      .run(error, new Date().toISOString(), runId);
  }

  function seed(reset = false): void {
    if (reset) db.exec('DELETE FROM runs; DELETE FROM captures;');
    const count = db.prepare('SELECT COUNT(*) AS total FROM captures').get() as { total: number };
    if (count.total) return;
    const insertCapture = db.prepare('INSERT INTO captures (id, content_json) VALUES (?, ?)');
    for (const capture of captures) {
      insertCapture.run(capture.id, JSON.stringify(capture));
      const question = 'What might be unclear to a first-time visitor?';
      const run = createRun(capture.id, question, 'normal');
      finishRun(run.id, makeReport(capture, question));
    }
  }

  seed();
  return { listCaptures, getCapture, getDetail, getRun, createRun, finishRun, failRun, seed, close: () => db.close() };
}

export type Store = ReturnType<typeof createStore>;
