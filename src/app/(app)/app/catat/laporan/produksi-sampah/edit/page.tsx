"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import ScrollContainer from "@/components/nav/ScrollContainer";
import WasteFormSection from "@/components/shared/catat/waste/WasteFormSection";
import useAuth from "@/hooks/useAuth";
import ReportSavedModal from "@/components/ui/ReportSavedModal";
import { wasteService } from "@/services/waste";
import { toast } from "sonner";
import { userFriendlyError } from "@/lib/userError";
import type { WasteCategoryDef } from "@/components/shared/catat/waste/types";
import { formatCarbonFootprint } from "@/utils/carbonAnalysis";

const BASE_CATEGORIES: WasteCategoryDef[] = [
  { id: "plastik", label: "Plastik", hint: "Botol, kantong, kemasan" },
  { id: "kertas", label: "Kertas & Karton", hint: "Kertas tulis, kardus" },
  { id: "logam", label: "Logam", hint: "Kaleng aluminium, besi" },
  { id: "kaca", label: "Kaca", hint: "Botol/pecahan kaca" },
  { id: "organik", label: "Organik", hint: "Sisa makanan, daun" },
  { id: "ewaste", label: "Elektronik (E-waste)", hint: "Baterai, lampu, perangkat" },
  { id: "b3", label: "Limbah Berbahaya (B3)", hint: "Obat, cat, minyak" },
];

export default function EditWasteByDatePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const reportDate = searchParams.get("report_date") || "";
  const reportType = searchParams.get("report_type") || "monthly";
  const { getIdToken } = useAuth();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<WasteCategoryDef[]>(BASE_CATEGORIES);
  const [initialQtyMap, setInitialQtyMap] = useState<Record<string, string> | undefined>(undefined);
  const [reportId, setReportId] = useState<string | null>(null);

  // success modal
  const [modalOpen, setModalOpen] = useState(false);
  const [savedTotal, setSavedTotal] = useState<number>(0);

  useEffect(() => {
    let mounted = true;
    async function load() {
      if (!reportDate) return;
      setLoading(true);
      setError(null);
      try {
        // ensure backend token (prefer authService stored token)
        const { authService } = await import("@/services/auth");
        let token = authService.getToken();
        if (!token) {
          const idToken = await getIdToken();
          if (!idToken) throw new Error("Autentikasi hilang");
          token = await authService.loginWithGoogle(idToken);
          try { authService.saveToken(token); } catch { }
        }
        if (!token) throw new Error("Autentikasi hilang");

        // load master waste-types
        const masters = await wasteService.listWasteTypes(token);

        // enrich base categories with wasteTypeId where possible
        const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
        const idByName = new Map<string, string>();
        masters.forEach((t) => idByName.set(norm(t.name), t.id));

        const enriched = BASE_CATEGORIES.map((c) => {
          const candidates = [c.label, c.label.replace("&", "dan"), c.label.replace(/\s*\(.*?\)\s*/g, "")];
          let found: string | undefined;
          for (const nm of candidates) {
            const id = idByName.get(norm(nm));
            if (id) { found = id; break; }
          }
          if (!found && c.id === "ewaste") {
            found = idByName.get(norm("Elektronik")) || idByName.get(norm("E-waste"));
          }
          if (!found && c.id === "b3") {
            found = idByName.get(norm("Limbah Berbahaya")) || idByName.get(norm("B3"));
          }
          return { ...c, wasteTypeId: found };
        });

        // fetch report by-date using backend token (same pattern as food edit)
        const base = (process.env.NEXT_PUBLIC_API_BASE_URL || "").replace(/\/$/, "") || "https://cahayamu.id/api/v1";
        const url = `${base}/me/reports/waste/by-date?report_date=${encodeURIComponent(reportDate)}`;
        const res = await fetch(url, { method: "GET", headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" }, cache: "no-store" });
        if (!res.ok) {
          const txt = await res.text().catch(() => res.statusText);
          throw new Error(`HTTP ${res.status} - ${txt}`);
        }
        const payload = await res.json().catch(() => null);
        const body = (payload && (payload.data ?? payload)) ?? null;

        // API may wrap data as array -> take first item
        const reportObj = Array.isArray(body) ? (body[0] ?? null) : body;

        // try capture backend report_id if present; if not, attempt to find it from listWasteReports
        if (reportObj && typeof reportObj["report_id"] === "string") {
          if (mounted) setReportId(reportObj["report_id"] as string);
        } else {
          try {
            const list = await wasteService.listWasteReports(token);
            const found = (list ?? []).find((r) => r.report_date === reportDate);
            if (found && mounted) setReportId(found.report_id);
          } catch (err) {
            // non-fatal: we'll fall back to not having reportId and Surface a helpful error on save
            console.debug("Could not lookup report_id by date", err);
          }
        }

        const qtyMap: Record<string, string> = {};
        if (reportObj && Array.isArray(reportObj.items)) {
          reportObj.items.forEach((itRaw: unknown) => {
            const it = (itRaw ?? {}) as Record<string, unknown>;
            // try match by waste_type_id first, then by name
            const wtId = typeof it["waste_type_id"] === "string" ? (it["waste_type_id"] as string) : undefined;
            const wtName = typeof it["waste_type"] === "string" ? (it["waste_type"] as string) : undefined;
            let foundCat = undefined as (typeof enriched)[number] | undefined;
            if (wtId) foundCat = enriched.find((e) => e.wasteTypeId === wtId);
            if (!foundCat && wtName) {
              const n = norm(wtName);
              foundCat = enriched.find((e) => norm(e.label) === n || norm(e.label).includes(n));
            }
            if (foundCat) {
              const weightVal = typeof it["weight_kg"] === "number"
                ? it["weight_kg"] as number
                : typeof it["total_weight_kg"] === "number"
                  ? it["total_weight_kg"] as number
                  : typeof it["weight_kg"] === "string"
                    ? Number(it["weight_kg"]) : undefined;
              qtyMap[foundCat.id] = weightVal !== undefined ? String(weightVal) : String("");
            }
          });
        }

        if (mounted) {
          setCategories(enriched);
          setInitialQtyMap(Object.keys(qtyMap).length ? qtyMap : undefined);
        }
      } catch (e) {
        console.error("Failed to load waste report by-date", e);
        if (mounted) setError(userFriendlyError(e, "Gagal memuat laporan sampah. Silakan coba lagi."));
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => { mounted = false; };
  }, [reportDate, getIdToken]);

  const handleSubmit = async (payload: { report_date: string; period: "weekly" | "monthly"; items: Array<{ category_id: string; quantity: string | number }> }) => {
    setError(null);
    try {
      const { authService } = await import("@/services/auth");
      let token = authService.getToken();
      if (!token) {
        const idToken = await getIdToken();
        if (!idToken) throw new Error("Autentikasi hilang");
        token = await authService.loginWithGoogle(idToken);
        try { authService.saveToken(token); } catch { }
      }
      if (!token) throw new Error("Autentikasi hilang");

      const itemsForApi = payload.items
        .map((it) => {
          const cat = categories.find((c) => c.id === it.category_id);
          if (!cat?.wasteTypeId) return null;
          return { waste_type_id: cat.wasteTypeId, total_weight_kg: Number(it.quantity) };
        })
        .filter((x): x is { waste_type_id: string; total_weight_kg: number } => x !== null);

      const apiPayload = { report_date: payload.report_date, report_type: payload.period, items: itemsForApi };

      // Prefer updating by backend report_id (UUID) when available.
      // Fall back to using report_date as identifier if report_id is not available.
      const idForUpdate = reportId ?? reportDate;
      const resp = await wasteService.updateReport(idForUpdate, apiPayload, token as string);

      let total: number | null = null;
      if (resp && typeof resp === "object") {
        const obj = resp as Record<string, unknown>;
        if (typeof obj["total_co2e"] === "number") total = obj["total_co2e"] as number;
        else if (obj["data"] && typeof (obj["data"] as Record<string, unknown>)["total_co2e"] === "number") {
          total = (obj["data"] as Record<string, unknown>)["total_co2e"] as number;
        }
      }

      setSavedTotal(total ?? 0);
      setModalOpen(true);
    } catch (e) {
      console.error("Failed to update waste report by-date", e);
      const friendly = userFriendlyError(e, "Gagal menyimpan laporan sampah. Silakan coba lagi.");
      setError(friendly);
      try { toast.error(friendly); } catch { }
    }
  };

  return (
    <ScrollContainer
      headerTitle="Edit Laporan Produksi Sampah"
      leftContainer={
        <button onClick={() => router.push("/app/catat/laporan/produksi-sampah")} aria-label="Kembali" className="h-9 w-9 grid place-items-center">
          <Image src="/arrow-left.svg" alt="" width={18} height={18} />
        </button>
      }
    >
      <div className="px-4 pb-24">
        {!reportDate ? (
          <div className="p-4 text-sm text-red-700">Tanggal laporan tidak ditemukan.</div>
        ) : loading ? (
          <p>Memuat…</p>
        ) : (
          <div className="space-y-4">
            {error ? <div className="rounded-md bg-red-50 border border-red-200 p-3 text-red-700">{error}</div> : null}

            <WasteFormSection
              categories={categories}
              initialDate={reportDate}
              initialPeriod={reportType === "weekly" ? "weekly" : "monthly"}
              initialQtyMap={initialQtyMap}
              disableDatePeriod={true}
              onSubmit={handleSubmit}
            />
          </div>
        )}
      </div>

      <ReportSavedModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          router.push("/app/catat/laporan/produksi-sampah");
        }}
        reportKind="Produksi Sampah"
        // total={savedTotal}
        // unit="kg CO₂e"
        total={formatCarbonFootprint(savedTotal).value}
        unit={formatCarbonFootprint(savedTotal).unit}
        redirectTo="/app/catat/laporan/produksi-sampah"
      />
    </ScrollContainer>
  );
}
