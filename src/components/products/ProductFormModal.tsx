import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import type { Product } from "../../api/types";
import { Modal } from "../common/Modal";
import { createProductAction, updateProductAction, deleteProductAction } from "../../db/actions";
import { useToast } from "../common/Toast";
import { getProductByCode, getAllProducts } from "../../db/indexedDb";
import { useAuth } from "../../hooks/useAuth";
import { useQuery } from "@tanstack/react-query";

export function ProductFormModal({
  open,
  onClose,
  existing,
  prefillCode,
}: {
  open: boolean;
  onClose: () => void;
  existing: Product | null;
  prefillCode?: string | null;
}) {
  const showToast = useToast();
  const { user } = useAuth();
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("0");
  const [minStock, setMinStock] = useState("0");
  const [notes, setNotes] = useState("");
  const [weight, setWeight] = useState("");
  const [brand, setBrand] = useState("");
  const [type, setType] = useState("");
  const [unit, setUnit] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const { data: allProducts = [] } = useQuery({
    queryKey: ["products", "for-suggestions"],
    queryFn: getAllProducts,
    staleTime: Infinity,
  });
  const uniqueValues = (values: (string | undefined)[]) =>
    Array.from(new Set(values.filter((v): v is string => !!v))).sort();
  const brandOptions = uniqueValues(allProducts.map((p) => p.brand));
  const typeOptions = uniqueValues(allProducts.map((p) => p.type));
  const unitOptions = uniqueValues(allProducts.map((p) => p.unit));

  useEffect(() => {
    if (!open) return;
    if (existing) {
      setCode(existing.code);
      setName(existing.name);
      setCategory(existing.category || "");
      setPrice(existing.price === null ? "" : String(existing.price));
      setQuantity(String(existing.quantity));
      setMinStock(String(existing.minStock ?? 0));
      setNotes(existing.notes || "");
      setWeight(existing.weight === null || existing.weight === undefined ? "" : String(existing.weight));
      setBrand(existing.brand || "");
      setType(existing.type || "");
      setUnit(existing.unit || "");
    } else {
      setCode(prefillCode || "");
      setName("");
      setCategory("");
      setPrice("");
      setQuantity("0");
      setMinStock("0");
      setNotes("");
      setWeight("");
      setBrand("");
      setType("");
      setUnit("");
    }
    setError(null);
  }, [open, existing, prefillCode]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    const trimmedCode = code.trim();
    const trimmedName = name.trim();
    if (!trimmedCode || !trimmedName) return;

    setSaving(true);
    try {
      if (!existing) {
        const duplicate = await getProductByCode(trimmedCode);
        if (duplicate) {
          setError("Ya existe un producto con ese código.");
          setSaving(false);
          return;
        }
        await createProductAction({
          code: trimmedCode,
          name: trimmedName,
          category: category.trim(),
          price: price === "" ? null : Number(price),
          quantity: Number(quantity) || 0,
          minStock: Number(minStock) || 0,
          notes: notes.trim(),
          weight: weight === "" ? null : Number(weight),
          brand: brand.trim(),
          type: type.trim(),
          unit: unit.trim(),
        });
        showToast("Producto guardado.");
      } else {
        await updateProductAction(existing._id, {
          code: trimmedCode,
          name: trimmedName,
          category: category.trim(),
          price: price === "" ? null : Number(price),
          minStock: Number(minStock) || 0,
          notes: notes.trim(),
          weight: weight === "" ? null : Number(weight),
          brand: brand.trim(),
          type: type.trim(),
          unit: unit.trim(),
        });
        showToast("Producto actualizado.");
      }
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo guardar el producto.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!existing) return;
    if (!confirm("¿Eliminar este producto y su historial de movimientos?")) return;
    await deleteProductAction(existing._id);
    showToast("Producto eliminado.");
    onClose();
  }

  return (
    <Modal open={open} onClose={onClose} title={existing ? "Editar producto" : "Nuevo producto"}>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Código de barras *</label>
          <input
            required
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Nombre *</label>
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Categoría</label>
            <input
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Precio (S/)</label>
            <input
              type="number"
              min={0}
              step="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Cantidad *</label>
            <input
              type="number"
              min={0}
              step="1"
              required
              disabled={!!existing}
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-blue-500 focus:outline-none disabled:bg-slate-100 disabled:text-slate-400"
            />
            {existing && (
              <p className="mt-1 text-xs text-slate-400">
                La cantidad se ajusta con movimientos de entrada/salida.
              </p>
            )}
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Stock mínimo</label>
            <input
              type="number"
              min={0}
              step="1"
              value={minStock}
              onChange={(e) => setMinStock(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Peso</label>
            <input
              type="number"
              min={0}
              step="0.01"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Unidad</label>
            <input
              list="unit-options"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
            />
            <datalist id="unit-options">
              {unitOptions.map((v) => (
                <option key={v} value={v} />
              ))}
            </datalist>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Marca</label>
            <input
              list="brand-options"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
            />
            <datalist id="brand-options">
              {brandOptions.map((v) => (
                <option key={v} value={v} />
              ))}
            </datalist>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Tipo</label>
            <input
              list="type-options"
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
            />
            <datalist id="type-options">
              {typeOptions.map((v) => (
                <option key={v} value={v} />
              ))}
            </datalist>
          </div>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Notas</label>
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
          />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <div className="flex items-center justify-between gap-2 pt-2">
          {existing && user?.role === "admin" ? (
            <button
              type="button"
              onClick={handleDelete}
              className="rounded-lg bg-red-50 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-100"
            >
              Eliminar
            </button>
          ) : (
            <span />
          )}
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-60"
          >
            {saving ? "Guardando…" : "Guardar"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
