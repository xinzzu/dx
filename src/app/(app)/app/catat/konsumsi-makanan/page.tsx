"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import TextField from "@/components/ui/TextField";
import useAuth from "@/hooks/useAuth";
import {
  listFoodTypes,
  createFoodReport,
  type FoodType,
} from "@/services/food";
import ReportSavedModal from "@/components/ui/ReportSavedModal";
import ScrollContainer from "@/components/nav/ScrollContainer";

// ===== Helpers & types =====
type Period = "weekly" | "monthly";
type Freq = "1-3" | "4-5";
type ApiFreq = "1-3-weekly" | "3-5-weekly";

const toApiFreq = (f: Freq): ApiFreq => (f === "1-3" ? "1-3-weekly" : "3-5-weekly");

const todayISO = () => {
  const d = new Date();
  const tz = new Date(d.getTime() - d.getTimezoneOffset() * 60_000);
  return tz.toISOString().slice(0, 10);
};

const getErrorMessage = (err: unknown) => {
  if (err instanceof Error) return err.message;
  try { return JSON.stringify(err); } catch { return String(err); }
};

// Ikon fallback by name
const ICON_BASE = "/images/lembaga/catat/konsumsi-makanan";
const ICONS_BY_NAME: Array<{ test: (s: string) => boolean; icon: string }> = [
  { test: (s) => /telur/i.test(s), icon: `${ICON_BASE}/egg.png` },
  { test: (s) => /susu|dairy|olahan susu/i.test(s), icon: `${ICON_BASE}/milk.png` },
  { test: (s) => /ikan/i.test(s), icon: `${ICON_BASE}/fish.png` },
  { test: (s) => /seafood/i.test(s), icon: `${ICON_BASE}/seafood.png` },
  { test: (s) => /nasi/i.test(s), icon: `${ICON_BASE}/rice.png` },
  { test: (s) => /ungg?as|ayam|poultry/i.test(s), icon: `${ICON_BASE}/chicken.png` },
  { test: (s) => /sapi|beef/i.test(s), icon: `${ICON_BASE}/beef.png` },
  { test: (s) => /kambing|goat/i.test(s), icon: `${ICON_BASE}/goat.png` },
  { test: (s) => /keju|cheese/i.test(s), icon: `${ICON_BASE}/cheese.png` },
];
const pickIcon = (name: string) => {
  const hit = ICONS_BY_NAME.find((x) => x.test(name));
  return hit ? hit.icon : `${ICON_BASE}/food.png`;
};

// Minimal shape respons
type FoodReportResponseMinimal = { total_co2e?: number };

export default function CatatKonsumsiMakananPage() {
  const router = useRouter();
  const { loading: authLoading, getIdToken } = useAuth();

  const [token, setToken] = useState<string | null>(null);

  // Data BE
  const [foods, setFoods] = useState<FoodType[]>([]);
  const [loadingFoods, setLoadingFoods] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Form state
  const [date, setDate] = useState<string>(todayISO());
  const [period, setPeriod] = useState<Period>("weekly");
  const [checked, setChecked] = useState<Partial<Record<string, boolean>>>({});
  const [open, setOpen] = useState<Partial<Record<string, boolean>>>({});
  const [freq, setFreq] = useState<Partial<Record<string, Freq>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Modal sukses
  const [modalOpen, setModalOpen] = useState(false);
  const [savedTotal, setSavedTotal] = useState<number | null>(null);

  // Ambil token BE
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (authLoading) return;
      const t = await getIdToken();
      if (!cancelled) setToken(t);
    })();
    return () => { cancelled = true; };
  }, [authLoading, getIdToken]);

  // Load food types
  useEffect(() => {
    if (authLoading) return;
    if (!token) {
      setFoods([]);
      return;
    }
    let cancelled = false;
    (async () => {
      setLoadingFoods(true);
      setLoadError(null);
      try {
        const rows = await listFoodTypes(token);
        if (!cancelled) setFoods(rows);
      } catch (e) {
        if (!cancelled) setLoadError(getErrorMessage(e));
      } finally {
        if (!cancelled) setLoadingFoods(false);
      }
    })();
    return () => { cancelled = true; };
  }, [token, authLoading]);

  const selectedCount = useMemo(
    () => Object.values(checked).filter(Boolean).length,
    [checked]
  );
  const allFreqChosen = useMemo(
    () => foods.every((f) => !checked[f.id] || Boolean(freq[f.id])),
    [foods, checked, freq]
  );

  const canSubmit = Boolean(date) && selectedCount > 0 && allFreqChosen && Boolean(token);

  const toggleRow = (id: string) => {
    setOpen((s) => {
      const nextOpen = !s[id];
      setChecked((cs) => ({ ...cs, [id]: nextOpen }));

      if (!nextOpen) {
        setFreq((f) => ({ ...f, [id]: undefined }));
      }
      return { ...s, [id]: nextOpen };
    });
  };

  const toggleCheck = (id: string) => {
    setChecked((s) => {
      const nextChecked = !s[id];

      setOpen((os) => ({ ...os, [id]: nextChecked }));

      if (!nextChecked) {
        setFreq((f) => ({ ...f, [id]: undefined }));
      }
      return { ...s, [id]: nextChecked };
    });
  };

  const handleSave = async () => {
    if (!canSubmit || !token) return;
    setSubmitting(true);
    setSubmitError(null);

    try {
      const items = foods
        .filter((f) => Boolean(checked[f.id]))
        .map((f) => ({
          food_type_id: f.id,
          frequency_key: toApiFreq((freq[f.id] as Freq) || "1-3"),
        }));

      const resp = (await createFoodReport(
        { report_date: date, report_type: period, items },
        token
      )) as unknown as FoodReportResponseMinimal;

      // tampilkan modal
      setSavedTotal(typeof resp?.total_co2e === "number" ? resp.total_co2e : null);
      setModalOpen(true);

      // reset pilihan (opsional)
      setChecked({});
      setOpen({});
      setFreq({});
    } catch (e) {
      setSubmitError(getErrorMessage(e) || "Gagal menyimpan");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollContainer
      headerTitle="Makanan"
      leftContainer={
        <button
          onClick={() => router.back()}
          aria-label="Kembali"
          className="h-9 w-9 grid place-items-center"
        >
          <Image src="/arrow-left.svg" alt="" width={18} height={18} />
        </button>
      }
    >

      {/* Auth notice */}
      {!authLoading && !token && (
        <div className="mb-4 rounded-xl border border-amber-300 bg-amber-50 p-3 text-sm text-black">
          Kamu belum login. Silakan masuk terlebih dahulu untuk mengambil daftar makanan.
        </div>
      )}

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
            <Button type="button" onClick={() => setPeriod("weekly")} {...(period === "weekly" ? {} : { variant: "outline" })}>
              Mingguan
            </Button>
            <Button type="button" onClick={() => setPeriod("monthly")} {...(period === "monthly" ? {} : { variant: "outline" })}>
              Bulanan
            </Button>
          </div>

          <div className="mt-3 rounded-xl border border-amber-300 bg-amber-50 p-3 text-sm text-black">
            <div className="font-semibold mb-1">Informasi</div>
            <ul className="list-disc pl-5 space-y-1">
              <li>Mingguan: Lapor setiap minggu (4x/bulan) untuk hasil yang lebih akurat.</li>
              <li>Bulanan: Lapor sekali per bulan sebagai estimasi rata-rata konsumsi Anda.</li>
            </ul>
          </div>
        </div>

        {/* Daftar makanan */}
        <div className="space-y-3">
          {authLoading && <div className="text-sm text-gray-500">Menyiapkan autentikasi…</div>}
          {!authLoading && token && loadingFoods && (
            <div className="text-sm text-gray-500">Memuat daftar makanan…</div>
          )}
          {!authLoading && token && loadError && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {loadError}
            </div>
          )}

          {!authLoading && token && !loadingFoods && !loadError && foods.map((f) => {
            const isChecked = Boolean(checked[f.id]);
            const isOpen = Boolean(open[f.id]);
            const selectedFreq = freq[f.id];
            const icon = pickIcon(f.name);

            return (
              <div
                key={f.id}
                className={`rounded-2xl border transition ${isChecked ? "border-emerald-500 bg-emerald-50/30" : "border-gray-200 bg-white"
                  }`}
              >
                {/* Header */}
                <button type="button" onClick={() => toggleRow(f.id)} className="w-full px-3 py-3">
                  <div className="flex items-center gap-3">
                    {/* Checkbox */}
                    <label className="inline-flex items-center" onClick={(e) => e.stopPropagation()}>
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
                          fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
                        >
                          <path d="M4 10l4 4 8-8" />
                        </svg>
                      </span>
                    </label>

                    <div className="grid place-items-center h-10 w-10 rounded-full bg-gray-50 shrink-0">
                      <Image src={icon} alt={f.name} width={26} height={26} />
                    </div>

                    <div className="flex-1 font-medium text-left">{f.name}</div>

                    <svg className={`h-5 w-5 transition ${isOpen ? "rotate-180" : ""}`} viewBox="0 0 20 20" fill="currentColor">
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
                      {(
                        [
                          { value: "1-3", label: "1–3 kali seminggu" },
                          { value: "4-5", label: "4–5 kali seminggu" },
                        ] as const
                      ).map((opt) => (
                        <label
                          key={opt.value}
                          className={`flex items-center gap-3 rounded-xl border px-3 py-3 ${selectedFreq === opt.value ? "border-emerald-500 bg-white" : "border-gray-200 bg-gray-50"
                            }`}
                        >
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

        {/* Alerts */}
        {submitError && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{submitError}</div>
        )}

        {/* Action */}
        <Button fullWidth size="lg" disabled={!canSubmit || submitting} onClick={handleSave}>
          {submitting ? "Menyimpan…" : "Simpan Data"}
        </Button>
      </div>

      {/* Modal sukses */}
      <ReportSavedModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        reportKind="Konsumsi Makanan"
        total={savedTotal}
        unit="kg CO₂e"
        redirectTo="/app/catat"
      />
    </ScrollContainer>
  );
}
