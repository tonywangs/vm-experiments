import { createApp } from './app';
import { getDatabasePath, getPort } from './env';

const app = createApp();
const host = process.env.HOST || '127.0.0.1';
const server = app.listen(getPort(), host, () => {
  console.log(`Frameboard API ready at http://${host}:${getPort()}`);
  console.log(`Database: ${getDatabasePath()}`);
});

function shutdown() {
  server.close(() => {
    app.locals.store.close();
    process.exit(0);
  });
}

process.once('SIGINT', shutdown);
process.once('SIGTERM', shutdown);
