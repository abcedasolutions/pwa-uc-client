import { useEffect, useState } from "react";
import { useInventoryCounts } from "../hooks/useInventoryCounts";
import { useCountItems } from "../hooks/useCountItems";
import { getProductByCode } from "../db/indexedDb";
import { useToast } from "../components/common/Toast";
import { ScanToProductFlow } from "../components/scanner/ScanToProductFlow";
import { ApiError } from "../api/client";
import { ImportButton } from "../components/common/ImportButton";
import type { ImportResult } from "../components/common/ImportButton";
import { ExportMenu } from "../components/common/ExportMenu";
import type { SpreadsheetColumn } from "../lib/spreadsheet";
import { getField } from "../lib/spreadsheet";
import type { InventoryCountItem } from "../api/types";

const countImportColumns: SpreadsheetColumn<{ code: string; countedQty: number }>[] = [
  { key: "code", header: "Código" },
  { key: "countedQty", header: "Cantidad" },
];

const countExportColumns: SpreadsheetColumn<InventoryCountItem>[] = [
  { key: "code", header: "Código" },
  { key: "productName", header: "Nombre" },
  { key: "countedQty", header: "Cantidad" },
];

export function TomaInventarioPage() {
  const { inventoryCounts } = useInventoryCounts();
  const openCounts = inventoryCounts.filter((c) => c.status === "open");
  const [selectedId, setSelectedId] = useState<string>("");
  const [code, setCode] = useState("");
  const [productName, setProductName] = useState("");
  const [qty, setQty] = useState("");
  const [scanOpen, setScanOpen] = useState(false);
  const showToast = useToast();

  useEffect(() => {
    if (!selectedId && openCounts.length > 0) setSelectedId(openCounts[0]._id);
  }, [openCounts, selectedId]);

  const { items, record } = useCountItems(selectedId || null);

  async function handleLookup(rawCode: string) {
    const trimmed = rawCode.trim();
    if (!trimmed) return;
    const product = await getProductByCode(trimmed);
    if (!product) {
      showToast(`No se encontró un producto con código ${trimmed}.`);
      return;
    }
    setCode(product.code);
    setProductName(product.name);
    setQty("");
  }

  async function handleSave() {
    if (!selectedId) {
      showToast("Selecciona un inventario abierto primero.");
      return;
    }
    if (!code) {
      showToast("Escanea o busca un producto primero.");
      return;
    }
    const countedQty = Number(qty);
    if (!Number.isFinite(countedQty) || countedQty < 0) {
      showToast("Ingresa una cantidad válida.");
      return;
    }
    try {
      await record({ productCode: code, countedQty });
      showToast(`Conteo guardado: ${productName} = ${countedQty}.`);
      setCode("");
      setProductName("");
      setQty("");
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : "No se pudo guardar el conteo.");
    }
  }

  async function handleImport(rows: Record<string, string>[]): Promise<ImportResult> {
    if (!selectedId) {
      return { success: 0, errors: ["Selecciona un inventario abierto antes de importar."] };
    }
    let success = 0;
    const errors: string[] = [];
    for (const [i, row] of rows.entries()) {
      const rowCode = getField(row, "Código", "Codigo", "code").trim();
      const qtyRaw = getField(row, "Cantidad", "countedQty", "qty").trim();
      if (!rowCode || !qtyRaw) {
        errors.push(`Fila ${i + 2}: falta Código o Cantidad.`);
        continue;
      }
      const countedQty = Number(qtyRaw);
      if (!Number.isFinite(countedQty) || countedQty < 0) {
        errors.push(`Fila ${i + 2}: cantidad inválida ("${qtyRaw}").`);
        continue;
      }
      try {
        await record({ productCode: rowCode, countedQty });
        success++;
      } catch (err) {
        errors.push(`Fila ${i + 2} (${rowCode}): ${err instanceof ApiError ? err.message : "error desconocido"}`);
      }
    }
    return { success, errors };
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-semibold text-slate-900">Toma de Inventario</h2>
        {openCounts.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <ImportButton
              label="Importar conteos"
              expectedColumns={countImportColumns}
              onImport={handleImport}
              templateFilename="plantilla-toma-inventario.xlsx"
              templateSheetName="Toma de Inventario"
              templateExampleRows={[{ code: "PROD-001", countedQty: 10 }]}
            />
            <ExportMenu
              data={items}
              columns={countExportColumns}
              filenameBase="toma-inventario"
              title="Toma de Inventario"
            />
          </div>
        )}
      </div>

      {openCounts.length === 0 ? (
        <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
          No hay ningún inventario abierto. Crea uno en "Gestión de Inventario" para empezar a contar.
        </p>
      ) : (
        <>
          <div className="mb-4">
            <label className="mb-1 block text-sm font-medium text-slate-700">Inventario activo</label>
            <select
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
              className="w-full max-w-sm rounded-lg border border-slate-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
            >
              {openCounts.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.period} — {c.description || "Sin descripción"}
                </option>
              ))}
            </select>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="mb-3 flex gap-2">
              <button
                type="button"
                onClick={() => setScanOpen(true)}
                className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                <i className="fa fa-barcode" aria-hidden="true" /> Escanear
              </button>
            </div>

            {productName && (
              <p className="mb-2 text-sm text-slate-600">
                Producto: <strong className="text-slate-900">{productName}</strong> ({code})
              </p>
            )}

            <div className="flex gap-2">
              <input
                type="number"
                min={0}
                step="1"
                placeholder="Cantidad contada"
                value={qty}
                onChange={(e) => setQty(e.target.value)}
                className="w-40 rounded-lg border border-slate-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={handleSave}
                className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
              >
                Guardar conteo
              </button>
            </div>
          </div>

          <h3 className="mb-2 mt-6 text-sm font-semibold text-slate-700">Productos contados ({items.length})</h3>
          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
            <table className="w-full min-w-[480px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-3 py-2">Código</th>
                  <th className="px-3 py-2">Nombre</th>
                  <th className="px-3 py-2 text-right">Cantidad</th>
                </tr>
              </thead>
              <tbody>
                {items.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-3 py-6 text-center text-slate-400">
                      Aún no hay conteos registrados.
                    </td>
                  </tr>
                )}
                {items.map((item) => (
                  <tr key={item._id} className="border-t border-slate-100">
                    <td className="px-3 py-2 text-slate-500">{item.code}</td>
                    <td className="px-3 py-2 text-slate-900">{item.productName}</td>
                    <td className="px-3 py-2 text-right font-medium text-slate-900">{item.countedQty}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      <ScanToProductFlow
        open={scanOpen}
        onClose={() => setScanOpen(false)}
        onResolved={(scannedCode) => handleLookup(scannedCode)}
      />
    </div>
  );
}
