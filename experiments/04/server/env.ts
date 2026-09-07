import { resolve } from "node:path";

export function getDatabasePath(): string {
  return process.env.DATABASE_PATH || resolve("data/parcelroom.sqlite");
}

export function getPort(): number {
  const port = Number(process.env.PORT || 3001);
  if (!Number.isInteger(port) || port < 1 || port > 65535)
    throw new Error("Invalid PORT");
  return port;
}
