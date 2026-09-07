import { resolve } from 'node:path';

export function getDatabasePath(): string {
  return process.env.DATABASE_PATH || resolve('data/fieldnotes.sqlite');
}

export function getPort(): number {
  const port = Number(process.env.PORT || 3001);
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('PORT must be between 1 and 65535');
  return port;
}
