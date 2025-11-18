"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import Button from "@/components/ui/Button";
import TextField from "@/components/ui/TextField";
import ScrollContainer from "@/components/nav/ScrollContainer";
import useAuth from "@/hooks/useAuth";
import ReportSavedModal from "@/components/ui/ReportSavedModal";
import { listFoodTypes, updateFoodReport, type FoodType, type FrequencyKey } from "@/services/food";
import { fetchWithAuth } from "@/lib/api/client";
import { formatCarbonFootprint } from "@/utils/carbonAnalysis";

type Period = "weekly" | "monthly";
type Freq = "1-3" | "4-5" | "6-7";
// Use the shared FrequencyKey from services/food so our API payload types align
type ApiFreq = FrequencyKey;

const toApiFreq = (f: Freq): ApiFreq => {
  if (f === "1-3") return "1-3-weekly" as ApiFreq;
  if (f === "4-5") return "4-5-weekly" as ApiFreq;
  return "6-7-weekly" as ApiFreq;
};

const freqToNumber = (f: Freq) => (f === "1-3" ? 2 : f === "4-5" ? 4 : 7);

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
  const searchParams = useSearchParams();

  // ✅ Ambil dari query params
  const reportDate = searchParams.get("report_date") || "";
  const reportType = searchParams.get("report_type") || "monthly";

  const { getIdToken, loading: authLoading } = useAuth();

  const [token, setToken] = useState<string | null>(null);

  const [foods, setFoods] = useState<FoodType[]>([]);
  const [loadingFoods, setLoadingFoods] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [reportLoaded, setReportLoaded] = useState(false);
  const [reportPeriod, setReportPeriod] = useState<Period>(reportType === "weekly" ? "weekly" : "monthly");
  const [reportId, setReportId] = useState<string | null>(null);
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
        const { authService } = await import("@/services/auth");
        let backendToken = authService.getToken();
        if (!backendToken) {
          backendToken = token;
          try {
            const exchanged = await authService.loginWithGoogle(token);
            backendToken = exchanged;
            try { authService.saveToken(exchanged); } catch { }
          } catch { }
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

  // ✅ Load report by date using authService (not fetchWithAuth)
  useEffect(() => {
    if (!reportDate) return;
    if (!token) return;
    let cancelled = false;
    (async () => {
      try {
        const { authService } = await import("@/services/auth");

        // Ensure backend token
        let backendToken = authService.getToken();
        if (!backendToken) {
          const idToken = await getIdToken();
          if (idToken) {
            try {
              backendToken = await authService.loginWithGoogle(idToken);
              try { authService.saveToken(backendToken); } catch { }
            } catch {
              backendToken = null;
            }
          }
        }
        if (!backendToken) throw new Error("Autentikasi backend tidak tersedia");

        // Use shared fetch helper to keep base URL, token handling and CORS consistent
        // NOTE: backend expects `report-date` (hyphen) and no extra slash before `?` to avoid 301 redirect
        const payload = await fetchWithAuth(`/me/reports/food/by-date?report_date=${encodeURIComponent(reportDate)}`, backendToken).catch(() => null);
        if (!payload || typeof payload !== "object") {
          if (!cancelled) setReportLoaded(true);
          return;
        }

        // Backend wraps in { meta, data } - extract data
        const respObj = payload as Record<string, unknown> | null;
        const body = respObj && Object.prototype.hasOwnProperty.call(respObj, "data") ? (respObj["data"] as Record<string, unknown>) : respObj;

        // Some backends include a canonical report_id; capture it when present.
        if (body && typeof body === "object" && typeof (body as Record<string, unknown>)["report_id"] === "string") {
          if (!cancelled) setReportId((body as Record<string, unknown>)["report_id"] as string);
        } else {
          // try to find report_id from listing if backend doesn't return it in by-date response
          try {
            const { listFoodReports } = await import("@/services/food");
            const list = await listFoodReports(backendToken);
            if (Array.isArray(list)) {
              const found = list.find((rr) => (rr as Record<string, unknown>)["report_date"] === reportDate);
              if (found && !cancelled) {
                const maybeId = (found as Record<string, unknown>)["report_id"];
                if (typeof maybeId === "string") setReportId(maybeId);
              }
            }
          } catch (e) {
            // non-fatal; we'll surface an error on save if update by-id is required
            console.debug("Could not determine report_id from list", e);
          }
        }

        // If body is empty/null, nothing else to map
        if (!body) {
          if (!cancelled) setReportLoaded(true);
          return;
        }

        // The backend may return `data` as an object or as an array with one item.
        // Normalize to a single report object.
        const reportObj = Array.isArray(body) && body.length > 0 ? (body[0] as Record<string, unknown>) : (body as Record<string, unknown>);

        // If report has canonical id, capture it
        if (typeof reportObj["report_id"] === "string" && !cancelled) setReportId(reportObj["report_id"] as string);

        // items array: [{ id, food_type_id, frequency|frequency_per_week, total_co2e }, ...]
        const itemsRaw = Array.isArray(reportObj.items) ? (reportObj.items as ReportItemRaw[]) : [];

        // Map to checked/freq by food_type_id
        const initialChecked: Partial<Record<string, boolean>> = {};
        const initialFreq: Partial<Record<string, Freq>> = {};
        let calcTotal = 0;

        type ReportItemRaw = {
          food_type_id?: string | null;
          frequency_per_week?: number | string | null;
          frequency?: number | string | null;
          total_co2e?: number | string | null;
          [k: string]: unknown;
        };

        itemsRaw.forEach((it: ReportItemRaw) => {
          const foodTypeId = typeof it.food_type_id === "string" ? it.food_type_id : undefined;
          const freqNum = typeof it.frequency_per_week === "number"
            ? it.frequency_per_week
            : typeof it.frequency === "number"
              ? it.frequency
              : Number(it.frequency_per_week ?? it.frequency ?? 0) || 0;
          const itemCo2 = typeof it.total_co2e === "number" ? it.total_co2e : Number(it.total_co2e ?? 0) || 0;

          if (foodTypeId) {
            initialChecked[foodTypeId] = true;
            if (freqNum >= 6) initialFreq[foodTypeId] = "6-7";
            else if (freqNum >= 4) initialFreq[foodTypeId] = "4-5";
            else initialFreq[foodTypeId] = "1-3";
          }

          calcTotal += itemCo2;
        });

        const serverType = typeof reportObj.report_type === "string" ? (reportObj.report_type as string) : "monthly";

        if (!cancelled) {
          setChecked(initialChecked);
          setFreq(initialFreq);
          setSavedTotal(Number(calcTotal.toFixed(6)));
          setReportPeriod(serverType === "weekly" ? "weekly" : "monthly");
          setReportLoaded(true);
          console.log("[Edit] ✅ Report loaded, total:", calcTotal);
        }
      } catch (e) {
        console.error("[Edit] Failed to load report by-date:", e);
        if (!cancelled) {
          setLoadError(String(e ?? "Gagal memuat laporan"));
          setReportLoaded(true);
        }
      }
    })();
    return () => { cancelled = true; };
  }, [reportDate, token, getIdToken]);

  const selectedCount = useMemo(() => Object.values(checked).filter(Boolean).length, [checked]);
  const allFreqChosen = useMemo(() => foods.every((f) => !checked[f.id] || Boolean(freq[f.id])), [foods, checked, freq]);
  const canSave = Boolean(reportDate) && selectedCount > 0 && allFreqChosen && Boolean(token);

  const handleToggle = (id: string) => {
    setChecked((s) => {
      const next = !s[id];
      if (!next) setFreq((f) => ({ ...f, [id]: undefined }));
      return { ...s, [id]: next };
    });
  };

  const handleSave = async () => {
    if (!canSave || !token || !reportDate) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const items = foods
        .filter((f) => Boolean(checked[f.id]))
        .map((f) => {
          const chosen = (freq[f.id] as Freq) || "1-3";
          return {
            food_type_id: f.id,
            frequency_key: toApiFreq(chosen),
            frequency_per_week: freqToNumber(chosen),
          };
        });

      const { authService } = await import("@/services/auth");
      let backendToken = authService.getToken();
      if (!backendToken) {
        if (!token) throw new Error("Autentikasi hilang");
        backendToken = await authService.loginWithGoogle(token);
        try { authService.saveToken(backendToken); } catch { }
      }

      // Use report_date as identifier for update (backend expects date-based PUT)
      const idForUpdate = reportDate;

      const resp = (await updateFoodReport(idForUpdate, {
        report_date: reportDate,
        report_type: reportPeriod,
        items
      }, backendToken)) as unknown;

      // try set total from response if backend returns it
      console.debug("[Edit] updateFoodReport response:", resp);
      const coerceNumber = (v: unknown): number | null => {
        if (typeof v === "number") return v;
        if (typeof v === "string") {
          const n = Number(v);
          return Number.isFinite(n) ? n : null;
        }
        return null;
      };

      let total: number | null = null;
      if (resp && typeof resp === "object") {
        const obj = resp as Record<string, unknown>;
        total = coerceNumber(obj["total_co2e"]) ?? coerceNumber((obj["data"] as Record<string, unknown>)?.["total_co2e"]);
      }

      // fallback: fetch by-date same pattern as waste page (explicit fetch + res.ok)
      if (total === null) {
        try {
          const base = (process.env.NEXT_PUBLIC_API_BASE_URL || "").replace(/\/$/, "") || "https://cahayamu.id/api/v1";
          const url = `${base}/me/reports/food/by-date?report_date=${encodeURIComponent(reportDate)}`;
          const res = await fetch(url, { method: "GET", headers: { "Authorization": `Bearer ${backendToken}`, "Content-Type": "application/json" }, cache: "no-store" });
          if (res.ok) {
            const payload = await res.json().catch(() => null);
            console.debug("[Edit] fallback by-date payload:", payload);
            total = extractTotalFromByDateResponse(payload);
          }
        } catch (err) {
          console.debug("fallback by-date fetch failed:", err);
        }
      }

      setSavedTotal(total !== null ? total : 0);
      setModalOpen(true);
    } catch (e) {
      setSubmitError(String(e ?? "Gagal menyimpan"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <ScrollContainer headerTitle="Edit Laporan Makanan" leftContainer={
        <button onClick={() => router.push("/app/catat/laporan/konsumsi-makanan")} aria-label="Kembali" className="h-9 w-9 grid place-items-center">
          <Image src="/arrow-left.svg" alt="" width={18} height={18} />
        </button>
      }>
        <div className="px-4 pb-24">
          <div className="rounded-2xl p-4 space-y-4 bg-white">
            {!reportDate && <div className="text-sm text-red-700">Tanggal laporan tidak ditemukan.</div>}
            {reportDate && !reportLoaded && <div className="text-sm text-gray-500">Memuat laporan…</div>}
            {reportDate && reportLoaded && (
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
    </>
  );
}

function extractTotalFromByDateResponse(resp: unknown): number | null {
  if (!resp || typeof resp !== "object") return null;
  const obj = resp as Record<string, unknown>;
  const body = Object.prototype.hasOwnProperty.call(obj, "data") ? obj["data"] : obj;
  const report = Array.isArray(body) ? (body as unknown[])[0] : (body as Record<string, unknown>);
  if (!report || typeof report !== "object") return null;

  const coerce = (v: unknown): number | null => {
    if (typeof v === "number") return v;
    if (typeof v === "string") {
      const n = Number(v);
      return Number.isFinite(n) ? n : null;
    }
    return null;
  };

  const maybe = (report as Record<string, unknown>)["total_co2e"];
  const fromTop = coerce(maybe);
  if (fromTop !== null) return fromTop;

  // If no top-level total, try to sum per-item totals
  const items = Array.isArray((report as Record<string, unknown>)["items"]) ? ((report as Record<string, unknown>)["items"] as unknown[]) : [];
  let sum = 0;
  let foundAny = false;
  for (const it of items) {
    if (!it || typeof it !== "object") continue;
    const val = (it as Record<string, unknown>)["total_co2e"];
    const n = coerce(val);
    if (n !== null) {
      sum += n;
      foundAny = true;
    }
  }
  if (foundAny) return Number(Number(sum).toFixed(6));
  return null;
}