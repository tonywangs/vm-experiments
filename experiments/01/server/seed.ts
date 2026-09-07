import { createStore } from './repository';
import { getDatabasePath } from './env';

const path = getDatabasePath();
const store = createStore(path);
store.seed(true);
console.log(`Reset ${path} to three sample captures and their initial reports.`);
store.close();
