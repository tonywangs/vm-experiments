import { DatabaseSync } from "node:sqlite";
import { mkdirSync } from "node:fs";
import { dirname } from "node:path";

export function openDatabase(filename: string) {
  if (filename !== ":memory:") mkdirSync(dirname(filename), { recursive: true });
  const db = new DatabaseSync(filename);
  db.exec("PRAGMA journal_mode=WAL; PRAGMA busy_timeout=5000; PRAGMA foreign_keys=ON;");
  db.exec(`
    CREATE TABLE IF NOT EXISTS batches (
      id TEXT PRIMARY KEY, name TEXT NOT NULL, size TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'queued', total INTEGER NOT NULL,
      attempts INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL, error TEXT, export_name TEXT
    );
    CREATE TABLE IF NOT EXISTS items (
      id TEXT PRIMARY KEY, batch_id TEXT NOT NULL REFERENCES batches(id),
      ordinal INTEGER NOT NULL, asset_id TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending', analysis_json TEXT, error TEXT,
      UNIQUE(batch_id, ordinal)
    );
    CREATE TABLE IF NOT EXISTS events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      batch_id TEXT NOT NULL REFERENCES batches(id), kind TEXT NOT NULL,
      message TEXT NOT NULL, at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS worker_heartbeats (
      worker_id TEXT PRIMARY KEY, seen_at INTEGER NOT NULL, pid INTEGER NOT NULL
    );
    CREATE INDEX IF NOT EXISTS batch_queue ON batches(status, created_at);
    CREATE INDEX IF NOT EXISTS item_batch ON items(batch_id, ordinal);
  `);
  return db;
}
