import { resolve } from "node:path";

export function configuration() {
  const concurrency = Number(process.env.WORKER_CONCURRENCY || 96);
  if (!Number.isInteger(concurrency) || concurrency < 1 || concurrency > 512) {
    throw new Error("WORKER_CONCURRENCY must be an integer between 1 and 512");
  }
  return {
    databasePath: resolve(process.env.DATABASE_PATH || ".data/contactsheet.sqlite"),
    exportDir: resolve(process.env.EXPORT_DIR || ".data/exports"),
    assetDir: resolve("public/assets"),
    port: Number(process.env.PORT || 3005),
    concurrency,
  };
}
