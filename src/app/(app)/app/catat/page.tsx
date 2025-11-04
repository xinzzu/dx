// src/app/(app)/app/catat/page.tsx
"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";

import CategoryItem from "@/components/shared/catat/CategoryItem";
import ReportRow from "@/components/shared/catat/ReportRow";
import EmptySavedBox from "@/components/shared/catat/EmptySavedBox";
import ResultCard from "@/components/shared/catat/ResultCard";

type SavedReport = {
  id: string;
  title: string;    // "Transportasi"
  dateISO: string;  // "2025-10-20"
  amount: number;   // 375
  href: string;
};

const INITIAL_REPORTS: SavedReport[] = [
  {
  
    id: "t",
    title: "Transportasi",
    dateISO: "2025-10-20",
    amount: 375,
    href: "/app/catat/transportasi?month=2025-10",
  },
  {
    id: "l",
    title: "Energi Listrik",
    dateISO: "2025-10-20",
    amount: 625,
    href: "/app/catat/listrik?month=2025-10",
  },
  {
    id: "m",
    title: "Konsumsi Makanan",
    dateISO: "2025-10-20",
    amount: 250,
    href: "/app/catat/makanan?month=2025-10",
  },
];

export default function CatatIndividuPage() {
  const router = useRouter();

  // NOTE:
  // - Untuk melihat EMPTY STATE: ubah nilai awal ini menjadi [].
  const [reports] = useState<SavedReport[]>(INITIAL_REPORTS);

  const total = useMemo(
    () => reports.reduce((sum, r) => sum + r.amount, 0),
    [reports]
  );

  return (
    <main className="min-h-dvh bg-white text-black">
      <div className="mx-auto max-w-lg px-4 pb-[88px] pt-6">
        {/* Title + Subtitle */}
        <header className="text-center">
          <h1 className="text-2xl font-semibold">Catat Emisi Karbon</h1>
          <p className="mt-1 text-sm text-black/60">Hitung jejak karbon bulanan Anda</p>
        </header>

        {/* Divider hijau tipis */}
        <div
          className="mx-auto mt-3 h-[2px] w-full"
          style={{ backgroundColor: "var(--color-primary)" }}
        />

        {/* Pilih Kategori */}
        <section className="mt-5">
          <h2 className="mb-2 text-base font-semibold">Pilih Kategori</h2>

          <div className="space-y-3">
            <CategoryItem
              iconSrc="/images/catat/transport.png"
              title="Transportasi"
              subtitle="Kendaraan operasional"
              href="/app/catat/transportasi"
            />
            <CategoryItem
              iconSrc="/images/catat/energy.png"
              title="Penggunaan Listrik"
              subtitle="Konsumsi energi listrik"
              href="/app/catat/energi-listrik"
            />
            <CategoryItem
              iconSrc="/images/catat/plastic.png"
              title="Konsumsi Makanan"
              subtitle="Makanan yang Anda konsumsi"
              href="/app/catat/konsumsi-makanan"
            />
          </div>
        </section>

        {/* Laporan Tersimpan Bulan ini */}
        <section className="mt-6">
          <div className="mb-2 flex items-center gap-2">
            <Image alt="" src="/images/catat/pencil-bolt.png" width={30} height={30} />
            <h3 className="text-base font-semibold">Laporan Tersimpan Bulan ini</h3>
          </div>

          {reports.length === 0 ? (
            <EmptySavedBox />
          ) : (
            <div className="space-y-3 mt-4">
              {reports.map((r) => (
                <ReportRow
                  key={r.id}
                  title={r.title}
                  dateISO={r.dateISO}
                  amount={r.amount}
                  href={r.href}
                />
              ))}
            </div>
          )}
        </section>

        {/* Hasil Perhitungan */}
        <section className="mt-8 text-center">
          <h3 className="mb-3 text-base font-semibold">Hasil Perhitungan</h3>
          <ResultCard value={total} />
        </section>

        {/* CTA ke Riwayat */}
        <div className="mt-6">
          <Button
            size="lg"
            fullWidth
            onClick={() => router.push("/app/catat/riwayat")}
            className="!bg-[color:var(--color-primary)] hover:!bg-[color:var(--color-primary)]/90"
          >
            Lihat Riwayat Laporan Anda
          </Button>
        </div>
      </div>
    </main>
  );
}
