import type { Product } from "../../api/types";
import { quickAdjustAction } from "../../db/actions";

function formatMoney(n: number | null) {
  if (n === undefined || n === null) return "—";
  return "S/ " + Number(n).toFixed(2);
}

function isLowStock(p: Product) {
  return p.minStock > 0 && p.quantity <= p.minStock;
}

export function ProductCard({ product, onOpen }: { product: Product; onOpen: () => void }) {
  const low = isLowStock(product);

  return (
    <div
      onClick={onOpen}
      className={`cursor-pointer rounded-xl border bg-white p-4 shadow-sm transition hover:shadow-md ${
        low ? "border-amber-300" : "border-slate-200"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="font-semibold text-slate-900">{product.name}</div>
          <div className="text-xs text-slate-400">{product.code}</div>
        </div>
        <span
          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
            low ? "bg-amber-100 text-amber-700" : "bg-blue-100 text-blue-700"
          }`}
        >
          {product.quantity} u.
        </span>
      </div>
      <div className="mt-2 flex items-center justify-between text-sm text-slate-500">
        <span>{product.category || "Sin categoría"}</span>
        <span>{formatMoney(product.price)}</span>
      </div>
      <div className="mt-3 flex gap-2" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          onClick={() => quickAdjustAction(product._id, -1)}
          className="flex-1 rounded-lg bg-amber-100 py-1.5 text-sm font-medium text-amber-700 hover:bg-amber-200"
        >
          − 1
        </button>
        <button
          type="button"
          onClick={() => quickAdjustAction(product._id, 1)}
          className="flex-1 rounded-lg bg-emerald-100 py-1.5 text-sm font-medium text-emerald-700 hover:bg-emerald-200"
        >
          + 1
        </button>
      </div>
    </div>
  );
}

export { isLowStock };
