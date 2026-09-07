export interface Source {
  id: string;
  name: string;
  description: string;
  color: string;
  icon: string;
}

export interface RemoteDocument {
  id: string;
  title: string;
  body: string;
  url: string;
  updatedAt: string;
  tags: string[];
}

export interface Document extends Omit<RemoteDocument, 'id'> {
  id: string;
  remoteId: string;
  sourceId: string;
  sourceName: string;
}

export interface ProviderPage {
  documents: RemoteDocument[];
  nextCursor: string | null;
}

export type PageProvider = (sourceId: string, cursor: string | null) => Promise<ProviderPage>;

export interface ImportReceipt {
  sourceId: string;
  received: number;
  pages: number;
  completedAt: string;
}

export interface SourceSummary extends Source {
  documentCount: number;
  lastImport: ImportReceipt | null;
}

export interface Citation {
  number: number;
  documentId: string;
  quote: string;
}

export interface SearchResult {
  query: string;
  answer: string;
  documents: Document[];
  citations: Citation[];
}

export interface SearchInput {
  query: string;
  sourceId?: string;
}
