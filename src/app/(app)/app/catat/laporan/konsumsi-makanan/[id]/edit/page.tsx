"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useRouter, useParams } from "next/navigation";
import Button from "@/components/ui/Button";
import TextField from "@/components/ui/TextField";
import ScrollContainer from "@/components/nav/ScrollContainer";
import useAuth from "@/hooks/useAuth";
import ReportSavedModal from "@/components/ui/ReportSavedModal";
import { listFoodTypes, listFoodReports, updateFoodReport, type FoodType, type FrequencyKey } from "@/services/food";
import { formatCarbonFootprint } from "@/utils/carbonAnalysis";

type Period = "weekly" | "monthly";
type Freq = "1-3" | "4-5" | "6-7";

const toApiFreq = (f: Freq): FrequencyKey => (f === "1-3" ? "1-3-weekly" : "3-5-weekly");

// reuse same icon picker as the catat page
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

export default function EditFoodReportPage() {
  const router = useRouter();
  const params = useParams();
  const reportId = typeof params?.id === "string" ? params.id : null;

  const { getIdToken, loading: authLoading } = useAuth();

  const [token, setToken] = useState<string | null>(null);

  const [foods, setFoods] = useState<FoodType[]>([]);
  const [loadingFoods, setLoadingFoods] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [reportLoaded, setReportLoaded] = useState(false);
  const [reportDate, setReportDate] = useState<string>("");
  const [reportPeriod, setReportPeriod] = useState<Period>("weekly");
  const [checked, setChecked] = useState<Partial<Record<string, boolean>>>({});
  const [freq, setFreq] = useState<Partial<Record<string, Freq>>>({});

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [savedTotal, setSavedTotal] = useState<number>(0);

  // load token
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (authLoading) return;
      const t = await getIdToken();
      if (!cancelled) setToken(t);
    })();
    return () => { cancelled = true; };
  }, [authLoading, getIdToken]);

  // load master foods
  useEffect(() => {
    if (authLoading) return;
    if (!token) return;
    let cancelled = false;
    (async () => {
      setLoadingFoods(true);
      setLoadError(null);
      try {
        // Prefer backend token when calling API
        const { authService } = await import("@/services/auth");
        let backendToken = authService.getToken();
        if (!backendToken) {
          backendToken = token; // token here is firebase id token
          try {
            const exchanged = await authService.loginWithGoogle(token);
            backendToken = exchanged;
            try { authService.saveToken(exchanged); } catch { }
          } catch {
            // fallback to original token if exchange fails
          }
        }
        const rows = await listFoodTypes(backendToken);
        if (!cancelled) setFoods(rows);
      } catch (e) {
        if (!cancelled) setLoadError(String(e ?? ""));
      } finally {
        if (!cancelled) setLoadingFoods(false);
      }
    })();
    return () => { cancelled = true; };
  }, [token, authLoading]);

  // load report by id and prefill
  useEffect(() => {
    if (!reportId) return;
    if (!token) return;
    let cancelled = false;
    (async () => {
      try {
        // Prefer backend token for listing reports
        const { authService } = await import("@/services/auth");
        let backendToken = authService.getToken();
        if (!backendToken) {
          backendToken = token;
          try {
            const exchanged = await authService.loginWithGoogle(token);
            backendToken = exchanged;
            try { authService.saveToken(exchanged); } catch { }
          } catch {
            // ignore
          }
        }
        const reports = await listFoodReports(backendToken);
        const found = reports.find((r) => r.report_id === reportId);
        if (!found) {
          // not found — show message by setting reportLoaded but leave fields empty
          if (!cancelled) setReportLoaded(true);
          return;
        }

        // Prefill date & period (locked)
        if (!cancelled) setReportDate(typeof found.report_date === "string" ? found.report_date : "");
        if (!cancelled) setReportPeriod(found.report_type === "weekly" ? "weekly" : "monthly");

        // map food_details to master ids for checked/freq
        // Support multiple backend shapes:
        // - { food_type_id: '<id>', frequency_key: '1-3-weekly' }
        // - { food: '<name>', frequency: 3 }
        // - mixed shapes
        const initialChecked: Partial<Record<string, boolean>> = {};
        const initialFreq: Partial<Record<string, Freq>> = {};

        const detailsRaw = Array.isArray(found.food_details) ? found.food_details : [];

        detailsRaw.forEach((d: unknown) => {
          const obj = (d as Record<string, unknown>) || {};
          // determine candidate id or name
          const candidateId = (obj["food_type_id"] ?? obj["food_id"] ?? obj["id"]) as string | undefined;
          const candidateName = (obj["food"] ?? obj["name"]) as string | undefined;

          let matchedId: string | undefined;

          // 1) try matching by explicit id (if master list has it)
          if (candidateId) {
            const byId = foods.find((fs) => fs.id === candidateId);
            if (byId) matchedId = byId.id;
            else {
              // If id not in master list, still use candidateId so update payload keeps it
              matchedId = candidateId;
            }
          }

          // 2) fallback: try matching by name (case-insensitive)
          if (!matchedId && candidateName) {
            const byName = foods.find((fs) => (fs.name || "").toLowerCase() === candidateName.toLowerCase());
            if (byName) matchedId = byName.id;
          }

          if (matchedId) {
            initialChecked[matchedId] = true;

            // frequency: prefer frequency_key (string) then numeric frequency
            const fk = (obj["frequency_key"] ?? obj["frequencyKey"] ?? obj["frequency_key"]) as string | undefined;
            if (typeof fk === "string") {
              if (fk.includes("1-3")) initialFreq[matchedId] = "1-3";
              else if (fk.includes("6-7")) initialFreq[matchedId] = "6-7";
              else initialFreq[matchedId] = "4-5";
            } else {
              const rawFreq = obj["frequency"];
              const n = typeof rawFreq === "number" ? rawFreq : Number(rawFreq ?? 0) || 0;
              if (n >= 6) initialFreq[matchedId] = "6-7";
              else if (n > 3) initialFreq[matchedId] = "4-5";
              else initialFreq[matchedId] = "1-3";
            }
          }
        });

        if (!cancelled) setChecked(initialChecked);
        if (!cancelled) setFreq(initialFreq);
        if (!cancelled) setReportLoaded(true);
      } catch (e) {
        console.error("Failed to load report", e);
        if (!cancelled) setReportLoaded(true);
      }
    })();
    return () => { cancelled = true; };
  }, [reportId, token, foods]);

  const selectedCount = useMemo(() => Object.values(checked).filter(Boolean).length, [checked]);
  const allFreqChosen = useMemo(() => foods.every((f) => !checked[f.id] || Boolean(freq[f.id])), [foods, checked, freq]);
  const canSave = Boolean(reportId) && selectedCount > 0 && allFreqChosen && Boolean(token);

  const handleToggle = (id: string) => {
    setChecked((s) => {
      const next = !s[id];
      if (!next) setFreq((f) => ({ ...f, [id]: undefined }));
      return { ...s, [id]: next };
    });
  };

  const handleSave = async () => {
    if (!canSave || !token || !reportId) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const items = foods
        .filter((f) => Boolean(checked[f.id]))
        .map((f) => ({ food_type_id: f.id, frequency_key: toApiFreq((freq[f.id] as Freq) || "1-3") }));

      // Prefer backend access token for update; exchange if missing
      const { authService } = await import("@/services/auth");
      let backendToken = authService.getToken();
      if (!backendToken) {
        if (!token) throw new Error("Autentikasi hilang");
        backendToken = await authService.loginWithGoogle(token);
        try { authService.saveToken(backendToken); } catch { }
      }

      const resp = (await updateFoodReport(reportId, { report_date: reportDate, report_type: reportPeriod, items }, backendToken)) as unknown;
      // try to read total_co2e from response
      let total: number = 0;
      if (resp && typeof resp === "object") {
        const obj = resp as Record<string, unknown>;
        if (typeof obj["total_co2e"] === "number") total = obj["total_co2e"] as number;
        else if (obj["data"] && typeof (obj["data"] as Record<string, unknown>)["total_co2e"] === "number") {
          total = (obj["data"] as Record<string, unknown>)["total_co2e"] as number;
        }
      }
      setSavedTotal(total);
      setModalOpen(true);
    } catch (e) {
      setSubmitError(String(e ?? "Gagal menyimpan"));
    } finally {
      setSubmitting(false);
    }
  };


  return (<>
    <ScrollContainer headerTitle="Edit Laporan Makanan" leftContainer={
      <button onClick={() => router.push("/app/catat/laporan/konsumsi-makanan")} aria-label="Kembali" className="h-9 w-9 grid place-items-center">
        <Image src="/arrow-left.svg" alt="" width={18} height={18} />
      </button>
    }>
      <div className="px-4 pb-24">
        <div className="rounded-2xl p-4 space-y-4 bg-white">
          {!reportId && <div className="text-sm text-red-700">ID laporan tidak ditemukan.</div>}
          {reportId && !reportLoaded && <div className="text-sm text-gray-500">Memuat laporan…</div>}
          {reportId && reportLoaded && (
            <>
              <TextField id="date" label="Tanggal Laporan" type="date" value={reportDate} disabled />

              <div>
                <div className="mb-2 text-sm text-black">Periode Laporan</div>
                <div className="grid grid-cols-2 gap-3">
                  <Button type="button" disabled={true} {...(reportPeriod === "weekly" ? {} : { variant: "outline" })}>Mingguan</Button>
                  <Button type="button" disabled={true} {...(reportPeriod === "monthly" ? {} : { variant: "outline" })}>Bulanan</Button>
                </div>
              </div>

              <div className="space-y-3">
                {loadingFoods && <div className="text-sm text-gray-500">Memuat daftar makanan…</div>}
                {!loadingFoods && loadError && (
                  <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{loadError}</div>
                )}
                {!loadingFoods && !loadError && foods.map((f) => {
                  const isChecked = Boolean(checked[f.id]);
                  const selectedFreq = freq[f.id];
                  const icon = pickIcon(f.name);
                  return (
                    <div key={f.id} className={`rounded-2xl border p-3 ${isChecked ? 'border-emerald-500 bg-emerald-50/30' : 'border-gray-200 bg-white'}`}>
                      <div className="flex items-center gap-3">
                        <label className="inline-flex items-center">
                          <input type="checkbox" checked={isChecked} onChange={() => handleToggle(f.id)} className="sr-only peer" />
                          <span className="grid h-5 w-5 place-items-center rounded border border-gray-300 bg-white peer-checked:bg-emerald-500 peer-checked:border-emerald-500" />
                        </label>
                        <div className="grid place-items-center h-10 w-10 rounded-full bg-gray-50 shrink-0">
                          <Image src={icon} alt={f.name} width={26} height={26} />
                        </div>
                        <div className="flex-1 font-medium text-left">{f.name}</div>
                      </div>
                      <div className={`mt-3 ${!isChecked ? 'opacity-50 pointer-events-none' : ''}`}>
                        {([
                          { value: '1-3', label: '1–3 kali seminggu' },
                          { value: '4-5', label: '4–5 kali seminggu' },
                          { value: '6-7', label: 'Setiap Hari' },
                        ] as const).map((opt) => (
                          <label key={opt.value} className={`flex items-center gap-3 rounded-xl border px-3 py-3 ${selectedFreq === opt.value ? 'border-emerald-500 bg-white' : 'border-gray-200 bg-gray-50'}`}>
                            <input type="radio" name={`freq-${f.id}`} value={opt.value} checked={selectedFreq === opt.value} onChange={() => setFreq((s) => ({ ...s, [f.id]: opt.value }))} className="peer sr-only" />
                            <span className="relative h-5 w-5 rounded-full border border-gray-300 bg-white peer-checked:border-emerald-500 after:absolute after:inset-1.5 after:rounded-full after:bg-emerald-500 after:opacity-0 peer-checked:after:opacity-100 after:transition-opacity" />
                            <span className="text-sm">{opt.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>

              {submitError && <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{String(submitError)}</div>}

              <div className="grid grid-cols-2 gap-3">
                <Button type="button" variant="outline" onClick={() => router.back()}>Batal</Button>
                <Button type="button" onClick={handleSave} disabled={!canSave || submitting}>{submitting ? 'Menyimpan…' : 'Simpan Perubahan'}</Button>
              </div>
            </>
          )}
        </div>
      </div>
    </ScrollContainer>

    <ReportSavedModal
      open={modalOpen}
      onClose={() => setModalOpen(false)}
      reportKind="Konsumsi Makanan"
      // total={savedTotal}
      // unit="kg CO₂e"
      total={formatCarbonFootprint(savedTotal).value}
      unit={formatCarbonFootprint(savedTotal).unit}
      redirectTo="/app/catat/laporan/konsumsi-makanan"
    />
  </>);
}
