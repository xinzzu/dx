"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import Button from "@/components/ui/Button";
import TextField from "@/components/ui/TextField";
import { useUsage } from "@/stores/catat/usage";
import { useRouter } from "next/navigation";

// Pastikan di store: FoodReport.items = Array<{ id: string; freq: "1-3" | "4-5" }>
type Freq = "1-3" | "4-5";

// Ikon: letakkan di /public/images/food/*
const FOODS = [
  { id: "egg",     label: "Telur",       icon: "/images/lembaga/catat/konsumsi-makanan/egg.png" },
  { id: "milk",    label: "Susu",        icon: "/images/lembaga/catat/konsumsi-makanan/milk.png" },
  { id: "fish",    label: "Ikan",        icon: "/images/lembaga/catat/konsumsi-makanan/fish.png" },
  { id: "rice",    label: "Nasi",        icon: "/images/lembaga/catat/konsumsi-makanan/rice.png" },
  { id: "seafood", label: "Seafood",     icon: "/images/lembaga/catat/konsumsi-makanan/seafood.png" },
  { id: "poultry", label: "Unggas",      icon: "/images/lembaga/catat/konsumsi-makanan/chicken.png" },
  { id: "goat",    label: "Kambing",     icon: "/images/lembaga/catat/konsumsi-makanan/goat.png" },
  { id: "beef",    label: "Sapi",        icon: "/images/lembaga/catat/konsumsi-makanan/beef.png" },
  { id: "dairy",   label: "Olahan Susu", icon: "/images/lembaga/catat/konsumsi-makanan/cheese.png" },
] as const;
type FoodId = (typeof FOODS)[number]["id"];

const FREQS: Array<{ value: Freq; label: string }> = [
  { value: "1-3", label: "1–3 kali seminggu" },
  { value: "4-5", label: "4–5 kali seminggu" },
];

export default function CatatKonsumsiMakananPage() {
  const { addFood } = useUsage();
const router = useRouter();
  const [date, setDate] = useState<string>("");
  const [period, setPeriod] = useState<"weekly" | "monthly">("weekly");

  // state per item (tanpa any)
  const [checked, setChecked] = useState<Partial<Record<FoodId, boolean>>>({});
  const [open, setOpen] = useState<Partial<Record<FoodId, boolean>>>({});
  const [freq, setFreq] = useState<Partial<Record<FoodId, Freq>>>({});

  const selectedCount = useMemo(
    () => Object.values(checked).filter(Boolean).length,
    [checked]
  );
  const allFreqChosen = useMemo(
    () => FOODS.every((f) => !checked[f.id] || !!freq[f.id]),
    [checked, freq]
  );

  const canSubmit = !!date && selectedCount > 0 && allFreqChosen;

  const toggleRow = (id: FoodId) => {
    setChecked((s) => ({ ...s, [id]: s[id] ?? true }));
    setOpen((s) => ({ ...s, [id]: !s[id] }));
  };

  const toggleCheck = (id: FoodId) => {
    setChecked((s) => {
      const next = !s[id];
      if (!next) setFreq((f) => ({ ...f, [id]: undefined }));
      return { ...s, [id]: next };
    });
  };

  const handleSave = () => {
    if (!canSubmit) return;
    const items = FOODS
      .filter((f) => !!checked[f.id])
      .map((f) => ({ id: f.id, freq: (freq[f.id] as Freq) || "1-3" }));
    addFood({ date, period, items });
    setChecked({});
    setOpen({});
    setFreq({});
  };

  return (
    <main className="px-4 pb-28">
      <header className="mb-3 flex items-center gap-2">
              <button
                onClick={() => router.back()}
                aria-label="Kembali"
                className="h-9 w-9 grid place-items-center"
              >
                <Image src="/arrow-left.svg" alt="" width={18} height={18} />
              </button>
              <h1 className="flex-1 text-center text-lg font-semibold">
                Konsumsi Makanan
              </h1>
              <div className="h-9 w-9" />
            </header>
      
            <div
              className="mx-auto mt-3 h-[2px] w-full"
              style={{ backgroundColor: "var(--color-primary)" }}
            />

      <div className="rounded-2xl p-4 space-y-4 bg-white">
        {/* Tanggal */}
        <TextField
          id="date"
          label="Tanggal Laporan *"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
        />

        {/* Periode */}
        <div>
          <div className="mb-2 text-sm text-black">Pilih Periode Laporan</div>
          <div className="grid grid-cols-2 gap-3">
            <Button
              type="button"
              onClick={() => setPeriod("weekly")}
              {...(period === "weekly" ? {} : { variant: "outline" })}
            >
              Mingguan
            </Button>
            <Button
              type="button"
              onClick={() => setPeriod("monthly")}
              {...(period === "monthly" ? {} : { variant: "outline" })}
            >
              Bulanan
            </Button>
          </div>

          <div className="mt-3 rounded-xl border border-amber-300 bg-amber-50 p-3 text-sm text-black">
            <div className="font-semibold mb-1">Informasi</div>
            <ul className="list-disc pl-5 space-y-1">
              <li>Mingguan: Lapor setiap minggu (4x per bulan) untuk hasil yang lebih akurat.</li>
              <li>Bulanan: Lapor sekali per bulan sebagai estimasi rata-rata konsumsi Anda.</li>
            </ul>
          </div>
        </div>

        {/* List makanan (accordion + checkbox & radio kustom) */}
        <div className="space-y-3">
          {FOODS.map((f) => {
            const isChecked = !!checked[f.id];
            const isOpen = !!open[f.id];
            const selectedFreq = freq[f.id];

            return (
              <div
                key={f.id}
                className={`rounded-2xl border transition ${
                  isChecked ? "border-emerald-500 bg-emerald-50/30" : "border-gray-200 bg-white"
                }`}
              >
                {/* Header */}
                <button type="button" onClick={() => toggleRow(f.id)} className="w-full px-3 py-3">
                  <div className="flex items-center gap-3">
                    {/* Checkbox kustom */}
                    <label
                      className="inline-flex items-center"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleCheck(f.id)}
                        className="peer sr-only"
                      />
                      <span
                        className="
                          grid h-5 w-5 place-items-center rounded border
                          border-gray-300 bg-white transition
                          peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-emerald-300
                          peer-checked:bg-emerald-500 peer-checked:border-emerald-500
                        "
                      >
                        <svg
                          viewBox="0 0 20 20"
                          className="h-3.5 w-3.5 text-white opacity-0 transition-opacity duration-150 peer-checked:opacity-100"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M4 10l4 4 8-8" />
                        </svg>
                      </span>
                    </label>

                    <div className="grid place-items-center h-10 w-10 rounded-full bg-gray-50 shrink-0">
                      <Image src={f.icon} alt={f.label} width={26} height={26} />
                    </div>
                    <div className="flex-1 font-medium text-left">{f.label}</div>

                    <svg
                      className={`h-5 w-5 transition ${isOpen ? "rotate-180" : ""}`}
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                </button>

                {/* Body */}
                {isOpen && (
                  <div className="px-3 pb-3">
                    <div className={`space-y-2 ${!isChecked ? "opacity-50 pointer-events-none" : ""}`}>
                      {FREQS.map((opt) => (
                        <label
                          key={opt.value}
                          className={`flex items-center gap-3 rounded-xl border px-3 py-3 ${
                            selectedFreq === opt.value
                              ? "border-emerald-500 bg-white"
                              : "border-gray-200 bg-gray-50"
                          }`}
                        >
                          {/* Radio kustom */}
                          <input
                            type="radio"
                            name={`freq-${f.id}`}
                            value={opt.value}
                            checked={selectedFreq === opt.value}
                            onChange={() => setFreq((s) => ({ ...s, [f.id]: opt.value }))}
                            className="peer sr-only"
                          />
                          <span
                            className="
                              relative h-5 w-5 rounded-full border border-gray-300 bg-white transition
                              peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-emerald-300
                              peer-checked:border-emerald-500
                              after:absolute after:inset-1.5 after:rounded-full after:bg-emerald-500
                              after:opacity-0 peer-checked:after:opacity-100 after:transition-opacity
                            "
                          />
                          <span className="text-sm">{opt.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <Button fullWidth size="lg" disabled={!canSubmit} onClick={handleSave}>
          Simpan Data
        </Button>
      </div>
    </main>
  );
}
