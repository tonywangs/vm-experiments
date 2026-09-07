import { atlasDocuments, beaconDocuments } from './documents';
import type { PageProvider, ProviderPage } from '../types';

const pages: Record<string, Record<string, ProviderPage>> = {
  atlas: {
    first: { documents: atlasDocuments.slice(0, 2), nextCursor: 'atlas:segment/b' },
    'atlas:segment/b': { documents: [], nextCursor: 'atlas:segment/c' },
    'atlas:segment/c': { documents: atlasDocuments.slice(2), nextCursor: null },
  },
  beacon: {
    first: { documents: beaconDocuments.slice(0, 2), nextCursor: 'beacon:tail?version=7' },
    'beacon:tail?version=7': { documents: beaconDocuments.slice(2), nextCursor: null },
  },
};

export const fetchPage: PageProvider = async (sourceId, cursor) => {
  await new Promise((resolve) => setTimeout(resolve, 160));
  const page = pages[sourceId]?.[cursor ?? 'first'];
  if (!page) throw new Error(`Unknown cursor for source ${sourceId}: ${cursor}`);
  console.info(JSON.stringify({ event: 'provider.page', sourceId, cursor, count: page.documents.length, nextCursor: page.nextCursor }));
  return structuredClone(page);
};
