import { useMemo, useState } from "react";
import type { InventoryCount } from "../api/types";
import { useInventoryCounts } from "../hooks/useInventoryCounts";
import { InventoryCountFormModal } from "../components/inventoryCounts/InventoryCountFormModal";
import { Pagination } from "../components/common/Pagination";
import { useToast } from "../components/common/Toast";
import { useAuth } from "../hooks/useAuth";
import { ImportButton } from "../components/common/ImportButton";
import type { ImportResult } from "../components/common/ImportButton";
import { ExportMenu } from "../components/common/ExportMenu";
import type { SpreadsheetColumn } from "../lib/spreadsheet";
import { getField } from "../lib/spreadsheet";

const PAGE_SIZE = 10;

interface ExportRow {
  period: string;
  description: string;
  startDate: string;
  endDate: string;
  status: string;
}

const exportColumns: SpreadsheetColumn<ExportRow>[] = [
  { key: "period", header: "Período" },
  { key: "description", header: "Descripción" },
  { key: "startDate", header: "Inicio" },
  { key: "endDate", header: "Término" },
  { key: "status", header: "Estado" },
];

const importColumns: SpreadsheetColumn<ExportRow>[] = [
  { key: "period", header: "Período" },
  { key: "description", header: "Descripción" },
  { key: "startDate", header: "Inicio" },
  { key: "endDate", header: "Término" },
];

function formatDate(iso: string | null) {
  if (!iso) return "—";
  // Inicio/Término are calendar dates (from a <input type="date">), stored as
  // UTC midnight. Formatting in the browser's local timezone can roll the
  // displayed day back by one when the local offset is negative — force UTC
  // so the date shown always matches what the user picked.
  return new Date(iso).toLocaleDateString("es-PE", { timeZone: "UTC" });
}

export function InventoryManagementPage() {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [page, setPage] = useState(1);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<InventoryCount | null>(null);
  const { user } = useAuth();
  const showToast = useToast();

  const { inventoryCounts, create, update, close, remove } = useInventoryCounts({
    from: from || undefined,
    to: to || undefined,
  });

  const totalPages = Math.max(1, Math.ceil(inventoryCounts.length / PAGE_SIZE));
  const pageItems = inventoryCounts.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function openCreate() {
    setEditing(null);
    setFormOpen(true);
  }

  function openEdit(count: InventoryCount) {
    setEditing(count);
    setFormOpen(true);
  }

  async function handleClose(count: InventoryCount) {
    if (!confirm(`¿Cerrar el inventario ${count.period}? No podrás registrar más conteos en él.`)) return;
    try {
      await close(count._id);
      showToast("Inventario cerrado.");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "No se pudo cerrar el inventario.");
    }
  }

  async function handleDelete(count: InventoryCount) {
    if (!confirm(`¿Eliminar el inventario ${count.period} y sus conteos?`)) return;
    try {
      await remove(count._id);
      showToast("Inventario eliminado.");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "No se pudo eliminar el inventario.");
    }
  }

  const exportRows: ExportRow[] = useMemo(
    () =>
      inventoryCounts.map((c) => ({
        period: c.period,
        description: c.description || "",
        startDate: formatDate(c.startDate),
        endDate: formatDate(c.endDate),
        status: c.status === "open" ? "Abierto" : "Cerrado",
      })),
    [inventoryCounts]
  );

  async function handleImport(rows: Record<string, string>[]): Promise<ImportResult> {
    let success = 0;
    const errors: string[] = [];
    for (const [i, row] of rows.entries()) {
      const period = getField(row, "Período", "Periodo", "period").trim();
      const startDateRaw = getField(row, "Inicio", "startDate", "Fecha Inicio").trim();
      if (!period || !startDateRaw) {
        errors.push(`Fila ${i + 2}: falta Período o Inicio.`);
        continue;
      }
      const startDate = new Date(startDateRaw);
      if (Number.isNaN(startDate.getTime())) {
        errors.push(`Fila ${i + 2}: fecha de inicio inválida ("${startDateRaw}").`);
        continue;
      }
      const endDateRaw = getField(row, "Término", "Termino", "endDate", "Fecha Termino").trim();
      const endDate = endDateRaw ? new Date(endDateRaw) : null;
      try {
        await create({
          period,
          description: getField(row, "Descripción", "Descripcion", "description"),
          startDate: startDate.toISOString(),
          endDate: endDate && !Number.isNaN(endDate.getTime()) ? endDate.toISOString() : null,
        });
        success++;
      } catch (err) {
        errors.push(`Fila ${i + 2} (${period}): ${err instanceof Error ? err.message : "error desconocido"}`);
      }
    }
    return { success, errors };
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-semibold text-slate-900">Gestión de Inventario</h2>
        <div className="flex flex-wrap gap-2">
          <ImportButton
            expectedColumns={importColumns}
            onImport={handleImport}
            templateFilename="plantilla-gestion-inventario.xlsx"
            templateSheetName="Gestión de Inventario"
            templateExampleRows={[
              {
                period: "2026-07",
                description: "Conteo mensual julio",
                startDate: "2026-07-01",
                endDate: "2026-07-31",
              },
            ]}
          />
          <ExportMenu
            data={exportRows}
            columns={exportColumns}
            filenameBase="gestion-inventario"
            title="Gestión de Inventario"
          />
          <button
            type="button"
            onClick={openCreate}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <i className="fa fa-plus" aria-hidden="true" /> Nuevo
          </button>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap items-end gap-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-500">Desde</label>
          <input
            type="date"
            value={from}
            onChange={(e) => {
              setFrom(e.target.value);
              setPage(1);
            }}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-500">Hasta</label>
          <input
            type="date"
            value={to}
            onChange={(e) => {
              setTo(e.target.value);
              setPage(1);
            }}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
          />
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-3 py-2">Período</th>
              <th className="px-3 py-2">Descripción</th>
              <th className="px-3 py-2">Inicio</th>
              <th className="px-3 py-2">Término</th>
              <th className="px-3 py-2">Estado</th>
              <th className="px-3 py-2 text-right">Opciones</th>
            </tr>
          </thead>
          <tbody>
            {pageItems.length === 0 && (
              <tr>
                <td colSpan={6} className="px-3 py-8 text-center text-slate-400">
                  No hay inventarios registrados.
                </td>
              </tr>
            )}
            {pageItems.map((c) => (
              <tr key={c._id} className="border-t border-slate-100 hover:bg-slate-50">
                <td className="px-3 py-2 font-medium text-slate-900">{c.period}</td>
                <td className="px-3 py-2 text-slate-600">{c.description || "—"}</td>
                <td className="px-3 py-2 text-slate-600">{formatDate(c.startDate)}</td>
                <td className="px-3 py-2 text-slate-600">{formatDate(c.endDate)}</td>
                <td className="px-3 py-2">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      c.status === "open" ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-600"
                    }`}
                  >
                    {c.status === "open" ? "Abierto" : "Cerrado"}
                  </span>
                </td>
                <td className="px-3 py-2 text-right whitespace-nowrap">
                  {c.status === "open" && (
                    <button
                      type="button"
                      onClick={() => openEdit(c)}
                      className="rounded-lg px-2 py-1 text-blue-600 hover:bg-blue-50"
                      aria-label="Editar"
                    >
                      <i className="fa fa-pencil" aria-hidden="true" />
                    </button>
                  )}
                  {user?.role === "admin" && (
                    <button
                      type="button"
                      onClick={() => handleDelete(c)}
                      className="rounded-lg px-2 py-1 text-red-600 hover:bg-red-50"
                      aria-label="Eliminar"
                    >
                      <i className="fa fa-trash" aria-hidden="true" />
                    </button>
                  )}
                  {c.status === "open" && (
                    <button
                      type="button"
                      onClick={() => handleClose(c)}
                      className="rounded-lg px-2 py-1 text-amber-600 hover:bg-amber-50"
                      aria-label="Cerrar"
                    >
                      <i className="fa fa-times-circle" aria-hidden="true" />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Pagination page={page} totalPages={totalPages} onChange={setPage} />

      <InventoryCountFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        existing={editing}
        onCreate={create}
        onUpdate={update}
      />
    </div>
  );
}
