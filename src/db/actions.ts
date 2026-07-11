import type { Product, Movement } from "../api/types";
import {
  getProduct,
  putProduct,
  putMovement,
  enqueueOutbox,
  deleteProductLocal as deleteProductFromCache,
} from "./indexedDb";
import { runSync, notifyLocalChange } from "./syncEngine";

function uuid() {
  return crypto.randomUUID();
}

function nowIso() {
  return new Date().toISOString();
}

function tempId() {
  return `local-${uuid()}`;
}

export async function createProductAction(
  input: Omit<Product, "_id" | "businessId" | "version" | "deletedAt" | "createdAt" | "updatedAt">
): Promise<Product> {
  const clientMutationId = uuid();
  const now = nowIso();
  const localId = tempId();
  const localProduct: Product = {
    ...input,
    _id: localId,
    businessId: "",
    version: 0,
    deletedAt: null,
    createdAt: now,
    updatedAt: now,
  };
  await putProduct(localProduct);
  await enqueueOutbox({
    clientMutationId,
    kind: "productCreate",
    payload: { tempId: localId, fields: input },
    baseVersion: null,
    createdAt: now,
    attempts: 0,
    lastError: null,
  });
  notifyLocalChange();
  runSync();
  return localProduct;
}

export async function updateProductAction(
  id: string,
  fields: Partial<Pick<Product, "code" | "name" | "category" | "price" | "minStock" | "notes">>
): Promise<Product> {
  const existing = await getProduct(id);
  if (!existing) throw new Error("Producto no encontrado localmente.");

  const updated: Product = { ...existing, ...fields, updatedAt: nowIso() };
  await putProduct(updated);

  const clientMutationId = uuid();
  await enqueueOutbox({
    clientMutationId,
    kind: "productUpdate",
    payload: { id, fields },
    baseVersion: existing.version,
    createdAt: nowIso(),
    attempts: 0,
    lastError: null,
  });
  notifyLocalChange();
  runSync();
  return updated;
}

export async function deleteProductAction(id: string): Promise<void> {
  const existing = await getProduct(id);
  if (!existing) return;
  await deleteProductFromCache(id);

  const clientMutationId = uuid();
  await enqueueOutbox({
    clientMutationId,
    kind: "productDelete",
    payload: { id },
    baseVersion: existing.version,
    createdAt: nowIso(),
    attempts: 0,
    lastError: null,
  });
  notifyLocalChange();
  runSync();
}

export async function registerMovementAction(input: {
  productId: string;
  type: "in" | "out" | "adjustment";
  qty: number;
  note?: string;
}): Promise<void> {
  const product = await getProduct(input.productId);
  if (!product) throw new Error("Producto no encontrado localmente.");

  const delta = input.type === "out" ? -input.qty : input.qty;
  const newQty = product.quantity + delta;
  if (newQty < 0) {
    throw new Error("No hay suficiente stock para esa salida.");
  }

  const clientMutationId = uuid();
  const now = nowIso();

  const updatedProduct: Product = { ...product, quantity: newQty, updatedAt: now };
  await putProduct(updatedProduct);

  const localMovement: Movement = {
    _id: `local-${clientMutationId}`,
    businessId: product.businessId,
    productId: product._id,
    code: product.code,
    productName: product.name,
    type: input.type,
    qty: input.qty,
    note: input.note || "",
    date: now,
    createdBy: "",
    clientMutationId,
    createdAt: now,
  };
  await putMovement(localMovement);

  await enqueueOutbox({
    clientMutationId,
    kind: "movement",
    payload: {
      clientMutationId,
      productCode: product.code,
      type: input.type,
      qty: input.qty,
      note: input.note || "",
      date: now,
    },
    baseVersion: null,
    createdAt: now,
    attempts: 0,
    lastError: null,
  });
  notifyLocalChange();
  runSync();
}

export async function quickAdjustAction(productId: string, delta: 1 | -1): Promise<void> {
  await registerMovementAction({
    productId,
    type: delta > 0 ? "in" : "out",
    qty: 1,
    note: "",
  });
}
