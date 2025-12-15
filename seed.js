// seed.js
import { initializeApp } from "firebase/app";
import { getFirestore, collection, writeBatch, doc } from "firebase/firestore";

// 1️⃣ Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyD2q7rcQRFfFfQkcMBP1norCATzNrMoPpY",
  authDomain: "kasir-app-f5a11.firebaseapp.com",
  projectId: "kasir-app-f5a11",
  storageBucket: "kasir-app-f5a11.firebasestorage.app",
  messagingSenderId: "1039738299840",
  appId: "1:1039738299840:web:f9ec96e279c2fca4475425",
};

// 2️⃣ Init Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// 3️⃣ Contoh data 20 produk
const products = [
  { name: "Beras Premium 5kg", barcode: "123456789001", price: 75000, stock: 50 },
  { name: "Minyak Goreng 1L", barcode: "123456789002", price: 18000, stock: 100 },
  { name: "Gula Pasir 1kg", barcode: "123456789003", price: 15000, stock: 80 },
  { name: "Telur Ayam 1kg", barcode: "123456789004", price: 25000, stock: 60 },
  { name: "Susu UHT 1L", barcode: "123456789005", price: 20000, stock: 70 },
  { name: "Roti Tawar 500g", barcode: "123456789006", price: 12000, stock: 90 },
  { name: "Kopi Instan 100g", barcode: "123456789007", price: 15000, stock: 40 },
  { name: "Teh Celup 25pcs", barcode: "123456789008", price: 8000, stock: 120 },
  { name: "Mie Instan 5pcs", barcode: "123456789009", price: 12000, stock: 200 },
  { name: "Kecap Manis 500ml", barcode: "123456789010", price: 10000, stock: 75 },
  { name: "Saus Tomat 300ml", barcode: "123456789011", price: 9000, stock: 60 },
  { name: "Tepung Terigu 1kg", barcode: "123456789012", price: 12000, stock: 80 },
  { name: "Garam 500g", barcode: "123456789013", price: 5000, stock: 100 },
  { name: "Air Mineral 600ml", barcode: "123456789014", price: 5000, stock: 150 },
  { name: "Snack Keripik 100g", barcode: "123456789015", price: 7000, stock: 70 },
  { name: "Susu Kental Manis 370g", barcode: "123456789016", price: 12000, stock: 60 },
  { name: "Mayonnaise 250ml", barcode: "123456789017", price: 15000, stock: 50 },
  { name: "Biskuit 200g", barcode: "123456789018", price: 10000, stock: 90 },
  { name: "Coklat Batangan 50g", barcode: "123456789019", price: 7000, stock: 80 },
  { name: "Detergen 1kg", barcode: "123456789020", price: 25000, stock: 40 },
];

// 4️⃣ Buat batch write
const batch = writeBatch(db);

products.forEach(p => {
  const docRef = doc(collection(db, "products")); // auto ID
  batch.set(docRef, p);
});

// 5️⃣ Commit batch
batch.commit()
  .then(() => {
    console.log("✅ Semua produk berhasil ditambahkan!");
  })
  .catch(err => {
    console.error("❌ Gagal menambahkan produk:", err);
  });
