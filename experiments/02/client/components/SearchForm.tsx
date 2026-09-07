import type { FormEvent } from 'react';
import type { SourceSummary } from '../types';

interface Props {
  query: string;
  sourceId: string;
  busy: boolean;
  sources: SourceSummary[];
  onQuery: (value: string) => void;
  onSource: (value: string) => void;
  onSearch: () => void;
}

export function SearchForm({ query, sourceId, busy, sources, onQuery, onSource, onSearch }: Props) {
  function submit(event: FormEvent) {
    event.preventDefault();
    onSearch();
  }
  return (
    <form className="search-form" onSubmit={submit}>
      <label htmlFor="query">What are you trying to understand?</label>
      <div className="search-inputs">
        <input id="query" value={query} maxLength={500} onChange={(event) => onQuery(event.target.value)} placeholder="Try onboarding, privacy, or handoff" />
        <button type="submit" className="primary" disabled={busy || !query.trim()}>{busy ? 'Searching…' : 'Search notes'}</button>
      </div>
      <label className="filter-label" htmlFor="source-filter">Search within</label>
      <select id="source-filter" value={sourceId} onChange={(event) => onSource(event.target.value)}>
        <option value="">All sources</option>
        {sources.map((source) => <option key={source.id} value={source.id}>{source.name}</option>)}
      </select>
    </form>
  );
}
