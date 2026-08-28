"use client";

import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";

export function QrCodeManager({ siteUrl }: { siteUrl: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!canvasRef.current) return;
    QRCode.toCanvas(canvasRef.current, siteUrl, { width: 320, margin: 2 }, (err) => {
      if (err) setError("Could not generate QR code.");
    });
  }, [siteUrl]);

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = "food-court-qr.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  const handlePrint = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL("image/png");
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    printWindow.document.write(`
      <html>
        <head><title>Print QR Code</title></head>
        <body style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;font-family:sans-serif;">
          <img src="${dataUrl}" style="width:320px;height:320px;" />
          <p style="margin-top:16px;font-size:14px;">Scan to order — ${siteUrl}</p>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  return (
    <div className="max-w-sm">
      <div className="rounded-xl border border-neutral-200 bg-white p-6 text-center">
        <canvas ref={canvasRef} className="mx-auto" />
        <p className="mt-3 break-all text-xs text-neutral-500">{siteUrl}</p>
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      </div>

      <div className="mt-4 flex gap-2">
        <button
          onClick={handleDownload}
          className="flex-1 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
        >
          Download
        </button>
        <button
          onClick={handlePrint}
          className="flex-1 rounded-lg border border-neutral-300 px-4 py-2 text-sm font-medium hover:bg-neutral-50"
        >
          Print
        </button>
      </div>
    </div>
  );
}