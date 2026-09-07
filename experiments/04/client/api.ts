import type { Delivery, Scenario, Shipment, ShipmentDetail } from "./types";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`/api${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });
  const body = await response.json();
  if (!response.ok)
    throw new Error(body.error || `Request failed (${response.status})`);
  return body as T;
}

export const api = {
  listShipments: () => request<Shipment[]>("/shipments"),
  getDetail: (id: string) =>
    request<ShipmentDetail>(`/shipments/${encodeURIComponent(id)}`),
  scenarios: () => request<Scenario[]>("/simulator/scenarios"),
  play: (shipmentId: string, scenario: string) =>
    request<{ deliveries: Delivery[] }>("/simulator/play", {
      method: "POST",
      body: JSON.stringify({ shipmentId, scenario }),
    }),
};
