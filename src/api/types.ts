export interface Product {
  _id: string;
  businessId: string;
  code: string;
  name: string;
  category: string;
  price: number | null;
  quantity: number;
  minStock: number;
  notes: string;
  version: number;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
  // Catalog attributes (Maestro Productos)
  weight: number | null;
  brand: string;
  type: string;
  unit: string;
}

export interface Movement {
  _id: string;
  businessId: string;
  productId: string;
  code: string;
  productName: string;
  type: "in" | "out" | "adjustment";
  qty: number;
  note: string;
  date: string;
  createdBy: string;
  clientMutationId: string;
  createdAt: string;
}

export interface InventoryCount {
  _id: string;
  businessId: string;
  period: string;
  description: string;
  startDate: string;
  endDate: string | null;
  status: "open" | "closed";
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface InventoryCountItem {
  _id: string;
  inventoryCountId: string;
  productId: string;
  code: string;
  productName: string;
  countedQty: number;
  countedAt: string;
  weight: number | null;
  brand: string;
}
