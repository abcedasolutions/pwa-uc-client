import { Modal } from "../common/Modal";
import { BarcodeScanner } from "./BarcodeScanner";
import { useState } from "react";
import { useToast } from "../common/Toast";

export function ScanToProductFlow({
  open,
  onClose,
  onResolved,
}: {
  open: boolean;
  onClose: () => void;
  onResolved: (code: string) => void;
}) {
  const [manualCode, setManualCode] = useState("");
  const showToast = useToast();

  function handleScan(code: string) {
    onClose();
    onResolved(code);
  }

  function handleManual() {
    const code = manualCode.trim();
    if (!code) return;
    onClose();
    onResolved(code);
  }

  function handleError(err: unknown) {
    showToast("No se pudo acceder a la cámara.");
    console.error(err);
  }

  return (
    <Modal open={open} onClose={onClose} title="Escanear código de barras">
      {open && <BarcodeScanner onScan={handleScan} onError={handleError} />}
      <p className="mt-3 text-sm text-slate-500">Apunta la cámara al código de barras del producto.</p>
      <div className="mt-3">
        <label className="mb-1 block text-sm font-medium text-slate-700">O escribe el código manualmente</label>
        <div className="flex gap-2">
          <input
            type="text"
            inputMode="numeric"
            placeholder="Código"
            value={manualCode}
            onChange={(e) => setManualCode(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleManual();
              }
            }}
            className="flex-1 rounded-lg border border-slate-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
          />
          <button
            type="button"
            onClick={handleManual}
            className="rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200"
          >
            Buscar
          </button>
        </div>
      </div>
    </Modal>
  );
}
