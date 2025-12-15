"use client";

import MultiCameraScanner from "@/components/BarcodeScannerZXing";
import { db } from "@/lib/firebase";
import { 
  collection, 
  doc, 
  updateDoc,
  addDoc,
  increment,
  onSnapshot,
  deleteDoc
} from "firebase/firestore";

import { useRef, useState, useEffect } from "react";
import toast, { Toaster } from "react-hot-toast";
import Navbar from "@/components/Navbar";

type Product = {
  id: string;
  name: string;
  barcode: string;
  price: number;
  stock: number;
};

export default function AdminScanstock() {
  const [products, setProducts] = useState<Product[]>([]);
  const [form, setForm] = useState({ name: "", barcode: "", price: 0, stock: 0 });
  const [editId, setEditId] = useState<string | null>(null);

  // Realtime listener untuk produk
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "products"), (snapshot) => {
      const data: Product[] = snapshot.docs.map(docSnap => ({
        id: docSnap.id,
        ...(docSnap.data() as Omit<Product, "id">),
      }));
      setProducts(data);
    }, (err) => {
      console.error(err);
      toast.error("Gagal mengambil data produk realtime");
    });

    return () => unsubscribe();
  }, []);

  const scanCooldown = useRef(false);

  const handleScan = async (barcode: string) => {
  if (!barcode || scanCooldown.current) return;

  scanCooldown.current = true;
  setTimeout(() => (scanCooldown.current = false), 1500);

  try {
    const product = products.find(p => p.barcode === barcode);

    if (!product) {
      // Produk tidak ditemukan → isi form manual untuk tambah baru
      toast("Produk tidak ditemukan, silahkan tambah manual!", { icon: "⚠️" });
      setForm({
        name: "",
        barcode, // otomatis isi barcode hasil scan
        price: 0,
        stock: 1 // default 1
      });
      setEditId(null); // pastikan mode tambah, bukan edit
      return;
    }

    // Produk ada → update stock
    await updateDoc(doc(db, "products", product.id), {
      stock: increment(1)
    });

    toast.success(`Stock ${product.name} bertambah!`);
  } catch (err) {
    console.error(err);
    toast.error("Gagal menambahkan stock!");
  }
};


  const handleManualAddOrEdit = async () => {
    const { name, barcode, price, stock } = form;
    if (!name || !barcode || price <= 0 || stock <= 0) {
      toast.error("Lengkapi semua field dengan benar");
      return;
    }

    try {
      if (editId) {
        // Mode Edit
        await updateDoc(doc(db, "products", editId), {
          name,
          barcode,
          price,
          stock
        });
        toast.success(`Produk ${name} berhasil diupdate!`);
        setEditId(null);
      } else {
        // Mode Add
        const existing = products.find(p => p.barcode === barcode);
        if (existing) {
          await updateDoc(doc(db, "products", existing.id), {
            name,
            price,
            stock: increment(stock)
          });
          toast.success(`Produk ${name} diupdate! Stock bertambah ${stock}`);
        } else {
          await addDoc(collection(db, "products"), { name, barcode, price, stock });
          toast.success(`Produk ${name} ditambahkan!`);
        }
      }

      setForm({ name: "", barcode: "", price: 0, stock: 0 });
    } catch (err) {
      console.error(err);
      toast.error("Gagal menyimpan data");
    }
  };

  const handleEdit = (product: Product) => {
    setForm({
      name: product.name,
      barcode: product.barcode,
      price: product.price,
      stock: product.stock
    });
    setEditId(product.id);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Apakah yakin ingin menghapus produk ini?")) return;
    try {
      await deleteDoc(doc(db, "products", id));
      toast.success("Produk berhasil dihapus");
      // Jika sedang edit produk yang sama, reset form
      if (editId === id) {
        setForm({ name: "", barcode: "", price: 0, stock: 0 });
        setEditId(null);
      }
    } catch (err) {
      console.error(err);
      toast.error("Gagal menghapus produk");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar role="admin" />
      <div className="p-6 flex justify-center">
        <div className="w-full max-w-5xl space-y-6">
          <Toaster position="top-right" />

          {/* Scanner + Manual */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 justify-center">
            
            {/* Scanner */}
            <div className="bg-white p-4 rounded-xl shadow-lg max-w-md mx-auto space-y-3 text-center">
              <h2 className="text-lg font-semibold text-gray-700">Tambah Stock via Scan</h2>
              <MultiCameraScanner onScan={handleScan} />
              <p className="text-gray-400 text-sm">⏎ Scan otomatis akan menambah stock sesuai barcode</p>
            </div>

            {/* Form Manual */}
            <div className="bg-white p-6 rounded-xl shadow-lg max-w-md mx-auto space-y-4">
              <h2 className="text-lg font-semibold text-gray-700 text-center">
                {editId ? "Edit Produk" : "Tambah Produk Manual"}
              </h2>

              <input
                type="text"
                placeholder="Nama Produk"
                className="w-full border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
              />
              <input
                type="text"
                placeholder="Barcode"
                className="w-full border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                value={form.barcode}
                onChange={e => setForm({ ...form, barcode: e.target.value })}
              />
              <input
                type="number"
                placeholder="Harga"
                className="w-full border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                value={form.price === 0 ? "" : form.price}
                onChange={e => setForm({ ...form, price: e.target.value === "" ? 0 : +e.target.value })}
              />
              <input
                type="number"
                placeholder="Stock"
                className="w-full border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                value={form.stock === 0 ? "" : form.stock}
                onChange={e => setForm({ ...form, stock: e.target.value === "" ? 0 : +e.target.value })}
              />

              <button
                className="bg-blue-500 text-white px-4 py-3 rounded-lg hover:bg-blue-600 transition w-full font-semibold shadow-sm"
                onClick={handleManualAddOrEdit}
              >
                {editId ? "Simpan Perubahan" : "Tambah / Update Produk"}
              </button>
            </div>
          </div>

          {/* Tabel Produk */}
          <div className="bg-white p-4 rounded-2xl shadow-xl overflow-x-auto mx-auto w-full">
            <h2 className="text-lg font-semibold text-gray-700 mb-4 text-center">Daftar Produk</h2>
            <table className="min-w-full divide-y divide-gray-200 text-gray-700 text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2 text-left font-medium">Nama</th>
                  <th className="px-4 py-2 text-left font-medium">Barcode</th>
                  <th className="px-4 py-2 text-left font-medium">Harga</th>
                  <th className="px-4 py-2 text-left font-medium">Stock</th>
                  <th className="px-4 py-2 text-center font-medium">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {products.map((p, idx) => (
                  <tr
                    key={p.id}
                    className={`transition hover:bg-blue-50 ${idx % 2 === 0 ? "bg-white" : "bg-gray-50"}`}
                  >
                    <td className="px-4 py-2">{p.name}</td>
                    <td className="px-4 py-2">{p.barcode}</td>
                    <td className="px-4 py-2">{p.price}</td>
                    <td className="px-4 py-2">{p.stock}</td>
                    <td className="px-4 py-2 flex justify-center gap-2">
                      <button
                        className="bg-yellow-400 text-white px-3 py-1 rounded hover:bg-yellow-500 transition"
                        onClick={() => handleEdit(p)}
                      >
                        Edit
                      </button>
                      <button
                        className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition"
                        onClick={() => handleDelete(p.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
