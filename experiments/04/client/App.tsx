import { useState } from "react";
import { useWorkspace } from "./hooks/useWorkspace";
import { ShipmentList } from "./components/ShipmentList";
import { ShipmentSummary } from "./components/ShipmentSummary";
import { Simulator } from "./components/Simulator";
import { DeliveryList } from "./components/DeliveryList";
import { Journal } from "./components/Journal";

export default function App() {
  const workspace = useWorkspace();
  const [note, setNote] = useState("");
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a href="/" className="brand">
          <img src="/parcel.svg" alt="" />
          Parcelroom<span>LAB</span>
        </a>
        <div className="workspace-label">OPERATIONS / SANDBOX</div>
        <ShipmentList
          shipments={workspace.shipments}
          selectedId={workspace.selectedId}
          onSelect={workspace.select}
        />
        <div className="sidebar-foot">
          <span className="status-dot" />
          Local receiver online<p>Parcelwave development environment</p>
        </div>
      </aside>
      <main>
        <header className="topbar">
          <span>
            Workspace <span className="muted">/ Shipments</span>
          </span>
          <button
            className="secondary"
            disabled={workspace.loading}
            onClick={() => void workspace.refresh()}
          >
            Refresh inbox
          </button>
        </header>
        {workspace.error && (
          <p role="alert" className="error workspace-error">
            {workspace.error}
          </p>
        )}
        {!workspace.detail ? (
          <div className="loading" role="status">
            Loading shipment…
          </div>
        ) : (
          <div className="main-content">
            <ShipmentSummary shipment={workspace.detail.shipment} />
            <Simulator
              shipmentId={workspace.selectedId}
              onComplete={workspace.refresh}
            />
            <div className="content-grid">
              <DeliveryList deliveries={workspace.detail.deliveries} />
              <Journal entries={workspace.detail.journal} />
            </div>
            <label className="shift-note">
              Shift note{" "}
              <span className="muted">
                Private draft for your investigation
              </span>
              <textarea
                value={note}
                onChange={(event) => setNote(event.target.value)}
                placeholder="What should the next operator know?"
                rows={2}
              />
            </label>
          </div>
        )}
      </main>
    </div>
  );
}
