"use client";

import { useMemo, useState } from "react";
import type {
  WasteCategoryDef,
  WasteItemInput,
  WasteReportPayload,
  WasteUnit,
} from "./types";

type Props = {
  categories: WasteCategoryDef[];
  onSubmit?: (payload: WasteReportPayload) => void;
};

export default function WasteFormSection({ categories, onSubmit }: Props) {
  const [date, setDate] = useState<string>("");
  const [period, setPeriod] = useState<"weekly" | "monthly">("weekly");

  // ⬇️ simpan input sebagai STRING biar bisa kosong / sedang diketik
  const [qtyMap, setQtyMap] = useState<Record<string, string>>({});

  const hasAnyValue = useMemo(
    () => categories.some((c) => parseFloat(qtyMap[c.id] ?? "") > 0),
    [categories, qtyMap]
  );
  const canSubmit = !!date && hasAnyValue;

  // normalisasi angka: ganti koma jadi titik, hanya angka & 1 titik
  const sanitize = (raw: string) => {
    const v = raw.replace(",", ".");              // dukung koma
    // izinkan kosong, atau pola angka desimal sederhana
    if (v === "" || /^[0-9]*\.?[0-9]*$/.test(v)) return v;
    return v; // fallback: biarkan saja
  };

  const setQty = (id: string, raw: string) =>
    setQtyMap((s) => ({ ...s, [id]: sanitize(raw) }));

  const handleSubmit = () => {
    if (!canSubmit) return;

    const items: WasteItemInput[] = categories
      .map((c) => {
        const n = parseFloat((qtyMap[c.id] ?? "").replace(",", "."));
        const quantity = Number.isFinite(n) ? n : 0;
        return { category_id: c.id, quantity, unit: "kg" as WasteUnit };
      })
      .filter((it) => it.quantity > 0);

    const payload: WasteReportPayload = {
      report_date: date,
      period,
      items,
    };

    console.log("♻️ Waste payload:", payload);
    onSubmit?.(payload);
  };

  return (
    <div className="space-y-4">
      {/* Tanggal laporan */}
      <div className="space-y-2">
        <label htmlFor="waste-date" className="text-sm font-medium text-black">
          Tanggal Laporan
        </label>
        <input
          id="waste-date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-emerald-500"
        />
      </div>

      {/* Periode */}
      <div>
        <div className="mb-2 text-sm text-black">Pilih Periode Laporan</div>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setPeriod("weekly")}
            className={`rounded-xl px-4 py-2.5 text-sm font-medium ${
              period === "weekly"
                ? "bg-[color:var(--color-primary)] text-white"
                : "bg-gray-200 text-black/70"
            }`}
          >
            Mingguan
          </button>
          <button
            type="button"
            onClick={() => setPeriod("monthly")}
            className={`rounded-xl px-4 py-2.5 text-sm font-medium ${
              period === "monthly"
                ? "bg-[color:var(--color-primary)] text-white"
                : "bg-gray-200 text-black/70"
            }`}
          >
            Bulanan
          </button>
        </div>
      </div>

      <div className="text-sm font-medium text-black">
        Berapa banyak produksi sampah dihasilkan?
      </div>

      {/* Kategori list */}
      <div className="space-y-3">
        {categories.map((c) => {
          const val = qtyMap[c.id] ?? ""; // ⬅️ default kosong, bukan "0"
          return (
            <div key={c.id} className="rounded-2xl border border-emerald-400/80 bg-white p-3">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="font-semibold">{c.label}</div>
                  {!!c.hint && <div className="text-xs text-black/60">{c.hint}</div>}
                </div>

                <div className="flex items-center gap-2">
                  <input
                    // pakai type="text" + inputMode decimal agar bebas state kosong
                    type="text"
                    inputMode="decimal"
                    placeholder="0"
                    value={val}
                    onChange={(e) => setQty(c.id, e.target.value)}
                    className="h-10 w-24 rounded-xl border border-gray-300 bg-white px-3 text-center text-sm outline-none focus:border-emerald-500"
                  />
                  <div className="h-10 rounded-xl border border-gray-300 bg-gray-50 px-3 text-sm grid place-items-center">
                    kg
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <button
        type="button"
        disabled={!canSubmit}
        onClick={handleSubmit}
        className={`mt-4 w-full rounded-2xl px-4 py-3 text-sm font-semibold ${
          canSubmit
            ? "bg-[color:var(--color-primary)] text-white"
            : "bg-gray-300 text-white/80"
        }`}
      >
        Simpan Data
      </button>
    </div>
  );
}
