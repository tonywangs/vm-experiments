import { expect, it } from 'vitest';
import { createStore } from '../server/repository';
import { createImporter } from '../server/importer';
import { beaconDocuments } from '../server/fixtures/documents';

it('imports a single page and records its receipt', async () => {
  const store = createStore(':memory:');
  try {
    const importer = createImporter(store, async () => ({ documents: [beaconDocuments[1]], nextCursor: null }));
    const receipt = await importer.importSource('beacon');
    expect(receipt.received).toBe(1);
    expect(receipt.pages).toBe(1);
    expect(store.listDocuments('beacon')[0].title).toBe('Escalation contacts');
    expect(store.listSources().find((source) => source.id === 'beacon')?.lastImport).toEqual(receipt);
  } finally {
    store.close();
  }
});
