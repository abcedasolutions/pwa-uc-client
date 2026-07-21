import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchInventoryCounts,
  createInventoryCount,
  updateInventoryCount,
  closeInventoryCount,
  deleteInventoryCount,
} from "../api/inventoryCounts";

export function useInventoryCounts(params: { from?: string; to?: string } = {}) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["inventoryCounts", params],
    queryFn: () => fetchInventoryCounts(params),
  });

  function invalidate() {
    queryClient.invalidateQueries({ queryKey: ["inventoryCounts"] });
  }

  return {
    inventoryCounts: query.data ?? [],
    isLoading: query.isLoading,
    async create(input: Parameters<typeof createInventoryCount>[0]) {
      const created = await createInventoryCount(input);
      invalidate();
      return created;
    },
    async update(id: string, input: Parameters<typeof updateInventoryCount>[1]) {
      const updated = await updateInventoryCount(id, input);
      invalidate();
      return updated;
    },
    async close(id: string) {
      const closed = await closeInventoryCount(id);
      invalidate();
      return closed;
    },
    async remove(id: string) {
      await deleteInventoryCount(id);
      invalidate();
    },
  };
}
