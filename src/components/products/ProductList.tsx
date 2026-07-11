import { useMemo, useState } from "react";
import type { Product } from "../../api/types";
import { ProductCard, isLowStock } from "./ProductCard";

export function ProductList({ products, onOpen }: { products: Product[]; onOpen: (product: Product) => void }) {
  const [search, setSearch] = useState("");
  const [onlyLow, setOnlyLow] = useState(false);

  const filtered = useMemo(() => {
    let list = products;
    const term = search.trim().toLowerCase();
    if (term) {
      list = list.filter(
        (p) => p.name.toLowerCase().includes(term) || p.code.toLowerCase().includes(term)
      );
    }
    if (onlyLow) list = list.filter(isLowStock);
    return list;
  }, [products, search, onlyLow]);

  const lowCount = useMemo(() => products.filter(isLowStock).length, [products]);

  return (
    <div>
      {lowCount > 0 && (
        <div className="mb-4 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
          ⚠️ {lowCount} producto(s) con stock bajo mínimo.
        </div>
      )}

      <div className="mb-4 space-y-2">
        <input
          type="search"
          placeholder="Buscar por nombre o código…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
        />
        <label className="flex w-fit items-center gap-2 text-sm text-slate-600">
          <input type="checkbox" checked={onlyLow} onChange={(e) => setOnlyLow(e.target.checked)} />
          Solo bajo stock
        </label>
      </div>

      {products.length === 0 ? (
        <p className="py-8 text-center text-sm text-slate-400">
          Aún no hay productos. Escanea un código o agrégalo manualmente.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {filtered.map((p) => (
            <ProductCard key={p._id} product={p} onOpen={() => onOpen(p)} />
          ))}
        </div>
      )}
    </div>
  );
}
