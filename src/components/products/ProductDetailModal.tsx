import { useState } from "react";
import type { Product } from "../../api/types";
import { Modal } from "../common/Modal";
import { useProduct } from "../../hooks/useProduct";
import { MovementHistoryList } from "../movements/MovementHistoryList";
import { registerMovementAction } from "../../db/actions";

function formatMoney(n: number | null) {
  if (n === undefined || n === null) return "—";
  return "S/ " + Number(n).toFixed(2);
}

export function ProductDetailModal({
  open,
  onClose,
  productId,
  onEdit,
}: {
  open: boolean;
  onClose: () => void;
  productId: string | null;
  onEdit: (product: Product) => void;
}) {
  const { product, movements } = useProduct(open ? productId : null);
  const [qty, setQty] = useState("1");
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);

  if (!product) return null;

  async function handleMovement(type: "in" | "out") {
    setError(null);
    try {
      await registerMovementAction({ productId: product!._id, type, qty: Math.max(1, Number(qty) || 1), note });
      setNote("");
      setQty("1");
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo registrar el movimiento.");
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={product.name} wide>
      <div className="space-y-1 rounded-lg bg-slate-50 p-3 text-sm">
        <Row label="Código" value={product.code} />
        <Row label="Categoría" value={product.category || "Sin categoría"} />
        <Row label="Cantidad" value={`${product.quantity} u.`} />
        <Row label="Stock mínimo" value={`${product.minStock ?? 0} u.`} />
        <Row label="Precio" value={formatMoney(product.price)} />
        {product.notes && <Row label="Notas" value={product.notes} />}
      </div>

      <div className="mt-4 space-y-2">
        <label className="block text-sm font-medium text-slate-700">Cantidad</label>
        <div className="flex flex-wrap gap-2">
          <input
            type="number"
            min={1}
            step="1"
            value={qty}
            onChange={(e) => setQty(e.target.value)}
            className="w-20 rounded-lg border border-slate-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
          />
          <button
            type="button"
            onClick={() => handleMovement("in")}
            className="flex-1 rounded-lg bg-emerald-100 px-3 py-2 text-sm font-medium text-emerald-700 hover:bg-emerald-200"
          >
            + Entrada
          </button>
          <button
            type="button"
            onClick={() => handleMovement("out")}
            className="flex-1 rounded-lg bg-amber-100 px-3 py-2 text-sm font-medium text-amber-700 hover:bg-amber-200"
          >
            − Salida
          </button>
        </div>
        <input
          type="text"
          placeholder="Nota (opcional)"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>

      <h3 className="mt-4 mb-1 text-sm font-semibold text-slate-700">Historial de movimientos</h3>
      <MovementHistoryList movements={movements} />

      <div className="mt-4 flex justify-end">
        <button
          type="button"
          onClick={() => onEdit(product)}
          className="rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200"
        >
          Editar producto
        </button>
      </div>
    </Modal>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-slate-500">{label}</span>
      <strong className="text-slate-900">{value}</strong>
    </div>
  );
}
