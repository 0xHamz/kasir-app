"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function Navbar({ role }: { role: string }) {
  const [kasir, setKasir] = useState<string | null>(null);
  const router = useRouter();

  // ✅ ambil data HANYA DI CLIENT
  useEffect(() => {
    const name = localStorage.getItem("kasir_name");
    setKasir(name);
  }, []);

  const logout = async () => {
    await signOut(auth);
    localStorage.clear();
    router.push("/login");
  };

  return (
    <nav className="bg-white border-b px-6 py-3 flex justify-between items-center">
      <div className="font-bold text-lg">Kasir App</div>

      <div className="flex items-center gap-4">
        <span className="text-gray-600">
          ({role}) : <b>{kasir ?? "Loading..."}</b>
        </span>

        <button
          onClick={logout}
          className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition"
        >
          Logout
        </button>
      </div>
    </nav>
  );
}
