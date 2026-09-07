import { rmSync } from 'node:fs';
import { getDatabasePath } from './env';
import { createStore } from './repository';

const path = getDatabasePath();
for (const suffix of ['', '-wal', '-shm']) rmSync(path + suffix, { force: true });
const store = createStore(path);
console.log(`Seeded ${store.listDocuments().length} sample document in ${path}`);
store.close();
