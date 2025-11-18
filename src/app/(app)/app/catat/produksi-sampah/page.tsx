"use client";

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import useAuth from "@/hooks/useAuth";
import { userFriendlyError } from "@/lib/userError";


import WasteFormSection from "@/components/shared/catat/waste/WasteFormSection";
import ReportSavedModal from "@/components/ui/ReportSavedModal";
import type { WasteCategoryDef, WasteReportPayload } from "@/components/shared/catat/waste/types";
import { wasteService, type WasteReportRequest, type WasteType } from "@/services/waste";
import { formatCarbonFootprint } from "@/utils/carbonAnalysis";

export default function Page() {
  const router = useRouter();
  const { getIdToken } = useAuth();

  const [categories, setCategories] = useState<WasteCategoryDef[]>([
    { id: "plastik", label: "Plastik", hint: "Botol, kantong, kemasan" },
    { id: "kertas", label: "Kertas & Karton", hint: "Kertas tulis, kardus" },
    { id: "logam", label: "Logam", hint: "Kaleng aluminium, besi" },
    { id: "kaca", label: "Kaca", hint: "Botol/pecahan kaca" },
    { id: "organik", label: "Organik", hint: "Sisa makanan, daun" },
    { id: "ewaste", label: "Elektronik (E-waste)", hint: "Baterai, lampu, perangkat" },
    { id: "b3", label: "Limbah Berbahaya (B3)", hint: "Obat, cat, minyak" },
  ]);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [savedTotal, setSavedTotal] = useState<number>(0);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Fetch mapping waste types
  useEffect(() => {
    (async () => {
      try {
        const token = await getIdToken();
        if (!token) return;
        const list: WasteType[] = await wasteService.listWasteTypes(token);

        const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
        const idByName = new Map<string, string>();
        list.forEach((t) => idByName.set(norm(t.name), t.id));

        setCategories((prev) =>
          prev.map((c) => {
            const candidates = [
              c.label,
              c.label.replace("&", "dan"),
              c.label.replace(/\s*\(.*?\)\s*/g, ""),
            ];
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
          })
        );
      } catch (e) {
        console.error("❌ Gagal memuat waste-types:", e);
        try { setLoadError(userFriendlyError(e, "Gagal memuat tipe sampah. Silakan coba lagi.")); } catch { setLoadError("Gagal memuat tipe sampah."); }
      }
    })();
  }, [getIdToken]);

  const idMap = useMemo(() => {
    const m = new Map<string, string>();
    categories.forEach((c) => { if (c.wasteTypeId) m.set(c.id, c.wasteTypeId); });
    return m;
  }, [categories]);

  const handleSubmit = async (payload: WasteReportPayload) => {
    try {
      const token = await getIdToken();
      if (!token) return;

      const req: WasteReportRequest = {
        report_date: payload.report_date,
        report_type: payload.period,
        items: payload.items
          .map((it) => {
            const uuid = idMap.get(it.category_id);
            return uuid ? { waste_type_id: uuid, total_weight_kg: it.quantity } : null;
          })
          .filter((x): x is NonNullable<typeof x> => x !== null),
      };

      if (req.items.length === 0) {
        console.warn("Tidak ada item valid untuk dikirim (UUID tidak ditemukan).");
        return;
      }

      const res = await wasteService.createReport(req, token);
      console.log("✅ Waste report created:", res);

      // Tampilkan modal + simpan total untuk ditampilkan
      setSavedTotal(res.total_co2e ?? null);
      setModalOpen(true);
      // Redirect dilakukan oleh modal saat ditutup (router.push('/app/catat'))
    } catch (err) {
      // Log error for diagnostics
      console.error("❌ Gagal membuat laporan sampah:", err);
      try { setSubmitError(userFriendlyError(err, "Gagal membuat laporan sampah. Silakan coba lagi.")); } catch { setSubmitError("Gagal membuat laporan sampah."); }
    }
  };

  return (
    <main className="mx-auto max-w-screen-sm px-4 pb-28">
      <header className="mb-3 flex items-center gap-2">
        <button onClick={() => router.back()} aria-label="Kembali" className="grid h-9 w-9 place-items-center">
          <Image src="/arrow-left.svg" alt="" width={18} height={18} />
        </button>
        <h1 className="flex-1 text-center text-lg font-semibold">Produksi Sampah</h1>
        <div className="h-9 w-9" />
      </header>

      <div className="mx-auto mt-3 h-0.5 w-full" style={{ backgroundColor: "var(--color-primary)" }} />

      <div className="py-4">
        {loadError ? (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{loadError}</div>
        ) : null}
        {submitError ? (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{submitError}</div>
        ) : null}
        <WasteFormSection categories={categories} onSubmit={handleSubmit} />
      </div>

      {/* Modal sukses */}
      <ReportSavedModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        reportKind="Produksi Sampah"
        // total={savedTotal}
        // unit="kg CO₂e"
        total={formatCarbonFootprint(savedTotal).value}
        unit={formatCarbonFootprint(savedTotal).unit}
        redirectTo="/app/catat"
      />
    </main>
  );
}
