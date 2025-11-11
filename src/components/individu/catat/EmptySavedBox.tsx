// src/components/individu/catat/EmptySavedBox.tsx
"use client";

export default function EmptySavedBox() {
  return (
    <div
      className="rounded-2xl border border-dashed p-8 text-center mt-4"
      style={{ borderColor: "var(--color-gray-600)" }}
    >
      <div className="mx-auto mb-2 grid h-10 w-10 place-items-center rounded-full bg-black/5">
        <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden>
          <path d="M7 7h10M7 12h10M7 17h6" stroke="currentColor" strokeWidth="2" />
        </svg>
      </div>
      <p className="text-sm text-black/60">Belum ada laporan bulan ini</p>
    </div>
  );
}
