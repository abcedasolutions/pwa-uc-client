import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchCountItems, recordCountItem } from "../api/inventoryCounts";
import { runSync } from "../db/syncEngine";
import { ApiError } from "../api/client";

export function useCountItems(inventoryCountId: string | null, search = "") {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["countItems", inventoryCountId, search],
    queryFn: () => fetchCountItems(inventoryCountId as string, { search: search || undefined }),
    enabled: !!inventoryCountId,
  });

  async function record(input: { productId?: string; productCode?: string; countedQty: number }) {
    if (!inventoryCountId) throw new Error("No hay un inventario activo.");
    try {
      const item = await recordCountItem(inventoryCountId, input);
      queryClient.invalidateQueries({ queryKey: ["countItems", inventoryCountId] });
      return item;
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) {
        await runSync();
        const item = await recordCountItem(inventoryCountId, input);
        queryClient.invalidateQueries({ queryKey: ["countItems", inventoryCountId] });
        return item;
      }
      throw err;
    }
  }

  return { items: query.data ?? [], isLoading: query.isLoading, record };
}
