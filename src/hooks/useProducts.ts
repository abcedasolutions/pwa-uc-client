import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { getAllProducts } from "../db/indexedDb";
import { onSyncChange } from "../db/syncEngine";

export function useProducts() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const unsubscribe = onSyncChange(() => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    });
    return () => {
      unsubscribe();
    };
  }, [queryClient]);

  return useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const products = await getAllProducts();
      return products.filter((p) => !p.deletedAt).sort((a, b) => a.name.localeCompare(b.name));
    },
    staleTime: Infinity,
  });
}
