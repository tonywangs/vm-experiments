import type { Store } from './repository';
import type { ImportReceipt, PageProvider } from './types';

export function createImporter(store: Store, provider: PageProvider) {
  const busy = new Set<string>();

  async function importSource(sourceId: string): Promise<ImportReceipt> {
    if (busy.has(sourceId)) throw new Error('This source is already importing. Try again in a moment.');
    busy.add(sourceId);
    let cursor: string | null = null;
    let received = 0;
    let pages = 0;
    try {
      do {
        const page = await provider(sourceId, cursor);
        pages += 1;
        for (const document of page.documents) {
          store.upsertDocument(sourceId, document);
          received += 1;
        }
        console.info(JSON.stringify({ event: 'import.progress', sourceId, pages, received, nextCursor: page.nextCursor }));
        if (page.documents.length === 0) break;
        cursor = page.nextCursor;
      } while (cursor !== null);
      const receipt = { sourceId, received, pages, completedAt: new Date().toISOString() };
      store.saveReceipt(receipt);
      console.info(JSON.stringify({ event: 'import.completed', ...receipt }));
      return receipt;
    } finally {
      busy.delete(sourceId);
    }
  }

  return { importSource };
}
