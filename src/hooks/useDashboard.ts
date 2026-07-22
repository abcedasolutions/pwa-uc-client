import { useMemo } from "react";

import { useProducts } from "./useProducts";
import { useInventoryCounts } from "./useInventoryCounts";
import { useCountItems } from "./useCountItems";

import type { DashboardData, CategorySummary } from "../types/dashboard";
import type { InventoryCountItem, Movement } from "../api/types";

export function useDashboard(): DashboardData {
  const { data: products = [] } = useProducts();
  const { inventoryCounts = [] } = useInventoryCounts();

  const openInventory =
    inventoryCounts.find((i) => i.status === "open") ?? null;

  const { items: countItems = [] } = useCountItems(
    openInventory?._id ?? null
  );

  const dashboard = useMemo<DashboardData>(() => {
    const totalProducts = products.length;

    const totalInventories = inventoryCounts.length;

    const totalCountItems = countItems.length;

    const totalInventoryValue = products.reduce((sum, product) => {
      return sum + (product.price ?? 0) * product.quantity;
    }, 0);

    const lowStock = products
        .filter((product) => product.quantity <= product.minStock)
        .sort((a, b) => a.quantity - b.quantity)
        .slice(0, 5)
        .map((p) => ({
            id: p.code,
            name: p.name,
            quantity: p.quantity,
            minStock: p.minStock,
        }));

    const topProducts = [...products]
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 10);
    
    const categoryMap = new Map<string, CategorySummary>();

    for (const product of products) {
      const key = product.category || "Sin categoría";

      if (!categoryMap.has(key)) {
        categoryMap.set(key, {
          category: key,
          products: 0,
          quantity: 0,
          inventoryValue: 0,
        });
      }

      const category = categoryMap.get(key)!;

      category.products += 1;
      category.quantity += product.quantity;
      category.inventoryValue +=
        (product.price ?? 0) * product.quantity;
    }

    const categories = [...categoryMap.values()].sort(
      (a, b) => b.inventoryValue - a.inventoryValue
    );

    return {
      kpis: {
        totalProducts,
        totalInventories,
        totalCountItems,
        totalInventoryValue,
        lowStockProducts: lowStock.length,
      },

      categories,

      lowStock,

      topProducts,

      products,

      inventories: inventoryCounts,

      countItems,

      // Lo llenaremos cuando agreguemos el historial
      movements: [] as Movement[],
    };
  }, [products, inventoryCounts, countItems]);

  return dashboard;
}