"use client";

import { ReportHistoryList } from "@/components/shared/riwayat/ReportHistoryList";
import type { MonthReport, CategoryStat } from "@/components/shared/riwayat/types";
import ScrollContainer from "@/components/nav/ScrollContainer";
import { useRouter } from "next/navigation";
import Image from "next/image";
import useAuth from "@/hooks/useAuth";
import { fetchWithAuth } from "@/lib/api/client";
import { useEffect, useState } from "react";

type UserType = "individu" | "lembaga";

const SLUGS = {
  transport: "/app/catat/laporan/transportasi",
  electricity: "/app/catat/laporan/energi-listrik",
  food: "/app/catat/laporan/konsumsi-makanan",
  waste: "/app/catat/laporan/produksi-sampah",
} as const;

// Skeleton kecil buat transisi
function HistorySkeleton() {
  return (
    <div className="px-4 pb-4">
      <div className="mb-4 h-6 w-40 animate-pulse rounded-md bg-gray-200" />
      <div className="space-y-3">
        {[0,1,2].map((i) => (
          <div key={i} className="rounded-2xl border border-gray-200 p-4">
            <div className="mb-3 h-4 w-28 animate-pulse rounded bg-gray-200" />
            <div className="h-6 w-48 animate-pulse rounded bg-gray-200" />
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="h-10 w-full animate-pulse rounded-xl bg-gray-100" />
              <div className="h-10 w-full animate-pulse rounded-xl bg-gray-100" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Page() {
  const router = useRouter();
  const { getIdToken } = useAuth();

  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState<MonthReport[] | null>(null);
  const [detectedUserType, setDetectedUserType] = useState<UserType | null>(null);

  useEffect(() => {
    let mounted = true;

    async function loadHistory() {
      setLoading(true);
      try {
        const firebaseToken = await getIdToken();
        if (!firebaseToken) {
          if (mounted) {
            setDetectedUserType("individu"); // fallback aman
            setReports([]);
          }
          return;
        }

        const res = await fetchWithAuth(`/me/reports/carbon-footprint/history`, firebaseToken);
        const list = Array.isArray(res) ? (res as unknown[]) : ((res || []) as unknown[]);

        // 1) Tentukan userType dulu (supaya tidak flicker)
        let userType: UserType | null = null;
        if (res && typeof res === "object" && !Array.isArray(res) && (res as Record<string, unknown>)["user_type"]) {
          const ut = String(((res as Record<string, unknown>)["user_type"]) || "").toLowerCase();
          userType = (ut.includes("lemb") || ut.includes("org") || ut.includes("institution")) ? "lembaga" : "individu";
        }
        if (!userType) {
          // fallback infer dari record pertama (kalau ada)
          const first = (list[0] ?? {}) as Record<string, unknown>;
          const keys = Object.keys(first).map((k) => k.toLowerCase());
          userType = (keys.includes("organization") || keys.includes("organization_name") || keys.includes("org_id") || keys.includes("lembaga"))
            ? "lembaga"
            : "individu";
        }

        // 2) Setelah userType pasti, baru mapping MonthReport
        const mapped: MonthReport[] = list.map((it, idx) => {
          const rec = (it ?? {}) as Record<string, unknown>;
          const monthLabel = typeof rec.report_month === "string" ? rec.report_month : `Bulan ${idx + 1}`;
          const total = Number(rec.total_kgco2e as unknown) || 0;

          const comparison = (rec.comparison ?? {}) as Record<string, unknown>;
          const diffKg = Number(comparison.difference_kgco2e as unknown) || 0;
          const diffPercent = typeof comparison.difference_percent === "number" ? comparison.difference_percent : null;
          const status =
            typeof comparison.status === "string"
              ? (comparison.status as "increase" | "decrease" | "equal")
              : null;

          const detail = (rec.detail ?? {}) as Record<string, unknown>;
          const elec = Number(detail.electricity_kgco2e as unknown) || 0;
          const trans = Number(detail.transportation_kgco2e as unknown) || 0;
          const waste = Number(detail.waste_kgco2e as unknown) || 0;
          const food = Number(detail.food_kgco2e as unknown) || 0;

          const categories: CategoryStat[] = [
            { id: "trans", name: "Transportasi", valueKg: trans, accent: "blue",   iconSrc: "/images/catat/transport.png", href: SLUGS.transport },
            { id: "elec",  name: "Energi Listrik", valueKg: elec, accent: "orange", iconSrc: "/images/catat/energy.png",    href: SLUGS.electricity },
            { id: "waste", name: "Produksi Sampah", valueKg: waste, accent: "red",  iconSrc: "/images/catat/plastic.png",   href: SLUGS.waste },
          ];

          if (userType === "lembaga") {
            categories.push({
              id: "food",
              name: "Konsumsi Makanan",
              valueKg: food,
              accent: "green",
              iconSrc: "/images/catat/food.png",
              href: SLUGS.food,
            });
          }

          return {
            id: String(rec.report_month ?? `month-${idx}`),
            monthLabel,
            periodLabel: "Laporan Bulanan",
            progressPercent: diffPercent ? Math.round(Math.abs(diffPercent)) : 0,
            comparisonStatus: status,
            totalEmisiKg: total,
            penguranganKg: status === "decrease" ? Math.abs(diffKg) : 0,
            categories,
          };
        });

        if (mounted) {
          setDetectedUserType(userType);
          setReports(mapped);
        }
      } catch (err) {
        console.error("Failed to load carbon footprint history", err);
        if (mounted) {
          setDetectedUserType("individu"); // fallback
          setReports([]);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadHistory();
    return () => { mounted = false; };
  }, [getIdToken]);

  return (
    <ScrollContainer
      headerTitle="Riwayat"
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
      {/* Selama loading → tampilkan skeleton aja, jangan render konten asli */}
      {loading ? (
        <HistorySkeleton />
      ) : (
        <div className="px-4 pb-4">
          {/* Badge tipe user: hanya tampil setelah loading selesai */}
          {detectedUserType === "lembaga" && (
            <div className="mb-4 flex items-center gap-3">
              <div className="text-sm text-gray-600">Tipe pengguna:</div>
              <div className="rounded-md bg-gray-100 px-3 py-1 text-sm font-medium">Lembaga</div>
            </div>
          )}

          {/* Render list setelah siap */}
          <ReportHistoryList reports={reports ?? []} />
        </div>
      )}
    </ScrollContainer>
  );
}
