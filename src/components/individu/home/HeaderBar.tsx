"use client";

import Image from "next/image";

type Props = {
  name: string;
  onBellClick?: () => void;
};

export default function HeaderBar({ name, onBellClick }: Props) {
  return (
    <header className="flex items-center gap-3">
      <Image
        src="/images/User.png"
        alt={name}
        width={40}
        height={40}
        className="rounded-full object-cover ring-1 ring-black/5"
        priority
      />
      <div className="flex-1">
        <h1 className="text-lg font-semibold">Halo, {name}</h1>
        <p className="text-sm text-black/60">Jejak Karbon untuk Bumi yang lebih Hijau!</p>
      </div>
      <button
        aria-label="Notifikasi"
        className="h-9 w-9 grid place-items-center"
        onClick={onBellClick}
      >
        <Image src="/icons/bells.svg" alt="" width={18} height={18} />
      </button>
    </header>
  );
}
