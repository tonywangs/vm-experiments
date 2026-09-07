import { useCallback, useState } from 'react';
import { api } from './api';
import { useLibrary } from './hooks/useLibrary';
import { SourceCard } from './components/SourceCard';
import { SearchForm } from './components/SearchForm';
import { AnswerPanel } from './components/AnswerPanel';
import { DocumentList } from './components/DocumentList';
import { DocumentDrawer } from './components/DocumentDrawer';
import type { Document, SearchResult } from './types';

export default function App() {
  const library = useLibrary();
  const [query, setQuery] = useState('onboarding');
  const [sourceId, setSourceId] = useState('');
  const [result, setResult] = useState<SearchResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Document | null>(null);
  const [sort, setSort] = useState<'relevance' | 'title'>('relevance');
  const closeDocument = useCallback(() => setSelected(null), []);

  async function search() {
    setBusy(true);
    setError(null);
    try {
      setResult(await api.search({ query, sourceId: sourceId || undefined }));
      setSelected(null);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Search failed');
    } finally {
      setBusy(false);
    }
  }

  const visibleDocuments = [...(result?.documents ?? library.documents)];
  if (sort === 'title') visibleDocuments.sort((a, b) => a.title.localeCompare(b.title));

  return (
    <div className="app-shell">
      <header className="topbar"><a href="/" className="brand"><span>f.</span> Fieldnotes</a><span className="topbar-note">Research workspace / Experiment 07</span></header>
      <main>
        <section className="page-intro">
          <span className="eyebrow">A small library with a long memory</span>
          <h1>Answers you can trace.</h1>
          <p>Bring scattered notes together, ask a focused question, and check the source behind every finding.</p>
        </section>
        <div className="workspace-layout">
          <aside className="sources-panel">
            <div className="section-heading"><h2>Connected sources</h2><span className="badge">2 local fixtures</span></div>
            {library.sources.map((source) => <SourceCard key={source.id} source={source} busy={library.importing === source.id} disabled={library.importing !== null} onImport={() => void library.importSource(source.id)} />)}
            {library.message && <p role="status" className="notice">{library.message}</p>}
            {library.error && <p role="alert" className="error">{library.error}</p>}
            <div className="workspace-note"><strong>A source is a starting point.</strong><p>Imports stay in this workspace. Search uses local notes; it never contacts a model service.</p></div>
          </aside>
          <div className="research-panel">
            <SearchForm query={query} sourceId={sourceId} busy={busy} sources={library.sources} onQuery={setQuery} onSource={setSourceId} onSearch={() => void search()} />
            {error && <p role="alert" className="error">{error}</p>}
            {result && <AnswerPanel result={result} documents={visibleDocuments} onOpen={setSelected} />}
            <div className="view-controls">
              <label htmlFor="result-order">Document order</label>
              <select id="result-order" value={sort} onChange={(event) => setSort(event.target.value as typeof sort)}>
                <option value="relevance">Relevance</option><option value="title">Title A–Z</option>
              </select>
              {result && <button className="text-button" onClick={() => setResult(null)}>Show full library</button>}
            </div>
            <DocumentList documents={visibleDocuments} onOpen={setSelected} title={result ? 'Retrieved documents' : 'Library'} />
          </div>
        </div>
      </main>
      <footer>Fieldnotes · Local research prototype · Verify evidence before you share</footer>
      {selected && <DocumentDrawer document={selected} onClose={closeDocument} />}
    </div>
  );
}
