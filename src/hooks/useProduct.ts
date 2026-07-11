import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { getProduct, getMovementsByProduct } from "../db/indexedDb";
import { onSyncChange } from "../db/syncEngine";

export function useProduct(id: string | null) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!id) return;
    const unsubscribe = onSyncChange(() => {
      queryClient.invalidateQueries({ queryKey: ["product", id] });
      queryClient.invalidateQueries({ queryKey: ["movements", id] });
    });
    return () => {
      unsubscribe();
    };
  }, [id, queryClient]);

  const productQuery = useQuery({
    queryKey: ["product", id],
    queryFn: () => getProduct(id as string),
    enabled: !!id,
    staleTime: Infinity,
  });

  const movementsQuery = useQuery({
    queryKey: ["movements", id],
    queryFn: () => getMovementsByProduct(id as string),
    enabled: !!id,
    staleTime: Infinity,
  });

  return { product: productQuery.data ?? null, movements: movementsQuery.data ?? [] };
}
