import { useRef, useState } from "react";
import { downloadTemplate, parseSpreadsheetFile, type SpreadsheetColumn } from "../../lib/spreadsheet";
import { useToast } from "./Toast";

export interface ImportResult {
  success: number;
  errors: string[];
}

export function ImportButton<T extends object>({
  label = "Importar Excel/CSV",
  expectedColumns,
  onImport,
  templateFilename = "plantilla.xlsx",
  templateSheetName = "Plantilla",
  templateExampleRows,
}: {
  label?: string;
  expectedColumns: SpreadsheetColumn<T>[];
  onImport: (rows: Record<string, string>[]) => Promise<ImportResult>;
  templateFilename?: string;
  templateSheetName?: string;
  templateExampleRows?: Partial<Record<keyof T, string | number>>[];
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [importing, setImporting] = useState(false);
  const showToast = useToast();

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setImporting(true);
    try {
      const rows = await parseSpreadsheetFile(file);
      if (rows.length === 0) {
        showToast("El archivo no tiene filas para importar.");
        return;
      }
      const result = await onImport(rows);
      const summary =
        result.errors.length === 0
          ? `${result.success} fila(s) importada(s) correctamente.`
          : `${result.success} importada(s), ${result.errors.length} con error.`;
      showToast(summary);
      if (result.errors.length > 0) {
        console.warn("Errores de importación:", result.errors);
      }
    } catch (err) {
      showToast(err instanceof Error ? err.message : "No se pudo leer el archivo.");
    } finally {
      setImporting(false);
    }
  }

  return (
    <>
      <button
        type="button"
        disabled={importing}
        onClick={() => inputRef.current?.click()}
        title={`Columnas esperadas: ${expectedColumns.map((c) => c.header).join(", ")}`}
        className="flex items-center gap-2 rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200 disabled:opacity-60"
      >
        <i className={`fa ${importing ? "fa-spinner fa-spin" : "fa-upload"}`} aria-hidden="true" />
        {importing ? "Importando…" : label}
      </button>
      <button
        type="button"
        onClick={() => downloadTemplate(templateFilename, templateSheetName, expectedColumns, templateExampleRows)}
        title={`Columnas: ${expectedColumns.map((c) => c.header).join(", ")}`}
        className="flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
      >
        <i className="fa fa-download" aria-hidden="true" />
        Descargar plantilla
      </button>
      <input
        ref={inputRef}
        type="file"
        accept=".xlsx,.xls,.csv"
        className="hidden"
        onChange={handleFile}
      />
    </>
  );
}
