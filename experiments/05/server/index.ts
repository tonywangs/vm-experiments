import { createApp } from "./app";
import { configuration } from "./config";
import { log } from "./log";

const config = configuration();
const app = createApp();
const server = app.listen(config.port, "127.0.0.1", () => {
  log("api.started", { port: config.port, databasePath: config.databasePath, exportDir: config.exportDir });
});
function stop() {
  server.close(() => { app.locals.store.close(); process.exit(0); });
}
process.once("SIGTERM", stop);
process.once("SIGINT", stop);
