import type { Store } from './repository';
import type { Document, SearchInput, SearchResult } from './types';

function terms(value: string): string[] {
  return value.toLowerCase().match(/[a-z0-9]+/g) ?? [];
}

function score(document: Document, tokens: string[]): number {
  const title = terms(document.title);
  const body = terms(document.body);
  return tokens.reduce((sum, token) => sum + (title.includes(token) ? 5 : 0) + (body.includes(token) ? 1 : 0), 0);
}

export function searchDocuments(store: Store, input: SearchInput): SearchResult {
  const tokens = terms(input.query);
  const documents = store.listDocuments(input.sourceId)
    .map((document) => ({ document, score: score(document, tokens) }))
    .filter((match) => match.score > 0)
    .sort((a, b) => b.score - a.score || a.document.id.localeCompare(b.document.id))
    .slice(0, 5)
    .map(({ document }) => document);
  const citations = documents.slice(0, 3).map((document, index) => ({
    number: index + 1,
    documentId: document.id,
    quote: document.body.split('. ')[0].replace(/\.$/, '') + '.',
  }));
  const answer = citations.length
    ? citations.map((citation) => `${citation.quote} [${citation.number}]`).join('\n\n')
    : 'No matching evidence yet. Try a shorter query, change the source filter, or import more documents.';
  console.info(JSON.stringify({ event: 'search.completed', query: input.query, sourceId: input.sourceId ?? null, matches: documents.length, citations: citations.length }));
  return { query: input.query, answer, documents, citations };
}
