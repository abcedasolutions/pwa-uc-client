import { apiFetch } from "./client";
import type { InventoryCount, InventoryCountItem } from "./types";

export async function fetchInventoryCounts(params: { from?: string; to?: string } = {}): Promise<InventoryCount[]> {
  const qs = new URLSearchParams();
  if (params.from) qs.set("from", params.from);
  if (params.to) qs.set("to", params.to);
  const suffix = qs.toString() ? `?${qs.toString()}` : "";
  const data = await apiFetch(`/inventory-counts${suffix}`);
  return data.inventoryCounts;
}

export async function createInventoryCount(input: {
  period: string;
  description?: string;
  startDate: string;
  endDate?: string | null;
}): Promise<InventoryCount> {
  const data = await apiFetch("/inventory-counts", { method: "POST", body: JSON.stringify(input) });
  return data.inventoryCount;
}

export async function updateInventoryCount(
  id: string,
  input: Partial<Pick<InventoryCount, "description" | "startDate" | "endDate">>
): Promise<InventoryCount> {
  const data = await apiFetch(`/inventory-counts/${id}`, { method: "PUT", body: JSON.stringify(input) });
  return data.inventoryCount;
}

export async function closeInventoryCount(id: string): Promise<InventoryCount> {
  const data = await apiFetch(`/inventory-counts/${id}/close`, { method: "POST" });
  return data.inventoryCount;
}

export async function deleteInventoryCount(id: string): Promise<void> {
  await apiFetch(`/inventory-counts/${id}`, { method: "DELETE" });
}

export async function recordCountItem(
  inventoryCountId: string,
  input: { productId?: string; productCode?: string; countedQty: number }
): Promise<InventoryCountItem> {
  const data = await apiFetch(`/inventory-counts/${inventoryCountId}/items`, {
    method: "POST",
    body: JSON.stringify(input),
  });
  return data.item;
}

export async function fetchCountItems(
  inventoryCountId: string,
  params: { search?: string } = {}
): Promise<InventoryCountItem[]> {
  const qs = params.search ? `?search=${encodeURIComponent(params.search)}` : "";
  const data = await apiFetch(`/inventory-counts/${inventoryCountId}/items${qs}`);
  return data.items;
}
