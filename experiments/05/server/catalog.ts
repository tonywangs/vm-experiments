import type { Asset, BatchSize } from "./types";

export const assets: Asset[] = [
  { id: "cove", title: "Cove — summer collection", filename: "cove.svg", accent: "#5f887c" },
  { id: "form", title: "Form — studio objects", filename: "form.svg", accent: "#c87959" },
  { id: "mori", title: "Mori — daily essentials", filename: "mori.svg", accent: "#7b8552" },
  { id: "sol", title: "Sol — weekend edition", filename: "sol.svg", accent: "#ca994e" },
  { id: "line", title: "Line — new arrivals", filename: "line.svg", accent: "#8980a0" },
  { id: "alto", title: "Alto — outdoor series", filename: "alto.svg", accent: "#5f7e98" },
];

export const sizes: Array<{ id: BatchSize; label: string; count: number; description: string }> = [
  { id: "small", label: "Small review", count: 4, description: "Four frames for a quick review." },
  { id: "launch", label: "Launch collection", count: 72, description: "Seventy-two frames from the current launch." },
];

export function batchAssets(size: BatchSize): Asset[] {
  const count = sizes.find((entry) => entry.id === size)!.count;
  return Array.from({ length: count }, (_, index) => assets[index % assets.length]);
}

export function findAsset(id: string) {
  const asset = assets.find((entry) => entry.id === id);
  if (!asset) throw new Error(`Unknown asset: ${id}`);
  return asset;
}
