"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

export default function GreetingHeader() {
  const [name, setName] = useState("Nama Lembaga");

  useEffect(() => {
    const nm =
      typeof window !== "undefined"
        ? localStorage.getItem("org.name")
        : null;
    if (nm) setName(nm);
  }, []);

  return (
    <header className="flex items-center gap-3">
      
      <div className="flex-1">
        <h1 className="text-lg font-semibold">Halo, {name}</h1>
        <p className="text-sm text-black/60">
          Jejak Karbon untuk Bumi yang lebih Hijau!
        </p>
      </div>
      <button
        aria-label="Notifikasi"
        className="h-9 w-9 grid place-items-center rounded-full "
      >
        <Image src="/icons/bells.svg" alt="" width={18} height={18} />
      </button>
    </header>
  );
}
