
import { createStore } from "./db.js";

const store = createStore(process.env.DATABASE_PATH || "/app/data/eco-loewe.db");
const items = store.listShopItems("test-user");
console.log(JSON.stringify(items, null, 2));
store.close();
