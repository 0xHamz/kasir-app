"use client";

import { forwardRef } from "react";

type Props = {
  onScan: (barcode: string) => void;
};

const BarcodeInput = forwardRef<HTMLInputElement, Props>(({ onScan }, ref) => {
  return (
    <input
      ref={ref}
      autoFocus
      placeholder="Scan barcode di sini..."
      className="w-full border-2 border-gray-300 rounded-lg p-4 text-xl"
      onKeyDown={async (e) => {
        if (e.key === "Enter") {
          const barcode = e.currentTarget.value.trim();
          if (barcode) {
            await onScan(barcode);
          }
        }
      }}
    />
  );
});

BarcodeInput.displayName = "BarcodeInput";
export default BarcodeInput;
