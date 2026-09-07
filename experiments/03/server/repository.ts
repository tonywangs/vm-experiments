import { DatabaseSync } from 'node:sqlite';
import { randomUUID } from 'node:crypto';
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { annotations, frames, revisions } from './fixtures/frames';
import type { Annotation, Frame, ReviewDetail, Revision } from './types';

type Row = Record<string, unknown>;

function annotation(row: Row): Annotation {
  return {
    id: String(row.id), frameId: String(row.frameId), revisionId: String(row.revisionId),
    x: Number(row.x), y: Number(row.y), body: String(row.body),
    resolved: Boolean(row.resolved), createdAt: String(row.createdAt),
  };
}

export class Store {
  readonly db: DatabaseSync;

  constructor(path: string) {
    if (path !== ':memory:') mkdirSync(dirname(path), { recursive: true });
    this.db = new DatabaseSync(path);
    this.db.exec(`
      PRAGMA journal_mode = WAL;
      PRAGMA foreign_keys = ON;
      CREATE TABLE IF NOT EXISTS frames (
        id TEXT PRIMARY KEY, title TEXT NOT NULL, description TEXT NOT NULL,
        currentRevisionId TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS revisions (
        id TEXT PRIMARY KEY, frameId TEXT NOT NULL REFERENCES frames(id),
        label TEXT NOT NULL, imageUrl TEXT NOT NULL,
        width INTEGER NOT NULL, height INTEGER NOT NULL, createdAt TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS annotations (
        id TEXT PRIMARY KEY, frameId TEXT NOT NULL REFERENCES frames(id),
        revisionId TEXT NOT NULL REFERENCES revisions(id),
        x REAL NOT NULL, y REAL NOT NULL, body TEXT NOT NULL,
        resolved INTEGER NOT NULL DEFAULT 0, createdAt TEXT NOT NULL
      );
      CREATE INDEX IF NOT EXISTS annotations_scope ON annotations(frameId, revisionId);
    `);
    this.seed();
  }

  seed(force = false): void {
    const count = this.db.prepare('SELECT COUNT(*) AS count FROM frames').get() as Row;
    if (!force && Number(count.count) > 0) return;
    this.db.exec('BEGIN');
    try {
      this.db.exec('DELETE FROM annotations; DELETE FROM revisions; DELETE FROM frames;');
      for (const frame of frames) {
        this.db.prepare('INSERT INTO frames VALUES (?, ?, ?, ?)').run(frame.id, frame.title, frame.description, frame.currentRevisionId);
      }
      for (const revision of revisions) {
        this.db.prepare('INSERT INTO revisions VALUES (?, ?, ?, ?, ?, ?, ?)').run(
          revision.id, revision.frameId, revision.label, revision.imageUrl,
          revision.width, revision.height, revision.createdAt,
        );
      }
      for (const pin of annotations) {
        this.db.prepare('INSERT INTO annotations VALUES (?, ?, ?, ?, ?, ?, ?, ?)').run(
          pin.id, pin.frameId, pin.revisionId, pin.x, pin.y, pin.body,
          Number(pin.resolved), pin.createdAt,
        );
      }
      this.db.exec('COMMIT');
    } catch (error) {
      this.db.exec('ROLLBACK');
      throw error;
    }
  }

  listFrames(): Frame[] {
    return this.db.prepare('SELECT * FROM frames ORDER BY rowid').all() as unknown as Frame[];
  }

  getRevision(frameId: string, revisionId: string): Revision | null {
    const row = this.db.prepare('SELECT * FROM revisions WHERE frameId = ? AND id = ?').get(frameId, revisionId);
    return row ? row as unknown as Revision : null;
  }

  detail(frameId: string, revisionId?: string): ReviewDetail | null {
    const frame = this.db.prepare('SELECT * FROM frames WHERE id = ?').get(frameId) as unknown as Frame | undefined;
    if (!frame) {
      return null;
    }
    const revision = this.getRevision(frameId, revisionId || frame.currentRevisionId);
    if (!revision) {
      return null;
    }
    const versions = this.db.prepare('SELECT * FROM revisions WHERE frameId = ? ORDER BY createdAt').all(frameId) as unknown as Revision[];
    const pins = this.db.prepare('SELECT * FROM annotations WHERE frameId = ? ORDER BY createdAt, id').all(frameId);
    return { frame, revision, revisions: versions, annotations: pins.map(annotation) };
  }

  addAnnotation(frameId: string, revisionId: string, x: number, y: number, body: string): Annotation {
    const pin: Annotation = {
      id: randomUUID(), frameId, revisionId, x, y, body,
      resolved: false, createdAt: new Date().toISOString(),
    };
    this.db.prepare('INSERT INTO annotations VALUES (?, ?, ?, ?, ?, ?, ?, ?)').run(
      pin.id, frameId, revisionId, x, y, body, 0, pin.createdAt,
    );
    console.info(JSON.stringify({ event: 'annotation.created', frameId, revisionId, annotationId: pin.id, x, y }));
    return pin;
  }

  close(): void {
    this.db.close();
  }
}

export function createStore(path: string): Store {
  return new Store(path);
}
