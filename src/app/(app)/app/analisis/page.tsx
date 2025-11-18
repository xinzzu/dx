// src/app/(app)/analisis/page.tsx
"use client";

import { useMemo, useState, useEffect, useCallback } from "react";
import Image from "next/image";
import TrendChart from "@/components/shared/analisis/TrendChart";
import DonutChart from "@/components/shared/analisis/DonutChart";
import Button from "@/components/ui/Button";
import useAuth from "@/hooks/useAuth";
import CATEGORIES_BY_USER from "@/lib/catatConfig";
import ScrollContainer from "@/components/nav/ScrollContainer";
import { getChangeIcon, getChangeTextColor, limitLeadingDigits, formatCarbonFootprint } from '@/utils/carbonAnalysis';
import { Share2 } from "lucide-react";
import ShareModal from "@/components/ui/ShareModal";
import { authService } from "@/services/auth";
import { areaService, Regency } from "@/services/area";
import TrendMultiLineChart from "@/components/shared/analisis/TrendChart";

const MONTHS_ID = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

const serverRawDataDummy = {
  "datasets": [
    {
      "data": [
        33.67, 23.68, 53.91, 0.00, 40.67, 52.37, 65.78, 267.48, 470.97, 516.24, 512.72, 440.77
      ],
      "name": "listrik"
    },
    {
      "data": [
        0, 0, 0, 0, 0.002, 0, 0, 0.001, 0, 0.00001, 0.0667, 0
      ],
      "name": "limbah"
    },
    {
      "data": [
        0, 0, 0, 0, 0.70, 0.15, 0, 0.15, 0.15, 3.31, 9.20, 0.68
      ],
      "name": "makanan"
    },
    {
      "data": [
        0, 0, 0, 0, 0, 0, 0.90, 2.57, 6.86, 10.58, 34.12, 0.49
      ],
      "name": "transportasi"
    }
  ],
  "labels": [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
  ]
};

const weeklyDummyData = {
  "datasets": [
    {
      "data": [10, 15, 25, 30, 18],
      "name": "listrik"
    },
    {
      "data": [1, 2, 0.5, 3, 4],
      "name": "limbah"
    },
    {
      "data": [5, 4, 6, 3, 7],
      "name": "makanan"
    },
    {
      "data": [2, 3, 1, 4, 5],
      "name": "transportasi"
    }
  ],
  "labels": ["Minggu 1", "Minggu 2", "Minggu 3", "Minggu 4", "Minggu 5"]
};

type TrendPoint = { label: string; value: number }
type BreakdownCategory = { name: string; value_kg_co2e: number; percentage: number }
type DashboardResponse = {
  timeframe?: string
  trend_chart?: { labels?: string[]; data?: number[] }
  breakdown_chart?: { total_kg_co2e?: number; categories?: BreakdownCategory[] }
}


export default function AnalisisPage() {
  // viewMode sekarang: 'monthly' => tampil per-bulan (dibagi 4 minggu)
  //                  'yearly'  => tampil per-tahun (12 bulan)
  const [viewMode, setViewMode] = useState<"monthly" | "yearly">("monthly");
  const [selectedMonthIndex, _setSelectedMonthIndex] = useState<number>(new Date().getMonth());
  const [selectedYear, _setSelectedYear] = useState<number>(new Date().getFullYear());

  const [userName, setUserName] = useState("Pengguna");
  const [userLoc, setUserLoc] = useState("-");
  const [institutionName, setInstitutionName] = useState<string | undefined>(undefined);
  const [userType, setUserType] = useState<"individu" | "lembaga">("individu");
  const DEFAULT_VALUES = useMemo(() => [0, 0, 0], []);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  const [categoryBreakdownState, setCategoryBreakdownState] = useState(() => {
    const colors = ["#6C63FF", "#FF8A80", "#3CC3DF"];
    return CATEGORIES_BY_USER.individu.map((c, i) => ({
      key: c.title,
      value: DEFAULT_VALUES[i] ?? 0,
      color: colors[i % colors.length],
    }));
  });

  const [backendMonthSeries, setBackendMonthSeries] = useState<TrendPoint[] | []>([]);

  const series = useMemo(() => {
    const backendData = backendMonthSeries && backendMonthSeries.length > 0 ? backendMonthSeries : null;

    // YEARLY: backendData expected labels Jan..Des and values -> show 12 months
    if (viewMode === "yearly") {
      if (backendData) return backendData;
      // fallback: produce 12 months zeros
      return MONTHS_ID.map((m) => ({ label: m, value: 0 }));
    }

    // MONTHLY: show 4 weeks (same behavior as prior 'weekly' mode)
    const dailyData = backendData;
    if (dailyData) {
      // If backend supplies weekly labels (W1..W5) or daily series, we prefer
      // to use the provided series directly — TrendChart expects { label, value }.
      return dailyData as TrendPoint[];
    }

    // fallback synthetic month (kept similar to previous)
    const fallbackMonthValue = 200 * 30;
    const weights = [0.9, 1.0, 1.05, 1.05];
    const sumW = weights.reduce((s, w) => s + w, 0);
    const values = weights.map((w) => Math.round(((fallbackMonthValue * w) / sumW) * 100) / 100);
    return [
      { label: "Minggu 1", value: values[0] },
      { label: "Minggu 2", value: values[1] },
      { label: "Minggu 3", value: values[2] },
      { label: "Minggu 4", value: values[3] },
    ];
  }, [viewMode, selectedMonthIndex, backendMonthSeries]);

  const [totalThisMonth, setTotalThisMonth] = useState<number>(() =>
    categoryBreakdownState.reduce((s, t) => s + t.value, 0)
  );
  const [changePct, setChangePct] = useState<number>(0);
  const [changeAbs, setChangeAbs] = useState<number>(0);
  const [changeStatus, setChangeStatus] = useState<'increase' | 'decrease' | 'same' | null>(null);
  const [loadingCarbon, setLoadingCarbon] = useState<boolean>(true);
  const [previousMonthTotal, setPreviousMonthTotal] = useState<number>(0);

  const { getIdToken } = useAuth();

  // Helper to get backend token (same pattern used elsewhere)
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
    async function loadData() {
      try {
        const token = await getBackendToken();
        if (!token) return;

        const { userService } = await import("@/services/user");
        const userData = await userService.getMe(token);
        setUserName(userData?.individual_profile?.full_name || userData?.email || "Pengguna");
        // prefer institution_profile.name when user_type === 'lembaga'
        if (userData) {
          const isInst = userData.user_type === "lembaga";
          setUserType(isInst ? "lembaga" : "individu");
          if (isInst) {
            setInstitutionName(userData?.institution_profile?.name ?? undefined);
            setUserName(userData?.institution_profile?.name ?? userData?.email ?? "Pengguna");
          } else {
            setInstitutionName(undefined);
            setUserName(userData?.individual_profile?.full_name || userData?.email || "Pengguna");
          }
        }

        async function loadRegencies(provCode: string, userRegencyCode: string) {
          try {
            const token = authService.getToken();
            if (!token) return;

            const data = await areaService.getRegencies(provCode, token);
            const foundRegency = data.find(
              (regency: Regency) => regency.Code === userRegencyCode
            );

            if (foundRegency) {
              const cityName = foundRegency.Name;
              setUserLoc(cityName);
            } else {
              setUserLoc(userData?.city || "-");
            }

          } catch {
            setUserLoc("-");
          }
        }

        if (userData?.province && userData?.city) {
          const provinceId = userData?.province.replace('id', '');
          const regencyId = userData.city;

          loadRegencies(provinceId, regencyId);
        } else {
          setUserLoc(userData?.province || "-");
        }

      } catch (_error) {
        console.error("Failed to load home data:", _error);
        setUserLoc("-")
      }
    }

    loadData();
  }, [getBackendToken]);

  useEffect(() => {
    let mounted = true;
    async function fetchCurrentTotal() {
      try {
        setLoadingCarbon(true);
        const token = await getBackendToken();
        if (!token) {
          setLoadingCarbon(false);
          return;
        }

        const { reportsService } = await import("@/services/reports");
        const { userService } = await import("@/services/user");
        const profile = await userService.getMe(token).catch(() => null);
        if (profile && profile.user_type) {
          setUserType(profile.user_type);
        }

        // request dashboard depending on viewMode
        // For monthly view we ask backend for weekly breakdown of the selected month
        let timeframeArg = "month";
        if (viewMode === "yearly") timeframeArg = "year";
        if (viewMode === "monthly") timeframeArg = "week";

        // pass year and month (month is 1-based)
        const dashboardPromise: Promise<DashboardResponse | null> =
          reportsService.getDashboard(token, timeframeArg, selectedYear, selectedMonthIndex + 1).catch(() => null);

        const [dashboardResp, footprintResp] = await Promise.all([
          dashboardPromise,
          reportsService.getCurrentCarbonFootprint(token).catch(() => null),
        ]);

        if (dashboardResp?.trend_chart) {
          const trend = dashboardResp.trend_chart;
          const mapped = (trend.labels || []).map((l, i) => {
            // Jika backend mengembalikan labels seperti 'W1','W2' => ubah ke 'Minggu 1', dst.
            let label = l;
            if (typeof l === 'string' && /^W\d+/i.test(l)) {
              const n = l.replace(/[^0-9]/g, '');
              label = `Minggu ${n}`;
            }
            return {
              label,
              value: Math.round(((trend.data?.[i] ?? 0) * 10)) / 10,
            } as TrendPoint;
          });
          if (mounted) setBackendMonthSeries(mapped);
        }

        if (dashboardResp?.breakdown_chart) {
          const palette = ["#6C63FF", "#FF8A80", "#1BC5BD", "#FFD166", "#A78BFA"];

          const effectiveUserType: "individu" | "lembaga" = (profile && profile.user_type) ? profile.user_type : userType;

          const template: Array<{ id: string; key: string; value: number; color: string; percentage?: number }> = CATEGORIES_BY_USER[effectiveUserType].map((c, i) => ({
            id: c.id,
            key: c.title,
            value: 0,
            color: palette[i % palette.length],
          }));

          const backendCats = dashboardResp.breakdown_chart.categories || [];
          const filled: Array<{ id: string; key: string; value: number; color: string; percentage?: number }> = [...template];

          const normalizeToId = (name: string) => {
            const n = (name || "").toLowerCase();
            if (n.includes("transport")) return "transport";
            if (n.includes("listrik") || n.includes("listrik")) return "listrik";
            if (n.includes("limbah") || n.includes("sampah")) {
              return effectiveUserType === "lembaga" ? "sampah" : "makanan";
            }
            if (n.includes("food")) return "makanan";
            return null;
          };

          backendCats.forEach((bc, i) => {
            const mappedId = normalizeToId(bc.name || "");
            const value = Math.round((bc.value_kg_co2e ?? 0) * 10) / 10;
            // prefer backend percentage but keep 1 decimal when provided
            const pct = typeof bc.percentage === 'number' ? Math.round(bc.percentage * 10) / 10 : undefined;

            if (mappedId) {
              const idx = filled.findIndex((t) => t.id === mappedId);
              if (idx >= 0) {
                filled[idx] = { ...filled[idx], value, percentage: pct };
                return;
              }
            }

            filled.push({ id: `x-${i}`, key: bc.name, value, color: palette[(template.length + i) % palette.length], percentage: pct });
          });

          if (mounted) {
            const backendTotal = typeof dashboardResp.breakdown_chart.total_kg_co2e === 'number'
              ? Math.round((dashboardResp.breakdown_chart.total_kg_co2e ?? 0) * 10) / 10
              : null;

            const breakdownSum = filled.reduce((s, it) => s + (it.value || 0), 0);
            const totalForPct = backendTotal !== null ? backendTotal : breakdownSum;

            const withPct = filled.map((f) => {
              // compute percentage with one decimal precision
              const pct = totalForPct && totalForPct > 0 ? Math.round((f.value / totalForPct) * 1000) / 10 : 0;
              return { ...f, percentage: pct };
            });

            console.log('[ANALISIS DEBUG] dashboard breakdown processed', {
              effectiveUserType,
              totalForPct,
              slices: withPct,
              raw: dashboardResp.breakdown_chart,
            });

            setCategoryBreakdownState(
              withPct.map((f) => ({ key: f.key, value: f.value, color: f.color, percentage: f.percentage }))
            );

            // If backend provides a total for the breakdown, prefer it as the
            // authoritative "total this month" value (fallback when footprint
            // endpoint is not available).
            if (backendTotal !== null) {
              setTotalThisMonth(backendTotal);
            }
          }
        }
        // Use the footprint response to update the summary totals and comparison if available
        if (mounted && footprintResp) {
          try {
            const current = Number(footprintResp.current_month_total_kgco2e ?? 0);
            const previous = Number(footprintResp.previous_month_total_kgco2e ?? 0);

            // store previous month total for UI
            setPreviousMonthTotal(Number.isFinite(previous) ? previous : 0);

            // formatted to 1 decimal like other pages in the app
            const formatted = Math.round(current * 10) / 10;
            setTotalThisMonth(formatted);

            const diffAbs = (footprintResp.comparison?.difference_kgco2e ?? (current - previous));
            const diffPct = (typeof footprintResp.comparison?.difference_percent === 'number')
              ? footprintResp.comparison!.difference_percent!
              : (previous !== 0 ? ((current - previous) / previous) * 100 : 0);
            const status: 'increase' | 'decrease' | 'same' = footprintResp.comparison?.status ?? (diffAbs > 0 ? 'increase' : diffAbs < 0 ? 'decrease' : 'same');

            setChangeAbs(Math.round(diffAbs * 10) / 10);
            setChangePct(Math.round(diffPct * 10) / 10);
            setChangeStatus(status);
          } catch (e) {
            // swallow errors and keep fallback values
            console.warn('Failed to map footprint response to UI:', e);
          }
        }
      } catch (err) {
        console.warn("Failed to fetch carbon data:", err);
      } finally {
        if (mounted) setLoadingCarbon(false);
      }
    }

    fetchCurrentTotal();
    return () => {
      mounted = false;
    };
  }, [getBackendToken, userType, viewMode, selectedMonthIndex, selectedYear]);

  const formattedTotal = useMemo(() => {
    return limitLeadingDigits(totalThisMonth, 7);
  }, [totalThisMonth]);

  const totalTextSizeClass = useMemo(() => {
    if (loadingCarbon) return "text-4xl";
    const length = formattedTotal.replace(/[^0-9]/g, "").length;
    if (length <= 5) return "text-5xl";
    if (length <= 7) return "text-4xl";
    return "text-3xl";
  }, [formattedTotal, loadingCarbon]);

  const formattedChangePct = useMemo(() => {
    return limitLeadingDigits(Math.abs(changePct), 7);
  }, [changePct]);

  const handleShare = useCallback(() => {
    setIsShareModalOpen(true);
  }, []);

  return (
    <ScrollContainer
      headerTitle="Analisis Jejak Karbon"
      headerSubTitle={`Analisis dampak aktivitas harian Anda — ${userType === "lembaga" ? "Lembaga" : "Individu"}`}
      showBottomLine={true}
    >
      <div className="mx-auto max-w-lg pb-[88px]">
        {/* Tabs */}
        <div className="grid grid-cols-2 gap-2">
          {[
            { key: "monthly", label: "Bulanan" },
            { key: "yearly", label: "Tahunan" },
          ].map((t) => {
            const active = viewMode === (t.key as "monthly" | "yearly");
            return (
              <button
                key={t.key}
                onClick={() => setViewMode(t.key as "monthly" | "yearly")}
                className={[
                  "h-10 rounded-xl border",
                  active
                    ? "bg-(--color-secondary) border-(--color-primary) text-(--color-primary)"
                    : "border-black/15",
                ].join(" ")}
              >
                {t.label}
              </button>
            );
          })}
        </div>

        {/* selectors moved into the Tren section below to be colocated with the chart */}

        {/* Tren */}
        <section className="mt-5">
          <div className="mb-2 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Image
                src="/images/analisis/trend.png"
                alt=""
                width={24}
                height={24}
              />
              <h2 className="text-base font-semibold">Tren Jejak Karbon Anda</h2>
            </div>

            <div className="flex items-center gap-2 flex-nowrap">
              {viewMode === "monthly" && (
                <select
                  value={selectedMonthIndex}
                  onChange={(e) => _setSelectedMonthIndex(Number(e.target.value))}
                  className="h-10 rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-700 shadow-sm"
                >
                  {MONTHS_ID.map((m, i) => (
                    <option key={m} value={i}>
                      {m}
                    </option>
                  ))}
                </select>
              )}

              {viewMode === "yearly" && (
                <select
                  value={selectedYear}
                  onChange={(e) => _setSelectedYear(Number(e.target.value))}
                  className="h-10 rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-700 shadow-sm"
                >
                  {Array.from({ length: 6 }).map((_, idx) => {
                    const year = new Date().getFullYear() - idx;
                    return (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    );
                  })}
                </select>
              )}
            </div>
          </div>

          <div className="mt-3">
            {/* <TrendChart
              data={series}
              displayMode={viewMode === 'monthly' ? 'weekly' : 'monthly'}
              legendLabel={viewMode === 'monthly' ? 'Minggu' : 'Bulan'}
              legendColor="#8B7CFF"
            /> */}

            <TrendMultiLineChart
              serverData={viewMode === 'monthly'
                ? weeklyDummyData
                : serverRawDataDummy}
              displayMode={viewMode === 'monthly' ? 'weekly' : 'monthly'}
            />
            {/* Debug: inspect series if needed
            <details className="mt-2 text-xs text-black/60">
              <summary>Debug: lihat series</summary>
              <pre className="max-h-40 overflow-auto">{JSON.stringify(series, null, 2)}</pre>
            </details>
          */}
          </div>

        </section>

        {/* Donut */}
        <section className="mt-6">
          <div className="mb-2 flex items-center gap-2">
            <Image src="/images/analisis/pie.png" alt="" width={24} height={24} />
            <h2 className="text-base font-semibold">
              Analisis Berdasarkan Kategori
            </h2>
          </div>

          <div className="mt-4 rounded-2xl ">
            {categoryBreakdownState && (
              <DonutChart data={categoryBreakdownState} total={totalThisMonth} />
            )}
          </div>
        </section>

        {/* Ringkasan */}
        <section className="mt-6">
          <div className="mb-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Image
                src="/images/analisis/summary.png"
                alt=""
                width={24}
                height={24}
              />
              <h2 className="text-base font-semibold">Ringkasan Jejak Karbon Bulan Ini</h2>
            </div>
            <Button
              size="xs"
              onClick={handleShare}
              className="bg-(--color-primary) hover:opacity-90 transition"
            >
              <div className="flex items-center gap-1">
                <Share2 className="w-4 h-4" />
                <span>Bagikan</span>
              </div>
            </Button>
          </div>

          <article
            className="mt-4 rounded-2xl border p-3 shadow-md bg-white"
            style={{ borderColor: "var(--color-primary)" }}
          >
            <div className="text-sm text-gray-600">Total Emisi Bulan Ini</div>
            <div className="mt-1 flex items-end justify-between">
              <div>
                <div
                  className={`${totalTextSizeClass} font-bold leading-none transition-all duration-300`}
                  style={{ color: "var(--color-primary)" }}
                >
                  {loadingCarbon ? "Memuat..." : formatCarbonFootprint(totalThisMonth).value}
                </div>
                <div className="text-sm text-black/70 mt-1">
                  {loadingCarbon ? "" : formatCarbonFootprint(totalThisMonth).unit}
                </div>
              </div>
            </div>
          </article>

          <article
            className="mt-3 rounded-2xl border p-4 shadow-md bg-white"
            style={{ borderColor: "var(--color-primary)" }}
          >
            <div className="text-sm font-semibold text-gray-700 flex items-center mb-2">
              {getChangeIcon(changeStatus)}
              <span className="ml-1">Progres Emisi vs. Bulan Lalu</span>
            </div>

            <div className="flex flex-col gap-1">
              <div className="flex flex-col">
                <div className="text-xs text-gray-500">Perubahan Bersih</div>

                <div
                  className={`${totalTextSizeClass} font-extrabold leading-tight transition-all duration-300 ` + getChangeTextColor(changeStatus)}
                >
                  {changeStatus === 'increase' ? '+' : ''}
                  {changeStatus === 'decrease' ? '-' : ''}
                  {formattedChangePct}%
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 border-t pt-2 border-gray-100">
                <div className="flex flex-col items-start">
                  <div className="text-[9px] text-gray-500 mb-0.5">Total Perubahan</div>
                  <div className="text-[9px] text-black/70 font-medium">
                    <span className={getChangeTextColor(changeStatus) + ' font-bold'}>
                      {changeStatus === 'decrease' ? 'BERKURANG' : changeStatus === 'increase' ? 'BERTAMBAH' : 'STABIL'}
                    </span>
                    <span className="ml-1">
                      {/* {limitLeadingDigits(Math.abs(changeAbs), 7)} */}
                      {formatCarbonFootprint(changeAbs).value}
                    </span>
                    <span className="text-[9px] text-gray-500 ml-0.5">{formatCarbonFootprint(changeAbs).unit}</span>
                  </div>
                </div>

                <div className="flex flex-col items-end text-right">
                  <div className="text-[9px] text-gray-500 mb-0.5">Emisi Bulan Lalu</div>
                  <p className="text-[9px] text-black font-semibold">
                    {previousMonthTotal !== null
                      ? formatCarbonFootprint(previousMonthTotal).value
                      : "Belum ada data"}

                    <span className="text-[9px] text-gray-500 ml-0.5">{formatCarbonFootprint(previousMonthTotal).unit}</span>
                  </p>
                </div>
              </div>
            </div>
          </article>
        </section>
      </div>

      {isShareModalOpen && (
        <ShareModal
          isOpen={isShareModalOpen}
          onClose={() => setIsShareModalOpen(false)}
          userName={userName}
          isInstitution={userType === "lembaga"}
          institutionName={institutionName}
          institutionType={userType === "lembaga" ? "Lembaga" : undefined}
          userLoc={userLoc}
          formattedTotal={formattedTotal}
          changeAbs={changeAbs}
          formattedChangePct={formattedChangePct}
          previousMonthTotal={previousMonthTotal}
          changeStatus={changeStatus}
        />
      )}
    </ScrollContainer>
  );
}