import { doc, increment, updateDoc } from "firebase/firestore";

export const saveOfflineTransaction = (trx: any) => {
  const data = JSON.parse(localStorage.getItem("offline_trx") || "[]");
  data.push(trx);
  localStorage.setItem("offline_trx", JSON.stringify(data));
};

export const syncOfflineTransaction = async (db: any) => {
  const data = JSON.parse(localStorage.getItem("offline_trx") || "[]");
  if (!data.length) return;

  for (const trx of data) {
    for (const item of trx.items) {
      await updateDoc(doc(db, "products", item.id), {
        stock: increment(-item.qty),
      });
    }
  }

  localStorage.removeItem("offline_trx");
};
