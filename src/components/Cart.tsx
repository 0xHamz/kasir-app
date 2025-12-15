"use client";

import { useEffect, useState } from "react";
import { getCurrentUserInfo } from "@/lib/auth";

type CartItem = {
  id: string;
  name: string;
  price: number;
  qty: number;
};

type Props = {
  items: CartItem[];
  setItems: (items: CartItem[]) => void;
};

export default function Cart({ items, setItems }: Props) {
  const [kasir, setKasir] = useState("STAFF");
  const [trxNo] = useState(() => `TRX-${Date.now()}`);
  const [date] = useState(new Date());

  useEffect(() => {
    getCurrentUserInfo().then((u) => {
      if (u?.name) setKasir(u.name);
    });
  }, []);

  // 🔹 Gabung item berdasarkan ID
  const grouped: Record<string, CartItem & { qty: number }> = {};
  items.forEach((item) => {
    if (!grouped[item.id]) {
      grouped[item.id] = { ...item, qty: 1 };
    } else {
      grouped[item.id].qty += 1;
    }
  });

  const cartItems = Object.values(grouped);

  // 🔹 Tambah qty
  const increase = (id: string) => {
    const item = items.find((i) => i.id === id);
    if (item) setItems([...items, item]);
  };

  // 🔹 Kurangi qty
  const decrease = (id: string) => {
    const index = items.findIndex((i) => i.id === id);
    if (index !== -1) {
      const copy = [...items];
      copy.splice(index, 1);
      setItems(copy);
    }
  };

  // 🔹 Hapus item total
  const removeItem = (id: string) => {
    setItems(items.filter((i) => i.id !== id));
  };

  const total = cartItems.reduce(
    (sum, i) => sum + i.price * i.qty,
    0
  );

  return (
    <div id="receipt" className="print:block border rounded p-4 bg-white">
      <h2 className="text-xl font-bold mb-3 print:hidden">
        Keranjang
      </h2>

      {/* HEADER STRUK */}
      <div className="hidden print:block text-center mb-2 text-sm">
        <p className="font-bold text-base">TOKO UMKM MAJU JAYA</p>
        <p>Jl. Contoh No.123</p>
        <p>Telp: 0812-xxxx-xxxx</p>
        <hr className="my-1 border-dashed border-black" />
      </div>

      {/* INFO TRANSAKSI */}
      <div className="hidden print:block text-xs mb-2">
        <div className="flex justify-between">
          <span>Tanggal</span>
          <span>{date.toLocaleDateString("id-ID")}</span>
        </div>
        <div className="flex justify-between">
          <span>Jam</span>
          <span>{date.toLocaleTimeString("id-ID")}</span>
        </div>
        <div className="flex justify-between">
          <span>Kasir</span>
          <span>{kasir}</span>
        </div>
        <div className="flex justify-between">
          <span>No. Transaksi</span>
          <span>{trxNo}</span>
        </div>
        <hr className="my-1 border-dashed border-black" />
      </div>

      {cartItems.map((item) => (
        <div
          key={item.id}
          className="flex justify-between items-center border-b py-2"
        >
          <div>
            <p className="font-medium">{item.name}</p>
            <p className="text-sm text-gray-500">
              {item.qty} x Rp {item.price.toLocaleString()}
            </p>
          </div>

          <div className="print:hidden flex items-center gap-2">
            <button
              onClick={() => decrease(item.id)}
              className="px-2 border rounded"
            >
              −
            </button>

            <span className="w-6 text-center">{item.qty}</span>

            <button
              onClick={() => increase(item.id)}
              className="px-2 border rounded"
            >
              +
            </button>

            <button
              onClick={() => removeItem(item.id)}
              className="ml-2 text-red-500"
            >
              ✕
            </button>
          </div>

          <p className="font-semibold w-24 text-right">
            Rp {(item.price * item.qty).toLocaleString()}
          </p>
        </div>
      ))}

      <hr className="my-2 border-dashed border-black" />

      <div className="flex justify-between font-bold text-sm">
        <span>TOTAL</span>
        <span>Rp {total.toLocaleString()}</span>
      </div>

      <div className="hidden print:block text-center text-xs mt-3">
        <p>Terima kasih</p>
        <p>Barang yang sudah dibeli</p>
        <p>tidak dapat dikembalikan</p>
      </div>

      {/* PRINT */}
      <button
        onClick={() => window.print()}
        className="print:hidden w-full mt-4 bg-black text-white py-2 rounded"
      >
        Cetak Struk
      </button>
    </div>
  );
}
