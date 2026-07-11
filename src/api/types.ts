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
