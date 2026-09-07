import { setTimeout as delay } from "node:timers/promises";
import { configuration } from "./config";
import { createStore } from "./store";
import { processBatch } from "./process";
import { describeError, log } from "./log";

const config = configuration();
const store = createStore(config.databasePath);
const workerId = `worker-${process.pid}`;
let stopping = false;
process.once("SIGTERM", () => { stopping = true; });
process.once("SIGINT", () => { stopping = true; });

const recovered = store.recoverInterrupted();
log("worker.started", { databasePath: config.databasePath, exportDir: config.exportDir,
  concurrency: config.concurrency, recovered });

function heartbeat() {
  try { store.heartbeat(workerId); }
  catch (error) { log("worker.heartbeat.failed", { error: describeError(error) }); }
}
heartbeat();
const timer = setInterval(heartbeat, 500);

try {
  while (!stopping) {
    const batch = store.claim();
    if (batch) await processBatch(store, batch, config);
    else await delay(250);
  }
} finally {
  clearInterval(timer);
  store.close();
  log("worker.stopped");
}
