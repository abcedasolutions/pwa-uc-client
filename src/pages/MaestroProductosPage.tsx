import { useMemo, useState } from "react";
import type { Product } from "../api/types";
import { useProducts } from "../hooks/useProducts";
import { ProductFormModal } from "../components/products/ProductFormModal";
import { Pagination } from "../components/common/Pagination";
import { ImportButton } from "../components/common/ImportButton";
import type { ImportResult } from "../components/common/ImportButton";
import { ExportMenu } from "../components/common/ExportMenu";
import type { SpreadsheetColumn } from "../lib/spreadsheet";
import { getField } from "../lib/spreadsheet";
import { getProductByCode } from "../db/indexedDb";
import { createProductAction, updateProductAction } from "../db/actions";

const PAGE_SIZE = 10;

const exportColumns: SpreadsheetColumn<Product>[] = [
  { key: "code", header: "Código" },
  { key: "name", header: "Nombre" },
  { key: "weight", header: "Peso" },
  { key: "brand", header: "Marca" },
  { key: "type", header: "Tipo" },
  { key: "unit", header: "Unidad" },
  { key: "category", header: "Categoría" },
  { key: "price", header: "Precio" },
  { key: "quantity", header: "Cantidad" },
  { key: "minStock", header: "Stock Mínimo" },
];

function formatWeight(w: number | null) {
  if (w === null || w === undefined) return "—";
  return w.toFixed(3);
}

export function MaestroProductosPage() {
  const { data: products = [] } = useProducts();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return products;
    return products.filter((p) => p.name.toLowerCase().includes(term) || p.code.toLowerCase().includes(term));
  }, [products, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function openCreate() {
    setEditing(null);
    setFormOpen(true);
  }

  function openEdit(product: Product) {
    setEditing(product);
    setFormOpen(true);
  }

  async function handleImport(rows: Record<string, string>[]): Promise<ImportResult> {
    let success = 0;
    const errors: string[] = [];
    for (const [i, row] of rows.entries()) {
      const code = getField(row, "Código", "Codigo", "code").trim();
      const name = getField(row, "Nombre", "name").trim();
      if (!code || !name) {
        errors.push(`Fila ${i + 2}: falta Código o Nombre.`);
        continue;
      }
      const weightRaw = getField(row, "Peso", "weight");
      const priceRaw = getField(row, "Precio", "price");
      const minStockRaw = getField(row, "Stock Mínimo", "Stock Minimo", "minStock");
      const quantityRaw = getField(row, "Cantidad", "quantity");
      const fields = {
        code,
        name,
        category: getField(row, "Categoría", "Categoria", "category"),
        price: priceRaw ? Number(priceRaw) : null,
        minStock: minStockRaw ? Number(minStockRaw) || 0 : 0,
        notes: getField(row, "Notas", "notes"),
        weight: weightRaw ? Number(weightRaw) : null,
        brand: getField(row, "Marca", "brand"),
        type: getField(row, "Tipo", "type"),
        unit: getField(row, "Unidad", "unit"),
      };
      try {
        const existing = await getProductByCode(code);
        if (existing) {
          await updateProductAction(existing._id, fields);
        } else {
          await createProductAction({ ...fields, quantity: quantityRaw ? Number(quantityRaw) || 0 : 0 });
        }
        success++;
      } catch (err) {
        errors.push(`Fila ${i + 2} (${code}): ${err instanceof Error ? err.message : "error desconocido"}`);
      }
    }
    return { success, errors };
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-semibold text-slate-900">Maestro de Productos</h2>
        <div className="flex flex-wrap gap-2">
          <ImportButton
            expectedColumns={exportColumns}
            onImport={handleImport}
            templateFilename="plantilla-maestro-productos.xlsx"
            templateSheetName="Maestro Productos"
            templateExampleRows={[
              {
                code: "PROD-001",
                name: "Detergente 1L",
                weight: 1,
                brand: "Marca X",
                type: "Mercaderías",
                unit: "BOTELLA",
                category: "Limpieza",
                price: 12.5,
                quantity: 0,
                minStock: 5,
              },
            ]}
          />
          <ExportMenu
            data={filtered}
            columns={exportColumns}
            filenameBase="maestro-productos"
            title="Maestro de Productos"
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

      <div className="mb-4 flex gap-2">
        <input
          type="search"
          placeholder="Nombre del producto…"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="w-full max-w-sm rounded-lg border border-slate-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
        />
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-3 py-2">Código</th>
              <th className="px-3 py-2">Nombre</th>
              <th className="px-3 py-2 text-right">Peso</th>
              <th className="px-3 py-2">Marca</th>
              <th className="px-3 py-2">Tipo</th>
              <th className="px-3 py-2">Unidad</th>
              <th className="px-3 py-2 text-right">Opciones</th>
            </tr>
          </thead>
          <tbody>
            {pageItems.length === 0 && (
              <tr>
                <td colSpan={7} className="px-3 py-8 text-center text-slate-400">
                  No hay productos.
                </td>
              </tr>
            )}
            {pageItems.map((p) => (
              <tr key={p._id} className="border-t border-slate-100 hover:bg-slate-50">
                <td className="px-3 py-2 text-slate-500">{p.code}</td>
                <td className="px-3 py-2 font-medium text-slate-900">{p.name}</td>
                <td className="px-3 py-2 text-right text-slate-600">{formatWeight(p.weight)}</td>
                <td className="px-3 py-2 text-slate-600">{p.brand || "—"}</td>
                <td className="px-3 py-2 text-slate-600">{p.type || "—"}</td>
                <td className="px-3 py-2 text-slate-600">{p.unit || "—"}</td>
                <td className="px-3 py-2 text-right">
                  <button
                    type="button"
                    onClick={() => openEdit(p)}
                    className="rounded-lg px-2 py-1 text-blue-600 hover:bg-blue-50"
                    aria-label="Editar"
                  >
                    <i className="fa fa-pencil" aria-hidden="true" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Pagination page={page} totalPages={totalPages} onChange={setPage} />

      <ProductFormModal open={formOpen} onClose={() => setFormOpen(false)} existing={editing} />
    </div>
  );
}
