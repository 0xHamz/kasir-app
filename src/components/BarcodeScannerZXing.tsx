"use client";

import { useEffect, useRef, useState } from "react";
import { BrowserMultiFormatReader } from "@zxing/library";

interface MultiCameraScannerProps {
  onScan: (code: string) => void;
}

export default function MultiCameraScanner({ onScan }: MultiCameraScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);
  const [result, setResult] = useState<string>("");

  useEffect(() => {
    const codeReader = new BrowserMultiFormatReader();

    // Ambil semua kamera
    navigator.mediaDevices.enumerateDevices()
      .then((deviceList) => {
        const videoDevices = deviceList.filter(d => d.kind === "videoinput");
        setDevices(videoDevices);

        // Pilih kamera belakang/main default
        const mainCamera = videoDevices.find(d =>
          d.label.toLowerCase().includes("back") || d.label.toLowerCase().includes("main")
        ) || videoDevices[0];

        setSelectedDeviceId(mainCamera.deviceId);
      })
      .catch(err => console.error("Enumerate devices error:", err));

    return () => codeReader.reset();
  }, []);

  useEffect(() => {
    if (!selectedDeviceId || !videoRef.current) return;

    const codeReader = new BrowserMultiFormatReader();

    codeReader.decodeFromVideoDevice(selectedDeviceId, videoRef.current, (scanResult, err) => {
      if (scanResult) {
        const code = scanResult.getText();
        setResult(code);
        onScan(code); // kirim ke parent

        // reset result setelah 1 detik
        setTimeout(() => setResult(""), 1000);
      }
    });

    return () => {
      codeReader.reset();
      if (videoRef.current?.srcObject) {
        (videoRef.current.srcObject as MediaStream).getTracks().forEach(track => track.stop());
      }
    };
  }, [selectedDeviceId, onScan]);

  return (
    <div className="flex flex-col items-center justify-center w-full">
      <video ref={videoRef} className="w-50 max-w-md rounded shadow" />

      <div className="mt-2 w-full">
        <label className="block mb-1 text-xs font-semibold">Pilih Kamera:</label>
        <select
          className="border rounded text-xs px-2 py-1 w-70"
          value={selectedDeviceId || ""}
          onChange={e => setSelectedDeviceId(e.target.value)}
        >
          {devices.map(device => (
            <option key={device.deviceId} value={device.deviceId}>
              {device.label || `Camera ${device.deviceId}`}
            </option>
          ))}
        </select>
      </div>

      <p className="mt-6 text-center text-sm text-gray-600">
        {result ? <>Hasil Scan: <span className="font-mono text-blue-600">{result}</span></> : "Arahkan kamera ke barcode/QR Code"}
      </p>
    </div>
  );
}
