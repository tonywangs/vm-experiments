import { randomUUID } from "node:crypto";
import { openDatabase } from "./schema";
import { batchAssets } from "./catalog";
import type { Analysis, Batch, BatchDetail, BatchEvent, BatchItem, BatchSize } from "./types";

type Row = Record<string, any>;
const timestamp = () => new Date().toISOString();

function batchRow(row: Row): Batch {
  return {
    id: row.id, name: row.name, size: row.size, status: row.status,
    total: row.total, finished: row.finished, attempts: row.attempts,
    createdAt: row.created_at, updatedAt: row.updated_at,
    error: row.error, exportName: row.export_name,
  };
}

function itemRow(row: Row): BatchItem {
  return {
    id: row.id, batchId: row.batch_id, ordinal: row.ordinal, assetId: row.asset_id,
    status: row.status, analysis: row.analysis_json ? JSON.parse(row.analysis_json) : null,
    error: row.error,
  };
}

export function createStore(filename: string) {
  const db = openDatabase(filename);
  const selectBatch = `SELECT b.*, (SELECT COUNT(*) FROM items i
    WHERE i.batch_id=b.id AND i.status='completed') AS finished FROM batches b`;

  function transaction<T>(run: () => T): T {
    db.exec("BEGIN IMMEDIATE");
    try { const result = run(); db.exec("COMMIT"); return result; }
    catch (error) { db.exec("ROLLBACK"); throw error; }
  }

  function event(batchId: string, kind: string, message: string) {
    db.prepare("INSERT INTO events(batch_id,kind,message,at) VALUES(?,?,?,?)")
      .run(batchId, kind, message, timestamp());
  }

  function getBatch(id: string): Batch | undefined {
    const row = db.prepare(`${selectBatch} WHERE b.id=?`).get(id);
    return row ? batchRow(row) : undefined;
  }

  function getItems(id: string): BatchItem[] {
    return db.prepare("SELECT * FROM items WHERE batch_id=? ORDER BY ordinal")
      .all(id).map(itemRow);
  }

  function createBatch(name: string, size: BatchSize, id: string = randomUUID()): Batch {
    transaction(() => {
      const selected = batchAssets(size);
      const now = timestamp();
      db.prepare("INSERT INTO batches(id,name,size,total,created_at,updated_at) VALUES(?,?,?,?,?,?)")
        .run(id, name, size, selected.length, now, now);
      const insert = db.prepare("INSERT INTO items(id,batch_id,ordinal,asset_id) VALUES(?,?,?,?)");
      selected.forEach((asset, ordinal) => insert.run(`${id}:${ordinal}`, id, ordinal, asset.id));
      event(id, "queued", `${selected.length} frames submitted for review.`);
    });
    return getBatch(id)!;
  }

  return {
    db,
    close: () => db.close(),
    createBatch,
    getBatch,
    getItems,
    event,
    listBatches: (): Batch[] => db.prepare(`${selectBatch} ORDER BY b.created_at DESC, b.id`).all().map(batchRow),
    detail(id: string): BatchDetail | undefined {
      const batch = getBatch(id);
      if (!batch) return undefined;
      const events = db.prepare("SELECT * FROM events WHERE batch_id=? ORDER BY id DESC").all(id)
        .map((row): BatchEvent => ({ id: Number(row.id), batchId: String(row.batch_id),
          kind: String(row.kind), message: String(row.message), at: String(row.at) }));
      return { batch, items: getItems(id), events };
    },
    claim(): Batch | undefined {
      return transaction(() => {
        const row = db.prepare("SELECT id FROM batches WHERE status='queued' ORDER BY created_at,id LIMIT 1").get();
        if (!row) return undefined;
        const id = String(row.id);
        db.prepare("UPDATE batches SET status='processing', attempts=attempts+1, updated_at=?, error=NULL WHERE id=?")
          .run(timestamp(), id);
        event(id, "processing", "Worker started the review.");
        return getBatch(id);
      });
    },
    completeItem(id: string, result: Analysis) {
      db.prepare("UPDATE items SET status='completed', analysis_json=?, error=NULL WHERE id=?")
        .run(JSON.stringify(result), id);
    },
    failItem(id: string, error: string) {
      db.prepare("UPDATE items SET status='failed', error=? WHERE id=?").run(error, id);
    },
    complete(id: string, exportName: string) {
      transaction(() => {
        db.prepare("UPDATE batches SET status='completed', export_name=?, error=NULL, updated_at=? WHERE id=?")
          .run(exportName, timestamp(), id);
        event(id, "completed", "Review and export are ready.");
      });
    },
    fail(id: string, error: string) {
      transaction(() => {
        db.prepare("UPDATE batches SET status='failed', error=?, updated_at=? WHERE id=?")
          .run(error, timestamp(), id);
        event(id, "failed", error);
      });
    },
    retry(id: string): Batch | undefined {
      return transaction(() => {
        const batch = getBatch(id);
        if (!batch || batch.status !== "failed") return undefined;
        db.prepare("UPDATE items SET status='pending', analysis_json=NULL, error=NULL WHERE batch_id=?").run(id);
        db.prepare("UPDATE batches SET status='queued', error=NULL, export_name=NULL, updated_at=? WHERE id=?")
          .run(timestamp(), id);
        event(id, "queued", "Review queued again; the same batch is retained.");
        return getBatch(id);
      });
    },
    recoverInterrupted() {
      return transaction(() => {
        const interrupted = db.prepare("SELECT id FROM batches WHERE status='processing'").all();
        for (const row of interrupted) {
          const id = String(row.id);
          db.prepare("UPDATE items SET status='pending', analysis_json=NULL, error=NULL WHERE batch_id=?").run(id);
          db.prepare("UPDATE batches SET status='queued', updated_at=? WHERE id=?").run(timestamp(), id);
          event(id, "recovered", "Interrupted work returned to the queue after worker startup.");
        }
        return interrupted.length;
      });
    },
    heartbeat(workerId: string, now = Date.now(), pid = process.pid) {
      db.prepare(`INSERT INTO worker_heartbeats(worker_id,seen_at,pid) VALUES(?,?,?)
        ON CONFLICT(worker_id) DO UPDATE SET seen_at=excluded.seen_at,pid=excluded.pid`)
        .run(workerId, now, pid);
    },
    workerAge(now = Date.now()): number | null {
      const row = db.prepare("SELECT MAX(seen_at) AS seen FROM worker_heartbeats").get();
      return row?.seen == null ? null : Math.max(0, now - Number(row.seen));
    },
  };
}

export type Store = ReturnType<typeof createStore>;
