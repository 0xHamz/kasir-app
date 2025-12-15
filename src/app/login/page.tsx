"use client";

import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const login = async () => {
  setError("");
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);

      const snap = await getDoc(doc(db, "users", cred.user.uid));
      if (!snap.exists()) {
        setError("User tidak terdaftar");
        return;
      }

      const data = snap.data();
      const role = (data.role as string).toLowerCase(); // normalize ke lowercase
      const name = data.name || cred.user.email;

      localStorage.setItem("role", role);
      localStorage.setItem("kasir_name", name);

      if (role === "admin") router.push("/admin");
      else if (role === "staff") router.push("/staff");
      else if (role === "kasir") router.push("/kasir");
      else setError("Role tidak dikenali");

    } catch {
      // tidak perlu err jika tidak digunakan
      setError("Email atau password salah");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="w-80 space-y-3 bg-white p-6 rounded shadow">
        <h1 className="text-xl font-bold text-center">Login</h1>

        <input
          className="border w-full px-3 py-2 rounded"
          placeholder="Email"
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          className="border w-full px-3 py-2 rounded"
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
        />

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button
          onClick={login}
          className="w-full bg-black text-white py-2 rounded"
        >
          Login
        </button>
        {/* 🔹 Panduan Login Publik */}
        <div className="mt-4 text-sm text-gray-600 bg-gray-50 p-2 rounded border ">
          <p className="font-semibold mb-1">Panduan Login Demo:</p>
          <ol className="list-decimal list-inside space-y-1">
            <li>Email: <span className="font-mono">kasir1@gmail.com</span></li>
            <li>Password: <span className="font-mono">121212</span></li>
            <li>Setelah login, pengguna akan diarahkan ke halaman kasir.</li>
            <li>Di halaman kasir, bisa mencoba scan barcode atau input manual.</li>
            <li>Produk akan otomatis masuk ke cart, dan bisa dicetak struk.</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
