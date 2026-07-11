import type { Product, Movement } from "../api/types";

const DB_NAME = "inventario-app";
const DB_VERSION = 1;

export interface OutboxEntry {
  clientMutationId: string;
  kind: "movement" | "productCreate" | "productUpdate" | "productDelete";
  payload: any;
  baseVersion: number | null;
  createdAt: string;
  attempts: number;
  lastError: string | null;
}

let dbPromise: Promise<IDBDatabase> | null = null;

function open(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains("products")) {
        db.createObjectStore("products", { keyPath: "_id" });
      }
      if (!db.objectStoreNames.contains("movements")) {
        const store = db.createObjectStore("movements", { keyPath: "_id" });
        store.createIndex("by_product", "productId");
      }
      if (!db.objectStoreNames.contains("outbox")) {
        const store = db.createObjectStore("outbox", { keyPath: "clientMutationId" });
        store.createIndex("by_kind", "kind");
      }
      if (!db.objectStoreNames.contains("meta")) {
        db.createObjectStore("meta", { keyPath: "key" });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
  return dbPromise;
}

async function tx(storeNames: string[], mode: IDBTransactionMode) {
  const db = await open();
  return db.transaction(storeNames, mode);
}

function promisify<T>(req: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

// ---------- Products ----------

export async function getAllProducts(): Promise<Product[]> {
  const t = await tx(["products"], "readonly");
  return promisify(t.objectStore("products").getAll());
}

export async function getProduct(id: string): Promise<Product | null> {
  const t = await tx(["products"], "readonly");
  const result = await promisify(t.objectStore("products").get(id));
  return result ?? null;
}

export async function getProductByCode(code: string): Promise<Product | null> {
  const products = await getAllProducts();
  return products.find((p) => p.code === code) ?? null;
}

export async function putProduct(product: Product): Promise<void> {
  const t = await tx(["products"], "readwrite");
  await promisify(t.objectStore("products").put(product));
}

export async function putProducts(products: Product[]): Promise<void> {
  const t = await tx(["products"], "readwrite");
  const store = t.objectStore("products");
  for (const p of products) store.put(p);
  await promisify(t.objectStore("products").count());
}

export async function deleteProductLocal(id: string): Promise<void> {
  const t = await tx(["products"], "readwrite");
  await promisify(t.objectStore("products").delete(id));
}

// ---------- Movements ----------

export async function getMovementsByProduct(productId: string): Promise<Movement[]> {
  const t = await tx(["movements"], "readonly");
  const idx = t.objectStore("movements").index("by_product");
  const results = await promisify(idx.getAll(IDBKeyRange.only(productId)));
  return results.sort((a, b) => b.date.localeCompare(a.date));
}

export async function putMovement(movement: Movement): Promise<void> {
  const t = await tx(["movements"], "readwrite");
  await promisify(t.objectStore("movements").put(movement));
}

export async function putMovements(movements: Movement[]): Promise<void> {
  const t = await tx(["movements"], "readwrite");
  const store = t.objectStore("movements");
  for (const m of movements) store.put(m);
  await promisify(t.objectStore("movements").count());
}

export async function deleteMovementLocal(id: string): Promise<void> {
  const t = await tx(["movements"], "readwrite");
  await promisify(t.objectStore("movements").delete(id));
}

// ---------- Outbox ----------

export async function enqueueOutbox(entry: OutboxEntry): Promise<void> {
  const t = await tx(["outbox"], "readwrite");
  await promisify(t.objectStore("outbox").put(entry));
}

export async function getOutbox(): Promise<OutboxEntry[]> {
  const t = await tx(["outbox"], "readonly");
  return promisify(t.objectStore("outbox").getAll());
}

export async function getOutboxByKind(kind: OutboxEntry["kind"]): Promise<OutboxEntry[]> {
  const t = await tx(["outbox"], "readonly");
  const idx = t.objectStore("outbox").index("by_kind");
  return promisify(idx.getAll(IDBKeyRange.only(kind)));
}

export async function removeFromOutbox(clientMutationId: string): Promise<void> {
  const t = await tx(["outbox"], "readwrite");
  await promisify(t.objectStore("outbox").delete(clientMutationId));
}

export async function updateOutboxAttempt(clientMutationId: string, error: string): Promise<void> {
  const t = await tx(["outbox"], "readwrite");
  const store = t.objectStore("outbox");
  const entry = await promisify(store.get(clientMutationId));
  if (entry) {
    entry.attempts += 1;
    entry.lastError = error;
    store.put(entry);
  }
}

// ---------- Meta ----------

export async function getMeta(key: string): Promise<any> {
  const t = await tx(["meta"], "readonly");
  const result = await promisify(t.objectStore("meta").get(key));
  return result?.value ?? null;
}

export async function setMeta(key: string, value: any): Promise<void> {
  const t = await tx(["meta"], "readwrite");
  await promisify(t.objectStore("meta").put({ key, value }));
}

export async function clearAllData(): Promise<void> {
  const t = await tx(["products", "movements", "outbox", "meta"], "readwrite");
  t.objectStore("products").clear();
  t.objectStore("movements").clear();
  t.objectStore("outbox").clear();
  t.objectStore("meta").clear();
  await promisify(t.objectStore("meta").count());
}
