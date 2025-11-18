"use client";

import { ReportHistoryList } from "@/components/shared/riwayat/ReportHistoryList";
import type {
  MonthReport,
  CategoryStat,
} from "@/components/shared/riwayat/types";
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
        {[0, 1, 2].map((i) => (
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
  const [detectedUserType, setDetectedUserType] =
    useState<UserType | null>(null);

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

        const res = await fetchWithAuth(
          `/me/reports/carbon-footprint/history`,
          firebaseToken
        );
        const list = Array.isArray(res)
          ? (res as unknown[])
          : ((res || []) as unknown[]);

        // 1) Preferensi: ambil profil user dari /user/me jika tersedia
        // Ini memastikan kita menggunakan `user_type` otoritatif dari backend
        let userType: UserType | null = null;
        try {
          const profile = await fetchWithAuth(`/user/me`, firebaseToken);
          if (
            profile &&
            typeof profile === "object" &&
            !Array.isArray(profile) &&
            (profile as Record<string, unknown>)["user_type"]
          ) {
            const ut = String(
              ((profile as Record<string, unknown>)["user_type"] || "")
            ).toLowerCase();
            userType =
              ut.includes("lemb") || ut.includes("org") || ut.includes("institution")
                ? "lembaga"
                : "individu";
          }
        } catch {
          // ignore profile fetch errors and fall back to inference below
          // console.debug("/user/me fetch failed, will infer user_type", e);
        }

        // Jika belum dapat dari profil, infer dari payload history (fallback)
        if (!userType) {
          const first = (list[0] ?? {}) as Record<string, unknown>;
          const keys = Object.keys(first).map((k) => k.toLowerCase());
          userType =
            keys.includes("organization") ||
            keys.includes("organization_name") ||
            keys.includes("org_id") ||
            keys.includes("lembaga")
              ? "lembaga"
              : "individu";
        }

        // 2) Setelah userType pasti, baru mapping MonthReport
        const mapped: MonthReport[] = list.map((it, idx) => {
          const rec = (it ?? {}) as Record<string, unknown>;
          const monthLabel =
            typeof rec.report_month === "string"
              ? rec.report_month
              : `Bulan ${idx + 1}`;
          // total may be provided by backend as `total_kgco2e` but some backends
          // only include per-category details. Prefer explicit total, otherwise
          // compute as sum of detail fields for display.
          const explicitTotal = Number(rec.total_kgco2e as unknown);

          const comparison = (rec.comparison ?? {}) as Record<string, unknown>;
          const diffKg = Number(comparison.difference_kgco2e as unknown) || 0;
          const diffPercent =
            typeof comparison.difference_percent === "number"
              ? comparison.difference_percent
              : null;
          const status =
            typeof comparison.status === "string"
              ? (comparison.status as "increase" | "decrease" | "equal")
              : null;

          const detail = (rec.detail ?? {}) as Record<string, unknown>;
          const elec = Number(detail.electricity_kgco2e as unknown) || 0;
          const trans = Number(detail.transportation_kgco2e as unknown) || 0;
          const waste = Number(detail.waste_kgco2e as unknown) || 0;
          const food = Number(detail.food_kgco2e as unknown) || 0;

          const total = Number.isFinite(explicitTotal) && explicitTotal > 0
            ? explicitTotal
            : elec + trans + waste + food;

          // --- PERBAIKAN LOGIKA KATEGORI DIMULAI DI SINI ---
          
          // Mulai dengan kategori yang umum untuk semua user
          // Derive a YYYY-MM prefillMonth if possible so laporan pages can
          // request by-month endpoints. Prefer per-category report dates.
          const monthIso = (() => {
            const maybeDate =
              typeof (rec.transportation_report_date as unknown) === "string"
                ? (rec.transportation_report_date as string)
                : typeof (rec.electricity_report_date as unknown) === "string"
                ? (rec.electricity_report_date as string)
                : typeof (rec.food_report_date as unknown) === "string"
                ? (rec.food_report_date as string)
                : undefined;
            if (maybeDate) return maybeDate.slice(0, 7);
            if (typeof rec.report_month === "string") {
              const parsed = new Date("1 " + rec.report_month);
              if (!Number.isNaN(parsed.getTime())) {
                const m = String(parsed.getMonth() + 1).padStart(2, "0");
                return `${parsed.getFullYear()}-${m}`;
              }
            }
            return null;
          })();

          const transReportId = typeof rec.transportation_report_id === "string" ? String(rec.transportation_report_id) : null;
          const elecReportId = typeof rec.electricity_report_id === "string" ? String(rec.electricity_report_id) : null;
          const foodReportDate = typeof rec.food_report_date === "string" ? String(rec.food_report_date) : null;

          const categories: CategoryStat[] = [
            {
              id: "trans",
              name: "Transportasi",
              valueKg: trans,
              accent: "blue",
              iconSrc: "/images/catat/transport.png",
              href: `${SLUGS.transport}?from=riwayat${monthIso ? `&prefillMonth=${monthIso}` : ""}${transReportId ? `&prefillReportId=${encodeURIComponent(transReportId)}` : ""}`,
            },
            {
              id: "elec",
              name: "Energi Listrik",
              valueKg: elec,
              accent: "orange",
              iconSrc: "/images/catat/energy.png",
              href: `${SLUGS.electricity}?from=riwayat${monthIso ? `&prefillMonth=${monthIso}` : ""}${elecReportId ? `&prefillReportId=${encodeURIComponent(elecReportId)}` : ""}`,
            },
          ];

          // Tambahkan kategori spesifik berdasarkan tipe user
          if (userType === "individu") {
            // INDIVIDU -> Makanan
            categories.push({
              id: "food",
              name: "Konsumsi Makanan",
              valueKg: food,
              accent: "green",
              iconSrc: "/images/catat/food.png",
              href: `${SLUGS.food}?from=riwayat${monthIso ? `&prefillMonth=${monthIso}` : ""}${foodReportDate ? `&prefillReportId=${encodeURIComponent(foodReportDate)}` : ""}`,
            });
          } else {
            // LEMBAGA -> Sampah
            categories.push({
              id: "waste",
              name: "Produksi Sampah",
              valueKg: waste,
              accent: "red",
              iconSrc: "/images/catat/plastic.png",
              href: `${SLUGS.waste}?from=riwayat${monthIso ? `&prefillMonth=${monthIso}` : ""}`,
            });
          }
          
          // --- AKHIR PERBAIKAN LOGIKA KATEGORI ---

          return {
            id: String(rec.report_month ?? `month-${idx}`),
            monthLabel,
            periodLabel: "Laporan Bulanan",
            progressPercent: diffPercent ? Math.round(Math.abs(diffPercent)) : 0,
            comparisonStatus: status,
            totalEmisiKg: total,
            penguranganKg: status === "decrease" ? Math.abs(diffKg) : 0,
            categories, // Gunakan categories yang sudah diperbaiki
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
    return () => {
      mounted = false;
    };
  }, [getIdToken]);

  return (
    <ScrollContainer
      headerTitle="Riwayat Laporan Bulanan"
      leftContainer={
        <button
          onClick={() => router.push("/app/catat/")}
          aria-label="Kembali"
          className="grid h-9 w-9 place-items-center"
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
          {/* Badge tipe user: hidden by design - do not render label/badge */}

          {/* Render list setelah siap */}
          <ReportHistoryList reports={reports ?? []} />
        </div>
      )}
    </ScrollContainer>
  );
}