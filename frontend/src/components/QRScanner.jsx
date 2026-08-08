import React, { useEffect, useRef } from "react";

/**
 * QRScanner component using html5-qrcode library.
 * Props:
 *   - onScan: function(string) called with decoded QR text.
 */
export default function QRScanner({ onScan }) {
  const scannerRef = useRef(null);
  const elementId = "qr-scanner-element";

  useEffect(() => {
    let html5QrCode = null;
    // Dynamically import to avoid SSR issues
    import("html5-qrcode")
      .then(({ Html5Qrcode }) => {
        html5QrCode = new Html5Qrcode(elementId);
        return html5QrCode.start(
          { facingMode: "environment" }, // rear camera if available
          { fps: 10, qrbox: 250 },
          (decodedText) => {
            onScan(decodedText);
            html5QrCode.stop();
          },
          (errorMessage) => {
            // optional error handling
          }
        );
      })
      .catch((err) => console.error("Failed to load html5-qrcode:", err));

    return () => {
      if (html5QrCode) {
        html5QrCode.stop().catch(() => {});
      }
    };
  }, [onScan]);

  return <div id={elementId} style={{ width: "100%" }} ref={scannerRef} />;
}
