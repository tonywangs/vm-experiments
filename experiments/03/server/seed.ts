import { createStore } from './repository';
import { getDatabasePath } from './env';

const path = getDatabasePath();
const store = createStore(path);
store.seed(true);
console.log(`Reset ${path} to three frames, four revisions, and three review comments.`);
store.close();
