import { useEffect, useRef } from "react";
import { Html5Qrcode, Html5QrcodeScannerState, Html5QrcodeSupportedFormats } from "html5-qrcode";

const config = {
  fps: 10,
  qrbox: { width: 260, height: 140 },
  formatsToSupport: [
    Html5QrcodeSupportedFormats.EAN_13,
    Html5QrcodeSupportedFormats.EAN_8,
    Html5QrcodeSupportedFormats.UPC_A,
    Html5QrcodeSupportedFormats.UPC_E,
    Html5QrcodeSupportedFormats.CODE_128,
    Html5QrcodeSupportedFormats.CODE_39,
    Html5QrcodeSupportedFormats.QR_CODE,
  ],
};

export function BarcodeScanner({
  onScan,
  onError,
}: {
  onScan: (code: string) => void;
  onError?: (err: unknown) => void;
}) {
  const containerId = useRef(`scan-reader-${Math.random().toString(36).slice(2)}`);
  const scannerRef = useRef<Html5Qrcode | null>(null);

  useEffect(() => {
    const scanner = new Html5Qrcode(containerId.current, { verbose: false });
    scannerRef.current = scanner;
    let cancelled = false;

    scanner
      .start(
        { facingMode: "environment" },
        config,
        (decodedText) => {
          if (!cancelled) onScan(decodedText);
        },
        () => {}
      )
      .then(() => {
        // The effect was torn down before start() resolved (e.g. React
        // StrictMode's mount/cleanup/mount in dev). The cleanup below ran
        // too early to stop this scanner, so it's still holding the camera
        // open and rendering a video feed nobody asked for — stop it now.
        if (cancelled) {
          scanner
            .stop()
            .then(() => scanner.clear())
            .catch(() => {});
        }
      })
      .catch((err) => {
        if (!cancelled) onError?.(err);
      });

    return () => {
      cancelled = true;
      // Html5Qrcode.stop() throws synchronously (not a rejected promise) if the
      // scanner hasn't finished reaching the SCANNING state yet, which happens
      // whenever this effect is torn down right after start() is called (e.g.
      // React StrictMode's mount/cleanup/mount in dev). Guard it so that case
      // can't crash the render tree.
      if (scanner.getState() === Html5QrcodeScannerState.SCANNING) {
        scanner
          .stop()
          .then(() => scanner.clear())
          .catch(() => {});
      } else {
        try {
          scanner.clear();
        } catch {
          // ignore: nothing was rendered yet to clear
        }
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <div id={containerId.current} className="overflow-hidden rounded-xl" />;
}
