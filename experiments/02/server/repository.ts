import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { sources } from './fixtures/sources';
import { atlasDocuments } from './fixtures/documents';
import type { Document, ImportReceipt, RemoteDocument, SourceSummary } from './types';

interface DocumentRow {
  id: string;
  source_id: string;
  remote_id: string;
  content_json: string;
}

export function createStore(databasePath: string) {
  if (databasePath !== ':memory:') mkdirSync(dirname(databasePath), { recursive: true });
  const db = new DatabaseSync(databasePath);
  db.exec(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS documents (
      id TEXT PRIMARY KEY,
      source_id TEXT NOT NULL,
      remote_id TEXT NOT NULL,
      content_json TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS documents_by_source ON documents(source_id);
    CREATE TABLE IF NOT EXISTS imports (
      source_id TEXT PRIMARY KEY,
      receipt_json TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS metadata (key TEXT PRIMARY KEY, value TEXT NOT NULL);
  `);

  const decode = (row: DocumentRow): Document => ({
    ...JSON.parse(row.content_json) as RemoteDocument,
    id: row.id,
    sourceId: row.source_id,
    remoteId: row.remote_id,
    sourceName: sources.find((source) => source.id === row.source_id)?.name ?? row.source_id,
  });

  function upsertDocument(sourceId: string, document: RemoteDocument) {
    db.prepare(`
      INSERT INTO documents (id, source_id, remote_id, content_json) VALUES (?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET source_id = excluded.source_id,
        remote_id = excluded.remote_id, content_json = excluded.content_json
    `).run(document.id, sourceId, document.id, JSON.stringify(document));
  }

  function listDocuments(sourceId?: string): Document[] {
    const rows = sourceId
      ? db.prepare('SELECT * FROM documents WHERE source_id = ? ORDER BY id').all(sourceId)
      : db.prepare('SELECT * FROM documents ORDER BY id').all();
    return (rows as unknown as DocumentRow[]).map(decode);
  }

  function getDocument(id: string): Document | null {
    const row = db.prepare('SELECT * FROM documents WHERE id = ?').get(id) as DocumentRow | undefined;
    return row ? decode(row) : null;
  }

  function listSources(): SourceSummary[] {
    return sources.map((source) => {
      const row = db.prepare('SELECT receipt_json FROM imports WHERE source_id = ?').get(source.id) as { receipt_json: string } | undefined;
      return {
        ...source,
        documentCount: listDocuments(source.id).length,
        lastImport: row ? JSON.parse(row.receipt_json) as ImportReceipt : null,
      };
    });
  }

  function saveReceipt(receipt: ImportReceipt) {
    db.prepare('INSERT OR REPLACE INTO imports(source_id, receipt_json) VALUES (?, ?)')
      .run(receipt.sourceId, JSON.stringify(receipt));
  }

  // A tiny local sample keeps the prototype useful before the first connector run.
  if (!db.prepare("SELECT value FROM metadata WHERE key = 'seeded'").get()) {
    upsertDocument('atlas', atlasDocuments[0]);
    db.prepare("INSERT INTO metadata (key, value) VALUES ('seeded', 'yes')").run();
  }

  return { upsertDocument, listDocuments, getDocument, listSources, saveReceipt, close: () => db.close() };
}

export type Store = ReturnType<typeof createStore>;
