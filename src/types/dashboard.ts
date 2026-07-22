import type {
  Product,
  InventoryCount,
  Movement,
  InventoryCountItem,
} from "../api/types";

export interface DashboardKpis {
  totalProducts: number;
  totalInventories: number;
  totalCountItems: number;
  totalInventoryValue: number;
  lowStockProducts: number;
}

export interface CategorySummary {
  category: string;
  products: number;
  quantity: number;
  inventoryValue: number;
}

export interface LowStockProduct {
  id: string;
  name: string;
  quantity: number;
  minStock: number;
}

export interface DashboardData {
  kpis: DashboardKpis;
  categories: CategorySummary[];

  lowStock: LowStockProduct[];
  topProducts: Product[];

  products: Product[];
  inventories: InventoryCount[];
  countItems: InventoryCountItem[];
  movements: Movement[];
}
