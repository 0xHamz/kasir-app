"use client";

import { useState } from "react";
import BarcodeScannerComponent from "react-qr-barcode-scanner";

export default function BarcodeScanner() {
  const [data, setData] = useState<string>("");

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <h1 className="text-2xl font-bold mb-4">Scan Barcode / QR Code</h1>

      <div className="w-full max-w-md bg-white p-4 rounded shadow">
        <BarcodeScannerComponent
          width={400}
          height={300}
          onUpdate={(err, result) => {
            if (result) {
              setData(result.text); // hasil scan
            }
          }}
        />

        <p className="mt-4 text-center text-lg">
          Hasil Scan:{" "}
          <span className="font-mono text-blue-600">{data || "Belum ada"}</span>
        </p>
      </div>
    </div>
  );
}
