import { BatchList } from "./components/BatchList";
import { Composer } from "./components/Composer";
import { Review } from "./components/Review";
import { useWorkspace } from "./hooks/useWorkspace";

export default function App() {
  const workspace = useWorkspace();
  return <div className="app-shell">
    <header className="topbar"><a className="brand" href="/"><span aria-hidden="true">▦</span>contactsheet</a>
      <span className="workspace-label">Studio workspace <span className="workspace-dot" /></span></header>
    <div className="intro"><div><p className="eyebrow">A little clarity, frame by frame</p>
      <h1>A second look at your next launch.</h1></div>
      <p>Collect a batch, get a visual review, and take the results with you.</p></div>
    {workspace.error && <div className="global-error" role="alert">{workspace.error}</div>}
    <main className="workspace">
      <aside>
        <Composer catalog={workspace.catalog} onCreated={(id) => { workspace.select(id); workspace.refresh(); }} />
        <BatchList batches={workspace.batches} selectedId={workspace.selectedId} onSelect={workspace.select} />
      </aside>
      {workspace.detail ? <Review key={workspace.detail.batch.id} detail={workspace.detail}
        assets={workspace.catalog?.assets || []} onRefresh={workspace.refresh} />
        : <section className="empty-review"><span aria-hidden="true">▦</span><h2>Your review space</h2>
          <p className="muted">Select a review or create a new batch.</p></section>}
    </main>
    <footer>Contactsheet · An experimental visual review workspace</footer>
  </div>;
}
