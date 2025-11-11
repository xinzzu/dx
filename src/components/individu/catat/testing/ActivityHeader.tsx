// src/components/catat/ActivityHeader.tsx
"use client";

export default function ActivityHeader() {
  return (
    <>
      <header className="text-center">
        <h1 className="text-xl font-semibold">Catat Aktivitas</h1>
        <p className="text-sm text-black/60">Hitung jejak karbon bulanan Anda</p>
      </header>
      <div
        className="mt-3 h-[2px] w-full"
        style={{ backgroundColor: "var(--color-primary)" }}
      />
    </>
  );
}