import { db } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";

export default async function PublicProduct({ params }) {
  const q = query(collection(db, "products"), where("barcode", "==", params.barcode));
  const snap = await getDocs(q);

  if (snap.empty) return <div>Produk tidak ditemukan</div>;

  const p = snap.docs[0].data();

  return (
    <div>
      <h1>{p.name}</h1>
      <p>Harga: Rp {p.price}</p>
    </div>
  );
}
