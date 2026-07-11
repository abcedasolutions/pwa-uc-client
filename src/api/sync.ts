import { apiFetch } from "./client";
import type { Product, Movement } from "./types";

export interface SyncMovementResult {
  clientMutationId: string;
  status: "applied" | "duplicate" | "error";
  movementId?: string;
  error?: string;
}

export async function pushMovements(movements: any[]): Promise<SyncMovementResult[]> {
  const data = await apiFetch("/sync/movements", { method: "POST", body: JSON.stringify({ movements }) });
  return data.results;
}

export async function pull(since: string): Promise<{ products: Product[]; movements: Movement[]; serverTime: string }> {
  return apiFetch(`/sync/pull?since=${encodeURIComponent(since)}`);
}
