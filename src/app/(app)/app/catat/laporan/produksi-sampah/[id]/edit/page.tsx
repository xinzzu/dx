"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import ScrollContainer from "@/components/nav/ScrollContainer";
import WasteFormSection from "@/components/shared/catat/waste/WasteFormSection";
import useAuth from "@/hooks/useAuth";
import { wasteService } from "@/services/waste";
import Image from "next/image";
import ReportSavedModal from "@/components/ui/ReportSavedModal";
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
export default function WasteReportEditPage() {
  const router = useRouter();
  const params = useParams();
  const reportId = params?.id as string | undefined;
  const { getIdToken } = useAuth();

  const [loading, setLoading] = useState(true);
  const [, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [savedTotal, setSavedTotal] = useState<number>(0);

  const [reportDate, setReportDate] = useState("");
  const [reportType, setReportType] = useState<"weekly" | "monthly">("weekly");

  const [categories, setCategories] =
    useState<WasteCategoryDef[]>(BASE_CATEGORIES);
  const [initialQtyMap, setInitialQtyMap] = useState<
    Record<string, string> | undefined
  >(undefined);

  useEffect(() => {
    let mounted = true;
    async function load() {
      if (!reportId) return;
      setLoading(true);
      try {
        // Prefer backend access token; exchange firebase token when needed
        const { authService } = await import("@/services/auth");
        let token = authService.getToken();
        if (!token) {
          const firebaseToken = await getIdToken();
          if (!firebaseToken) throw new Error("Autentikasi hilang");
          token = await authService.loginWithGoogle(firebaseToken);
          try {
            authService.saveToken(token);
          } catch { }
        }
        if (!token) throw new Error("Autentikasi hilang");

        const masters = await wasteService.listWasteTypes(token);

        const reports = await wasteService.listWasteReports(token);
        const rec = (reports ?? []).find((r) => r.report_id === reportId);
        if (!rec) throw new Error("Laporan tidak ditemukan");

        const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
        const idByName = new Map<string, string>();
        masters.forEach((t) => idByName.set(norm(t.name), t.id));

        const enriched = BASE_CATEGORIES.map((c) => {
          const candidates = [
            c.label,
            c.label.replace("&", "dan"),
            c.label.replace(/\s*\(.*?\)\s*/g, ""),
          ];
          let found: string | undefined;
          for (const nm of candidates) {
            const id = idByName.get(norm(nm));
            if (id) {
              found = id;
              break;
            }
          }
          if (!found && c.id === "ewaste") {
            found =
              idByName.get(norm("Elektronik")) || idByName.get(norm("E-waste"));
          }
          if (!found && c.id === "b3") {
            found =
              idByName.get(norm("Limbah Berbahaya")) ||
              idByName.get(norm("B3"));
          }
          return { ...c, wasteTypeId: found };
        });

        const qtyMap: Record<string, string> = {};
        (rec.waste_details || []).forEach((wd) => {
          const foundCat = enriched.find(
            (ec) =>
              norm(ec.label) === norm(wd.waste_type) ||
              norm(ec.label).includes(norm(wd.waste_type))
          );
          if (foundCat) qtyMap[foundCat.id] = String(wd.weight_kg ?? "");
        });

        if (mounted) {
          setReportDate(rec.report_date);
          setReportType(rec.report_type === "weekly" ? "weekly" : "monthly");
          setCategories(enriched);
          setInitialQtyMap(qtyMap);
        }
      } catch (e) {
        console.error(e);
        if (mounted) setError(e instanceof Error ? e.message : String(e));
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, [reportId, getIdToken]);

  if (!reportId)
    return <div className="p-4">Report ID tidak ditemukan di URL.</div>;

  return (
    <ScrollContainer
      headerTitle="Edit Laporan Sampah"
      leftContainer={
        <button
          onClick={() => router.push("/app/catat/laporan/produksi-sampah")}
          aria-label="Kembali"
          className="h-9 w-9 grid place-items-center"
        >
          <Image src="/arrow-left.svg" alt="" width={18} height={18} />
        </button>
      }>
      <div className="px-4 pb-24">
        {loading ? (
          <p>Memuat…</p>
        ) : (
          <div className="space-y-4">
            {error ? (
              <div className="rounded-md bg-red-50 border border-red-200 p-3 text-red-700">
                {error}
              </div>
            ) : null}

            <WasteFormSection
              categories={categories}
              initialDate={reportDate}
              initialPeriod={reportType}
              initialQtyMap={initialQtyMap}
              disableDatePeriod={true}
              onSubmit={async (payload) => {
                setSaving(true);
                setError(null);
                try {
                  // Prefer backend token for update call
                  const { authService } = await import("@/services/auth");
                  let token = authService.getToken();
                  if (!token) {
                    const firebaseToken = await getIdToken();
                    if (!firebaseToken) throw new Error("Autentikasi hilang");
                    token = await authService.loginWithGoogle(firebaseToken);
                    try {
                      authService.saveToken(token);
                    } catch { }
                  }
                  if (!token) throw new Error("Autentikasi hilang");

                  const itemsForApi = payload.items
                    .map((it) => {
                      const cat = categories.find(
                        (c) => c.id === it.category_id
                      );
                      if (!cat?.wasteTypeId) return null;
                      return {
                        waste_type_id: cat.wasteTypeId,
                        total_weight_kg: Number(it.quantity),
                      };
                    })
                    .filter(
                      (
                        x
                      ): x is {
                        waste_type_id: string;
                        total_weight_kg: number;
                      } => x !== null
                    );

                  const apiPayload = {
                    report_date: payload.report_date,
                    report_type: payload.period,
                    items: itemsForApi,
                  };

                  const respUnknown = (await wasteService.updateReport(reportId!, apiPayload, token)) as unknown;
                  let total: number | null = null;
                  if (respUnknown && typeof respUnknown === "object") {
                    const obj = respUnknown as Record<string, unknown>;
                    const t = obj["total_co2e"];
                    if (typeof t === "number") total = t;
                    else if (obj["data"] && typeof (obj["data"] as Record<string, unknown>)["total_co2e"] === "number") {
                      total = (obj["data"] as Record<string, unknown>)["total_co2e"] as number;
                    }
                  }
                  setSavedTotal(total ?? 0);
                  setModalOpen(true);
                } catch (e) {
                  console.error(e);
                  setError(e instanceof Error ? e.message : String(e));
                } finally {
                  setSaving(false);
                }
              }}
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
