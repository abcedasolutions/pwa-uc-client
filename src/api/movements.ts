import { apiFetch } from "./client";
import type { Movement } from "./types";

export async function fetchMovements(params: { productId?: string } = {}): Promise<Movement[]> {
  const qs = params.productId ? `?productId=${encodeURIComponent(params.productId)}` : "";
  const data = await apiFetch(`/movements${qs}`);
  return data.movements;
}

export async function createMovement(input: {
  productId: string;
  type: "in" | "out" | "adjustment";
  qty: number;
  note?: string;
  clientMutationId: string;
}): Promise<Movement> {
  const data = await apiFetch("/movements", { method: "POST", body: JSON.stringify(input) });
  return data.movement;
}
