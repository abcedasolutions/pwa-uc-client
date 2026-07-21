import { useState } from "react";
import type { SpreadsheetColumn } from "../../lib/spreadsheet";
import { exportToExcel } from "../../lib/spreadsheet";
import { buildPdf } from "../../lib/pdf";
import { PdfPreviewModal } from "./PdfPreviewModal";

export function ExportMenu<T extends object>({
  data,
  columns,
  filenameBase,
  title,
  subtitle,
}: {
  data: T[];
  columns: SpreadsheetColumn<T>[];
  filenameBase: string;
  title: string;
  subtitle?: string;
}) {
  const [open, setOpen] = useState(false);
  const [pdfOpen, setPdfOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200"
      >
        <i className="fa fa-download" aria-hidden="true" /> Exportar
        <i className="fa fa-caret-down" aria-hidden="true" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 z-20 mt-1 w-40 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg">
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                exportToExcel(`${filenameBase}.xlsx`, title.slice(0, 31), columns, data);
              }}
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
            >
              <i className="fa fa-file-excel-o text-emerald-600" aria-hidden="true" /> Excel
            </button>
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                setPdfOpen(true);
              }}
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
            >
              <i className="fa fa-file-pdf-o text-red-600" aria-hidden="true" /> PDF
            </button>
          </div>
        </>
      )}

      <PdfPreviewModal
        open={pdfOpen}
        onClose={() => setPdfOpen(false)}
        filename={`${filenameBase}.pdf`}
        buildDoc={() => buildPdf(title, columns, data, subtitle)}
      />
    </div>
  );
}
