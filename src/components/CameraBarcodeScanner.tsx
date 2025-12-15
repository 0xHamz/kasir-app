"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";

const BarcodeScanner = dynamic(
  () => import("react-qr-barcode-scanner"),
  { ssr: false }
);

type Props = {
  onScan: (barcode: string) => void;
};

export default function CameraBarcodeScanner({ onScan }: Props) {
  const [data, setData] = useState("");
  const [facingMode, setFacingMode] = useState<"user" | "environment">("environment");

  useEffect(() => {
    const isMobile = /Mobi|Android/i.test(navigator.userAgent);
    setFacingMode(isMobile ? "environment" : "user");
  }, []);

  return (
    <div className="w-full h-64 relative">
      <BarcodeScanner
        onUpdate={(err, result) => {
          if (err) console.error("Scan error:", err);
          if (result && result.text !== data) {
            setData(result.text);
            onScan(result.text);
          }
        }}
        constraints={{
          facingMode,
          width: 1280,
          height: 720,
        }}
        formats={["ean_13"]}
      />
      <p className="text-gray-500 mt-2">Scan hasil: {data}</p>
    </div>
  );
}
