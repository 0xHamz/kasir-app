"use client";

import { useState, useEffect, useRef } from "react";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import Navbar from "@/components/Navbar";
import Cart from "@/components/Cart";
import MultiCameraScanner from "@/components/BarcodeScannerZXing";
import { useRouter } from "next/navigation";

type Product = {
  id: string;
  name: string;
  price: number;
  qty: number;
};

export default function KasirPage() {
  const [role, setRole] = useState<string>("");
  const [loading, setLoading] = useState(true);

  // 🔥 TAMBAHKAN DI SINI
  const [cameraReady, setCameraReady] = useState(false);
  
  const [cart, setCart] = useState<Product[]>([]);
  const [barcodeInput, setBarcodeInput] = useState("");
  const router = useRouter();

  const barcodeRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
  const checkRole = async () => {
      auth.onAuthStateChanged(async (user) => {
        if (!user) {
          router.push("/login");
          return;
        }
  
        const snap = await getDoc(doc(db, "users", user.uid));
        const r = snap.data()?.role;
  
        if (r !== "kasir") {
          alert("Tidak punya akses");
          router.push("/login");
          return;
        }
  
        setRole(r);
        localStorage.setItem("role", r);
        setLoading(false);
        barcodeRef.current?.focus();
  
        // 🔥 MINTA IZIN KAMERA
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true });
  
          // langsung stop stream, hanya untuk permission
          stream.getTracks().forEach(t => t.stop());
  
          // ✅ tandai kamera siap
          setCameraReady(true);
        } catch {
          alert("Izin kamera ditolak atau tidak tersedia");
        }
      });
    };
  
    checkRole();
  }, [router]);



  const addProductToCart = (product: Product) => {
    setCart(prev => [...prev, product]);
  };

  const handleScan = async (barcode: string) => {
    if (!barcode) return;

    const snap = await getDocs(query(collection(db, "products"), where("barcode", "==", barcode)));
    if (snap.empty) {
      alert("Produk tidak ditemukan!");
      return;
    }

    const data = snap.docs[0].data();
    const product: Product = {
      id: snap.docs[0].id,
      name: data.name as string,
      price: data.price as number,
      qty: 1,
    };

    addProductToCart(product);

    // reset input manual
    setBarcodeInput("");
    barcodeRef.current?.focus();
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!barcodeInput) return;
    await handleScan(barcodeInput);
  };

  if (loading) return null;

  return (
    <>
      <Navbar role={role} />
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">

          {/* KIRI - SCAN KAMERA + INPUT */}
          <div className="bg-white rounded-xl shadow p-6 space-y-4">
            <h1 className="text-2xl font-bold text-gray-800 text-center mb-4">Scan Barcode</h1>

            {/* CAMERA SCANNER */}
            {cameraReady ? (
              <MultiCameraScanner onScan={handleScan} />
            ) : (
              <p className="text-center text-sm text-gray-500">
                Menunggu izin kamera...
              </p>
            )}


            <hr className="border-b border-black" />

            {/* Input Manual */}
            <form onSubmit={handleManualSubmit} className="mt-4 flex flex-col gap-2">
              <label className="text-gray-600 text-sm">Masukkan Barcode Manual:</label>
              <input
                type="text"
                ref={barcodeRef}
                value={barcodeInput}
                onChange={e => setBarcodeInput(e.target.value)}
                className="border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="Masukkan barcode manual"
              />
              <button
                type="submit"
                className="bg-black text-white px-4 py-2 rounded hover:bg-blue-600 transition"
              >
                Tambah ke Cart
              </button>
            </form>
          </div>

          {/* KANAN - CART + Panduan */}
          <div className="lg:col-span-2 space-y-6">

            {/* Cart */}
            <Cart items={cart} setItems={setCart} />

            {/* Panduan Penggunaan */}
            <div className="bg-white rounded-xl shadow p-6">
              <h2 className="text-lg font-bold mb-3">Panduan Penggunaan Kasir</h2>
              
              <ol className="list-decimal list-inside text-sm space-y-1">
                <li>Login dengan email: kasir1@gmail.com & password: 121212 </li>
                <li>Scan barcode produk dengan kamera, atau masukkan barcode manual.</li>
                <li>
                  Contoh Sample Barcode:{" "}
                  <a
                    href="https://drive.google.com/drive/folders/1mf_avFo4Ow1_7L62VeNClVjTaMkpwCui?usp=sharing"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline"
                  >
                    https://drive.google.com/drive/folders/1mf_avFo4Ow1_7L62VeNClVjTaMkpwCui?usp=sharing
                  </a>
                </li>
                <li>Produk akan otomatis masuk ke cart di sisi kanan.</li>
                <li>Gunakan tombol + / − untuk mengubah jumlah, atau ✕ untuk hapus produk.</li>
                <li>Setelah selesai, klik "Cetak Struk" untuk struk transaksi.</li>
              </ol>
            </div>
          </div>

          

        </div>
      </div>
    </>
  );
}
