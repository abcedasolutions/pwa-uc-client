import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import type { InventoryCount } from "../../api/types";
import { Modal } from "../common/Modal";
import { useToast } from "../common/Toast";
import { ApiError } from "../../api/client";

function toDateInput(iso: string | null) {
  if (!iso) return "";
  return iso.slice(0, 10);
}

export function InventoryCountFormModal({
  open,
  onClose,
  existing,
  onCreate,
  onUpdate,
}: {
  open: boolean;
  onClose: () => void;
  existing: InventoryCount | null;
  onCreate: (input: { period: string; description: string; startDate: string; endDate: string | null }) => Promise<unknown>;
  onUpdate: (
    id: string,
    input: { description: string; startDate: string; endDate: string | null }
  ) => Promise<unknown>;
}) {
  const showToast = useToast();
  const [period, setPeriod] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (existing) {
      setPeriod(existing.period);
      setDescription(existing.description || "");
      setStartDate(toDateInput(existing.startDate));
      setEndDate(toDateInput(existing.endDate));
    } else {
      const now = new Date();
      setPeriod(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`);
      setDescription("");
      setStartDate(now.toISOString().slice(0, 10));
      setEndDate("");
    }
    setError(null);
  }, [open, existing]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!startDate) {
      setError("La fecha de inicio es obligatoria.");
      return;
    }
    setSaving(true);
    try {
      const startIso = new Date(startDate).toISOString();
      const endIso = endDate ? new Date(endDate).toISOString() : null;
      if (existing) {
        await onUpdate(existing._id, { description: description.trim(), startDate: startIso, endDate: endIso });
        showToast("Inventario actualizado.");
      } else {
        if (!period.trim()) {
          setError("El período es obligatorio.");
          setSaving(false);
          return;
        }
        await onCreate({ period: period.trim(), description: description.trim(), startDate: startIso, endDate: endIso });
        showToast("Inventario creado.");
      }
      onClose();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo guardar el inventario.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={existing ? "Editar inventario" : "Nuevo inventario"}>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Período *</label>
          <input
            required
            disabled={!!existing}
            placeholder="2026-07"
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-blue-500 focus:outline-none disabled:bg-slate-100 disabled:text-slate-400"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Descripción</label>
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Inicio *</label>
            <input
              type="date"
              required
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Término</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
            />
          </div>
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200"
          >
            Cancelar
          </button>
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
