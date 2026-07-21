import { useEffect, useState } from "react";
import { Modal } from "./Modal";
import type { jsPDF } from "jspdf";

export function PdfPreviewModal({
  open,
  onClose,
  buildDoc,
  filename,
}: {
  open: boolean;
  onClose: () => void;
  buildDoc: () => jsPDF;
  filename: string;
}) {
  const [url, setUrl] = useState<string | null>(null);
  const [doc, setDoc] = useState<jsPDF | null>(null);

  useEffect(() => {
    if (!open) return;
    const built = buildDoc();
    const blobUrl = built.output("bloburl") as unknown as string;
    setDoc(built);
    setUrl(blobUrl);
    return () => {
      URL.revokeObjectURL(blobUrl);
      setUrl(null);
      setDoc(null);
    };
  }, [open]);

  return (
    <Modal open={open} onClose={onClose} title="Vista previa del PDF" wide>
      {url ? (
        <iframe title="Vista previa PDF" src={url} className="h-[60vh] w-full rounded-lg border border-slate-200" />
      ) : (
        <div className="flex h-[60vh] items-center justify-center text-slate-400">Generando…</div>
      )}
      <div className="mt-4 flex justify-end gap-2">
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200"
        >
          Cerrar
        </button>
        <button
          type="button"
          disabled={!doc}
          onClick={() => doc?.save(filename)}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
        >
          <i className="fa fa-download" aria-hidden="true" /> Descargar PDF
        </button>
      </div>
    </Modal>
  );
}
