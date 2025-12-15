import { auth, db } from "./firebase";
import { doc, getDoc } from "firebase/firestore";

export async function getCurrentUserInfo(): Promise<{ uid: string; email: string | null; name?: string } | null> {
  const user = auth.currentUser;
  if (!user) return null;

  const snap = await getDoc(doc(db, "users", user.uid));
  if (!snap.exists()) return null;

  const data = snap.data();
  return {
    uid: user.uid,
    email: user.email,
    name: data?.name, // pastikan field 'name' ada di Firestore
  };
}
