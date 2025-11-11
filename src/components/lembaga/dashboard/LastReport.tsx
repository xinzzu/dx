"use client";

import Image from "next/image";
import Link from "next/link";

export default function LastReportCard() {
  return (
    <section
      className="mt-4 rounded-2xl border p-4"
      style={{ borderColor: "var(--color-primary)" }}
    >
      <div className="flex items-center gap-2 text-sm">
        <Image src="/icons/lembaga/calendar.svg" alt="" width={18} height={18} />
        <span className="text-black/70">Laporan terakhir</span>
        <span className="ml-auto text-[color:var(--color-primary)]">
          Belum ada laporan
        </span>
      </div>

      <div className="mt-3 grid place-items-center">
        <div className="h-14 w-14 rounded-full bg-[color:var(--color-secondary)] grid place-items-center">
          <Image src="/icons/lembaga/leaf.svg" alt="" width={28} height={28} />
        </div>
        <h3 className="mt-3 text-center font-semibold">
          Mulai Tracking Jejak Karbon Lembaga Anda
        </h3>
        <p className="mt-1 text-sm text-black/60 text-center">
          Anda belum melaporkan data bulan ini
        </p>
      </div>

      <Link
        href="/org/assets"
        className="mt-4 block w-full rounded-xl py-3 text-center font-medium shadow-lg"
        style={{ background: "var(--color-primary)", color: "white" }}
      >
        Laporkan Data
      </Link>
    </section>
  );
}
