import { useCallback, useEffect, useRef, useState } from "react";
import { api } from "../api";
import type { Shipment, ShipmentDetail } from "../types";

export function useWorkspace() {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [selectedId, setSelectedId] = useState("box-atlas");
  const [detail, setDetail] = useState<ShipmentDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const generation = useRef(0);

  const refresh = useCallback(async () => {
    const version = ++generation.current;
    setLoading(true);
    setError(null);
    try {
      const [rows, value] = await Promise.all([
        api.listShipments(),
        api.getDetail(selectedId),
      ]);
      if (generation.current !== version) return;
      setShipments(rows);
      setDetail(value);
    } catch (caught) {
      if (generation.current === version)
        setError(
          caught instanceof Error ? caught.message : "Could not load workspace",
        );
    } finally {
      if (generation.current === version) setLoading(false);
    }
  }, [selectedId]);

  useEffect(() => {
    setDetail(null);
    void refresh();
    return () => {
      generation.current += 1;
    };
  }, [refresh]);

  return {
    shipments,
    selectedId,
    select: setSelectedId,
    detail,
    error,
    loading,
    refresh,
  };
}
