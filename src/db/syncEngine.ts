import {
  getOutbox,
  removeFromOutbox,
  updateOutboxAttempt,
  putProducts,
  putMovements,
  getMeta,
  setMeta,
  putProduct,
  deleteProductLocal,
  deleteMovementLocal,
} from "./indexedDb";
import { pushMovements } from "../api/sync";
import { pull as pullApi } from "../api/sync";
import { createProduct, updateProduct, deleteProduct } from "../api/products";
import { ApiError } from "../api/client";

type Listener = () => void;
const listeners = new Set<Listener>();
export function onSyncChange(cb: Listener) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}
function notify() {
  listeners.forEach((cb) => cb());
}

// Called by db/actions.ts right after any local IndexedDB write (create/update/
// delete/movement), independent of whether a sync round actually runs — a
// product created while offline must show up in the UI immediately, not only
// once connectivity returns and runSync() gets a chance to notify().
export function notifyLocalChange() {
  notify();
}

let syncing = false;

export async function runSync(): Promise<void> {
  if (syncing) return;
  if (!navigator.onLine) return;
  syncing = true;
  notify();
  try {
    await pushMovementsFromOutbox();
    await pushProductMutations();
    await pullFromServer();
  } finally {
    syncing = false;
    notify();
  }
}

export function isSyncing() {
  return syncing;
}

async function pushMovementsFromOutbox() {
  const outbox = (await getOutbox()).filter((e) => e.kind === "movement");
  if (outbox.length === 0) return;

  const batch = outbox.slice(0, 50).map((e) => e.payload);
  try {
    const results = await pushMovements(batch);
    for (const result of results) {
      if (result.status === "applied" || result.status === "duplicate") {
        await removeFromOutbox(result.clientMutationId);
        // Drop the optimistic local copy; the authoritative movement (with the
        // server _id) will be picked up by the pull step that follows.
        await deleteMovementLocal(`local-${result.clientMutationId}`);
      } else {
        await updateOutboxAttempt(result.clientMutationId, result.error || "Error desconocido");
      }
    }
  } catch (err: any) {
    for (const entry of outbox.slice(0, 50)) {
      await updateOutboxAttempt(entry.clientMutationId, err.message || "Error de red");
    }
  }
}

async function pushProductMutations() {
  const entries = (await getOutbox()).filter((e) => e.kind !== "movement");
  for (const entry of entries) {
    try {
      if (entry.kind === "productCreate") {
        const created = await createProduct(entry.payload.fields);
        await putProduct(created);
        await deleteProductLocal(entry.payload.tempId);
      } else if (entry.kind === "productUpdate") {
        const updated = await updateProduct(entry.payload.id, {
          ...entry.payload.fields,
          version: entry.baseVersion ?? 0,
        });
        await putProduct(updated);
      } else if (entry.kind === "productDelete") {
        const deleted = await deleteProduct(entry.payload.id);
        await putProduct(deleted);
      }
      await removeFromOutbox(entry.clientMutationId);
    } catch (err: any) {
      if (err instanceof ApiError && err.status === 409 && err.body?.product) {
        // Server has a newer version. Accept server state, drop this queued edit,
        // and surface the merged product locally so the UI reflects reality.
        await putProduct(err.body.product);
        await removeFromOutbox(entry.clientMutationId);
      } else {
        await updateOutboxAttempt(entry.clientMutationId, err.message || "Error de red");
      }
    }
  }
}

async function pullFromServer() {
  const businessId = await getMeta("businessId");
  const cursorKey = `lastSyncedAt:${businessId ?? "default"}`;
  const since = (await getMeta(cursorKey)) || new Date(0).toISOString();

  const { products, movements, serverTime } = await pullApi(since);

  const pendingOutbox = await getOutbox();
  const pendingProductIds = new Set(
    pendingOutbox
      .filter((e) => e.kind === "productUpdate" || e.kind === "productDelete")
      .map((e) => e.payload.id)
  );

  const productsToApply = products.filter((p) => !pendingProductIds.has(p._id));
  await putProducts(productsToApply);
  await putMovements(movements);
  await setMeta(cursorKey, serverTime);
}

// ---------- Triggers ----------

let intervalHandle: number | null = null;

export function startSyncTriggers() {
  window.addEventListener("online", () => runSync());
  if (intervalHandle === null) {
    intervalHandle = window.setInterval(() => runSync(), 60_000);
  }
  runSync();
}

export function stopSyncTriggers() {
  if (intervalHandle !== null) {
    clearInterval(intervalHandle);
    intervalHandle = null;
  }
}
