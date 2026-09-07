import { configuration } from "./config";
import { createStore } from "./store";
import { analyzeAsset } from "./adapter";
import { exportDocument, writeExport } from "./export";

const config = configuration();
const store = createStore(config.databasePath);
try {
  const history = [
    { id: "history-spring-001", name: "Spring landing pages", date: "2026-08-18T09:00:00.000Z" },
    { id: "history-studio-002", name: "Studio collection", date: "2026-08-21T13:30:00.000Z" },
    { id: "history-social-003", name: "Social preview set", date: "2026-08-25T16:15:00.000Z" },
  ];
  for (const entry of history) {
    if (store.getBatch(entry.id)) continue;
    const batch = store.createBatch(entry.name, "small", entry.id);
    store.db.prepare("UPDATE batches SET created_at=?, updated_at=? WHERE id=?")
      .run(entry.date, entry.date, entry.id);
    for (const item of store.getItems(batch.id)) {
      store.completeItem(item.id, await analyzeAsset(item.assetId, config.assetDir));
    }
    const document = exportDocument(store.getBatch(batch.id)!, store.getItems(batch.id));
    store.complete(batch.id, await writeExport(config.exportDir, document));
    store.db.prepare("UPDATE batches SET updated_at=? WHERE id=?").run(entry.date, entry.id);
  }
  console.log(`Seeded ${store.listBatches().length} historical reviews.`);
} finally { store.close(); }
