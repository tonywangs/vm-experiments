import { open } from "node:fs/promises";
import { join } from "node:path";
import { setTimeout as delay } from "node:timers/promises";
import { findAsset } from "./catalog";
import type { Analysis } from "./types";

export async function analyzeAsset(assetId: string, assetDir: string): Promise<Analysis> {
  const asset = findAsset(assetId);
  const file = await open(join(assetDir, asset.filename), "r");
  try {
    const source = await file.readFile({ encoding: "utf8" });
    // The local adapter models a provider that streams an open upload body.
    await delay(150);
    if (!source.includes("<svg")) throw new Error(`Unsupported local asset: ${asset.filename}`);
    return {
      summary: `${asset.title}. Product imagery with a clear headline and a quiet background.`,
      palette: asset.accent,
      attention: asset.id === "line" ? "review" : "clear",
      model: "local-vision-2026-08",
    };
  } finally {
    await file.close();
  }
}
