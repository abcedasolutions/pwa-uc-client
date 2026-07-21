import { useEffect, useMemo, useState } from "react";
import { useInventoryCounts } from "../hooks/useInventoryCounts";
import { useCountItems } from "../hooks/useCountItems";
import { Pagination } from "../components/common/Pagination";
import { ExportMenu } from "../components/common/ExportMenu";
import type { SpreadsheetColumn } from "../lib/spreadsheet";

const PAGE_SIZE = 10;

interface ReportRow {
  code: string;
  productName: string;
  weight: string;
  brand: string;
  countedQty: number;
}

const reportColumns: SpreadsheetColumn<ReportRow>[] = [
  { key: "code", header: "Código" },
  { key: "productName", header: "Nombre" },
  { key: "weight", header: "Peso" },
  { key: "brand", header: "Marca" },
  { key: "countedQty", header: "Cantidad" },
];

function formatWeight(w: number | null) {
  if (w === null || w === undefined) return "—";
  return w.toFixed(3);
}

export function ReportesPage() {
  const { inventoryCounts } = useInventoryCounts();
  const [selectedId, setSelectedId] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (!selectedId && inventoryCounts.length > 0) setSelectedId(inventoryCounts[0]._id);
  }, [inventoryCounts, selectedId]);

  const { items } = useCountItems(selectedId || null, search);
  const selected = inventoryCounts.find((c) => c._id === selectedId);

  const totalPages = Math.max(1, Math.ceil(items.length / PAGE_SIZE));
  const pageItems = items.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const exportRows: ReportRow[] = useMemo(
    () =>
      items.map((item) => ({
        code: item.code,
        productName: item.productName,
        weight: formatWeight(item.weight),
        brand: item.brand || "",
        countedQty: item.countedQty,
      })),
    [items]
  );

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-semibold text-slate-900">
          Reporte de Inventario{selected ? `: ${selected.period}` : ""}
        </h2>
        {inventoryCounts.length > 0 && (
          <ExportMenu
            data={exportRows}
            columns={reportColumns}
            filenameBase={`reporte-inventario${selected ? `-${selected.period}` : ""}`}
            title="Reporte de Inventario"
            subtitle={selected ? `Período: ${selected.period}` : undefined}
          />
        )}
      </div>

      {inventoryCounts.length === 0 ? (
        <p className="rounded-lg bg-slate-100 px-3 py-2 text-sm text-slate-600">
          No hay inventarios registrados todavía.
        </p>
      ) : (
        <>
          <div className="mb-4 flex flex-wrap items-end gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500">Inventario</label>
              <select
                value={selectedId}
                onChange={(e) => {
                  setSelectedId(e.target.value);
                  setPage(1);
                }}
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              >
                {inventoryCounts.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.period} — {c.status === "open" ? "Abierto" : "Cerrado"}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex-1">
              <label className="mb-1 block text-xs font-medium text-slate-500">Nombre del producto</label>
              <input
                type="search"
                placeholder="Buscar…"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="w-full max-w-sm rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
            <table className="w-full min-w-[600px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-3 py-2">Código</th>
                  <th className="px-3 py-2">Nombre</th>
                  <th className="px-3 py-2 text-right">Peso</th>
                  <th className="px-3 py-2">Marca</th>
                  <th className="px-3 py-2 text-right">Cantidad</th>
                </tr>
              </thead>
              <tbody>
                {pageItems.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-3 py-8 text-center text-slate-400">
                      Sin resultados.
                    </td>
                  </tr>
                )}
                {pageItems.map((item) => (
                  <tr key={item._id} className="border-t border-slate-100">
                    <td className="px-3 py-2 text-slate-500">{item.code}</td>
                    <td className="px-3 py-2 text-slate-900">{item.productName}</td>
                    <td className="px-3 py-2 text-right text-slate-600">{formatWeight(item.weight)}</td>
                    <td className="px-3 py-2 text-slate-600">{item.brand || "—"}</td>
                    <td className="px-3 py-2 text-right font-medium text-slate-900">{item.countedQty}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Pagination page={page} totalPages={totalPages} onChange={setPage} />
        </>
      )}
    </div>
  );
}
