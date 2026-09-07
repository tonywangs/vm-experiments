import { createStore } from "./repository";
import { getDatabasePath } from "./env";
const path = getDatabasePath();
const store = createStore(path);
store.seed(true);
store.close();
console.log(
  `Reset ${path} to three sample shipments and an empty delivery inbox.`,
);
