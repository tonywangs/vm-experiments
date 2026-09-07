import { useEffect, useState } from "react";
import { api } from "../api";
import type { Scenario } from "../types";

export function Simulator({
  shipmentId,
  onComplete,
}: {
  shipmentId: string;
  onComplete: () => Promise<void>;
}) {
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    let active = true;
    void api
      .scenarios()
      .then((values) => {
        if (active) setScenarios(values);
      })
      .catch((caught) => {
        if (active) setError(String(caught.message));
      });
    return () => {
      active = false;
    };
  }, []);
  async function play(scenario: Scenario) {
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      const result = await api.play(shipmentId, scenario.id);
      await onComplete();
      setNotice(
        `${result.deliveries.length} delivery envelope${result.deliveries.length === 1 ? "" : "s"} received.`,
      );
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "Simulator request failed",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="panel simulator" aria-label="Local provider simulator">
      <div className="panel-heading">
        <div>
          <h2>Send a provider update</h2>
          <p>Local fixtures · no external service</p>
        </div>
        <span className="local-dot">LOCAL</span>
      </div>
      <div className="scenario-grid">
        {scenarios.map((scenario) => (
          <button
            key={scenario.id}
            disabled={busy}
            onClick={() => void play(scenario)}
          >
            <strong>
              {scenario.title}
              <span>↗</span>
            </strong>
            <span>{scenario.description}</span>
          </button>
        ))}
      </div>
      {notice && (
        <p role="status" className="notice">
          {notice}
        </p>
      )}
      {error && (
        <p role="alert" className="error">
          {error}
        </p>
      )}
    </section>
  );
}
