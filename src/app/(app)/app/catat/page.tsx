"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import useAuth from "@/hooks/useAuth";

import CategoryItem from "@/components/shared/catat/CategoryItem";
import ReportRow from "@/components/shared/catat/ReportRow";
import EmptySavedBox from "@/components/shared/catat/EmptySavedBox";
import ResultCard from "@/components/shared/catat/ResultCard";
import { useCatatContext } from "./catat-context";
import ScrollContainer from "@/components/nav/ScrollContainer";

type SavedReport = {
  id: string; // transport|electricity|food|waste (atau unknown)
  title: string;
  amount: number;
  href: string;
};

type CatKey = "transport" | "electricity" | "food" | "waste";

const slugByKey: Record<CatKey, string> = {
  transport: "transportasi",
  electricity: "energi-listrik",
  food: "konsumsi-makanan",
  waste: "produksi-sampah",
};

// Bridge: id di CatatContext -> kunci internal
const contextIdToKey: Record<string, CatKey | undefined> = {
  transport: "transport",
  listrik: "electricity",
  makanan: "food",
  sampah: "waste",
};

const normalizeBackendId = (name: string): CatKey | null => {
  const n = (name || "").toLowerCase().trim();
  if (n.includes("transport")) return "transport";
  if (n.includes("listrik") || n.includes("electric")) return "electricity";
  if (n.includes("food") || n.includes("makan")) return "food";
  if (n.includes("sampah") || n.includes("limbah") || n.includes("waste")) return "waste";
  return null;
};

export default function CatatIndividuPage() {
  const router = useRouter();
  const { getIdToken } = useAuth();

  const [totalThisMonth, setTotalThisMonth] = useState(0);
  const [reports, setReports] = useState<SavedReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const basePath = "/app/catat";
  const { categories } = useCatatContext();

  const getBackendToken = useCallback(async (): Promise<string | null> => {
    const { authService } = await import("@/services/auth");
    let backendToken = authService.getToken();

    if (!backendToken) {
      const firebaseToken = await getIdToken();
      if (!firebaseToken) return null;

      backendToken = await authService.loginWithGoogle(firebaseToken);
      authService.saveToken(backendToken);
    }
    return backendToken;
  }, [getIdToken]);

  useEffect(() => {
    let mounted = true;

    async function fetchCarbonDataAndBreakdown() {
      setIsLoading(true);
      try {
        const token = await getBackendToken();
        if (!token) {
          console.warn("⚠️ No token available");
          if (mounted) setIsLoading(false);
          return;
        }

        const { reportsService } = await import("@/services/reports");
        const dashboardResp = await reportsService.getDashboard(token, "month").catch(() => null);
        const footprintResp = await reportsService.getCurrentCarbonFootprint(token).catch(() => null);

        if (dashboardResp?.breakdown_chart) {
          const backendCats = dashboardResp.breakdown_chart.categories || [];

          const mapped: SavedReport[] = backendCats
            .filter((bc) => (bc.value_kg_co2e ?? 0) > 0)
            .map((bc: { name?: string; value_kg_co2e?: number }) => {
              const totalEmission = Math.round((bc.value_kg_co2e ?? 0) * 10) / 10;
              const backendName = bc.name ?? "";
              const backendKey = normalizeBackendId(backendName);

              const categoryDetail =
                backendKey &&
                categories.find((c) => contextIdToKey[c.id] === backendKey);

              const displayTitle =
                categoryDetail?.title ?? (backendName !== "" ? backendName : "Kategori Lainnya");

              const href = backendKey
                ? `${basePath}/laporan/${slugByKey[backendKey]}`
                : `${basePath}/detail-laporan`;

              const resolvedId = backendKey ?? (backendName !== "" ? backendName : `unknown-${totalEmission}`);

              return {
                id: resolvedId as string,
                title: displayTitle,
                amount: totalEmission,
                href,
              };
            })
            .filter((r) => {
              const k = r.id as string;
              const isCatKey = (["transport","electricity","food","waste"] as string[]).includes(k);
              return !isCatKey || categories.some((c) => contextIdToKey[c.id] === (k as CatKey));
            });

          if (mounted) setReports(mapped);
        } else {
          if (mounted) setReports([]);
        }

        if (footprintResp) {
          const current = Math.round((Number(footprintResp.current_month_total_kgco2e ?? 0) * 10)) / 10;
          if (mounted) setTotalThisMonth(current);
        }
      } catch (error) {
        console.error("❌ Failed to fetch carbon data for Catat:", error);
        if (mounted) setReports([]);
      } finally {
        if (mounted) setIsLoading(false);
      }
    }

    fetchCarbonDataAndBreakdown();
    return () => {
      mounted = false;
    };
  }, [getBackendToken, categories, basePath]);

  return (
    <ScrollContainer
      headerTitle="Catat Emisi Karbon"
      headerSubTitle="Hitung jejak karbon bulanan Anda"
      showBottomLine={true}
    >
      <div className="mx-auto max-w-lg pb-[88px]">
        {/* PILIH KATEGORI → ke FORM */}
        <section className="mt-5">
          <h2 className="mb-2 text-base font-semibold">Pilih Kategori</h2>
          <div className="space-y-3">
            {categories.map((c) => (
              <CategoryItem
                key={c.id}
                iconSrc={c.iconSrc}
                title={` ${c.title}`}
                subtitle={c.subtitle}
                href={c.href(basePath)}
              />
            ))}
          </div>
        </section>

        {/* LAPORAN TERSIMPAN BULAN INI → ke LIST per-kategori */}
        <section className="mt-6">
          <div className="mb-2 flex items-center gap-2">
            <Image alt="" src="/images/catat/pencil-bolt.png" width={30} height={30} />
            <h3 className="text-base font-semibold">Laporan Tersimpan Bulan ini</h3>
          </div>

          {isLoading ? (
            <div className="p-4 text-center text-sm text-black/60">Memuat laporan...</div>
          ) : reports.length === 0 ? (
            <EmptySavedBox />
          ) : (
            <div className="mt-4 space-y-3">
              {reports.map((r) => (
                <ReportRow
                  key={r.id}
                  title={r.title}
                  amount={r.amount}
                  subtitle={`Total Emisi : ${r.amount} kg CO₂e`}
                  href={r.href}
                />
              ))}
            </div>
          )}
        </section>

        {/* HASIL PERHITUNGAN */}
        <section className="mt-8 text-center">
          <h3 className="mb-3 text-base font-semibold">Hasil Perhitungan</h3>
          <ResultCard value={totalThisMonth} />
        </section>

        <div className="mt-6">
          <Button
            size="lg"
            fullWidth
            onClick={() => router.push("/app/catat/riwayat")}
            className="!bg-[color:var(--color-primary)] hover:!bg-[color:var(--color-primary)]/90"
          >
            Lihat Riwayat Laporan Anda
          </Button>
        </div>
      </div>
    </ScrollContainer>
  );
}
