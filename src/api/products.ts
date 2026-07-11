import { apiFetch } from "./client";
import type { Product } from "./types";

export async function fetchProducts(params: { since?: string } = {}): Promise<Product[]> {
  const qs = params.since ? `?since=${encodeURIComponent(params.since)}` : "";
  const data = await apiFetch(`/products${qs}`);
  return data.products;
}

export async function createProduct(input: Partial<Product>): Promise<Product> {
  const data = await apiFetch("/products", { method: "POST", body: JSON.stringify(input) });
  return data.product;
}

export async function updateProduct(id: string, input: Partial<Product> & { version: number }): Promise<Product> {
  const data = await apiFetch(`/products/${id}`, { method: "PUT", body: JSON.stringify(input) });
  return data.product;
}

export async function deleteProduct(id: string): Promise<Product> {
  const data = await apiFetch(`/products/${id}`, { method: "DELETE" });
  return data.product;
}
