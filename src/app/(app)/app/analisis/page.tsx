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
import { getChangeIcon, getChangeTextColor, limitLeadingDigits } from "@/utils/carbonAnalysis";
import { Share2 } from "lucide-react";

const monthSeries = [
  { label: "Jan", value: 250.6 },
  { label: "Feb", value: 302.7 },
  { label: "Mar", value: 208.2 },
  { label: "Apr", value: 170.5 },
  { label: "Mei", value: 270.0 },
  { label: "Jun", value: 400.0 },
  { label: "Jul", value: 240.2 },
  { label: "Agu", value: 190.8 },
  { label: "Sep", value: 180.7 },
  { label: "Okt", value: 230.5 },
  { label: "Nov", value: 355.5 },
  { label: "Des", value: 230.5 },
];

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

// category breakdown will be built from CATEGORIES_BY_USER based on user type


export default function AnalisisPage() {
  // viewMode: 'weekly' shows 4 bars (Minggu 1..4) for a selected month
  // viewMode: 'monthly' shows 12 bars (Jan..Dec)
  const [viewMode, setViewMode] = useState<"weekly" | "monthly">("weekly");
  const [selectedMonthIndex, setSelectedMonthIndex] = useState<number>(new Date().getMonth());
  const [shareMessage, setShareMessage] = useState<string>('');
  const [userType, setUserType] = useState<"individu" | "lembaga">("individu");
  // default values (placeholder) - start at zeros so we don't show stale numbers
  const DEFAULT_VALUES = useMemo(() => [0, 0, 0], []);

  const [categoryBreakdownState, setCategoryBreakdownState] = useState(() => {
    const colors = ["#6C63FF", "#FF8A80", "#3CC3DF"];
    return CATEGORIES_BY_USER.individu.map((c, i) => ({
      key: c.title,
      value: DEFAULT_VALUES[i] ?? 0,
      color: colors[i % colors.length],
    }));
  });

  // optional series provided by backend (trend for the selected timeframe)
  const [backendMonthSeries, setBackendMonthSeries] = useState<Array<{ label: string; value: number }> | null>(null);

  // No backend integration in the "old" static version: use local monthSeries
  const series = useMemo(() => {
    if (viewMode === "monthly") {
      // Monthly view: show days 1..30 for the selected month.
      // Prefer backend-provided series when available (e.g. trend_chart from API)
      if (backendMonthSeries && backendMonthSeries.length > 0) return backendMonthSeries;

      // Fallback: generate 30-day labels for the selected month and default to zeros
      const monthShort = monthSeries[selectedMonthIndex]?.label ?? MONTHS_ID[selectedMonthIndex]?.slice(0,3) ?? ""
      const days = 30;
      const generated = Array.from({ length: days }).map((_, i) => ({
        label: `${i + 1} ${monthShort}`,
        value: 0,
      }));

      return generated;
    }

    // weekly view: show 4 weeks for the selected month using deterministic weights
    // when backend series is available, use its sum as the month's value
    const monthValue = backendMonthSeries && backendMonthSeries.length > 0
      ? backendMonthSeries.reduce((s, p) => s + p.value, 0)
      : monthSeries[selectedMonthIndex]?.value ?? 0;
    const weights = [0.9, 1.0, 1.05, 1.05];
    const sumW = weights.reduce((s, w) => s + w, 0);
    const values = weights.map((w) => Math.round(((monthValue * w) / sumW) * 100) / 100);
    return [
      { label: "Minggu 1", value: values[0] },
      { label: "Minggu 2", value: values[1] },
      { label: "Minggu 3", value: values[2] },
      { label: "Minggu 4", value: values[3] },
    ];
  }, [viewMode, selectedMonthIndex, backendMonthSeries]);

  // Simple local summary numbers for the static version
  // The UI will show the computed backend total when available, falling back to
  // the local category sum while loading or if the backend is unavailable.
  const [totalThisMonth, setTotalThisMonth] = useState<number>(() =>
    categoryBreakdownState.reduce((s, t) => s + t.value, 0)
  );
  const [changePct, setChangePct] = useState<number>(0);
  const [changeAbs, setChangeAbs] = useState<number>(0);
  const [changeStatus, setChangeStatus] = useState<'increase' | 'decrease' | 'same' | null>(null);
  const [loadingCarbon, setLoadingCarbon] = useState<boolean>(true);

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

  // Fetch dashboard breakdown and current-month carbon footprint, then map to UI state
  useEffect(() => {
    let mounted = true;
    async function fetchCurrentTotal() {
      try {
        setLoadingCarbon(true);
        const token = await getBackendToken();
        if (!token) {
          // keep fallback value
          setLoadingCarbon(false);
          return;
        }

        const { reportsService } = await import("@/services/reports");
        // Fetch current user profile to determine user type (individu/lembaga)
        const { userService } = await import("@/services/user");
        const profile = await userService.getMe(token).catch(() => null);
        if (profile && profile.user_type) {
          // update userType so category template maps correctly (this will re-run effect)
          setUserType(profile.user_type);
        }

        // fetch dashboard (contains breakdown_chart) and current footprint in parallel
        const [dashboardResp, footprintResp] = await Promise.all([
          reportsService.getDashboard(token, "month").catch(() => null),
          reportsService.getCurrentCarbonFootprint(token).catch(() => null),
        ]);

        // Map trend_chart -> backendMonthSeries (daily/series for the timeframe)
        if (dashboardResp?.trend_chart) {
          const trend = dashboardResp.trend_chart;
          const mapped = (trend.labels || []).map((l, i) => ({
            label: l,
            value: Math.round(((trend.data?.[i] ?? 0) * 10)) / 10,
          }));
          if (mounted) setBackendMonthSeries(mapped);
        }

        // Map breakdown_chart -> categoryBreakdownState aligned to CATEGORIES_BY_USER
        if (dashboardResp?.breakdown_chart) {
          const palette = ["#6C63FF", "#FF8A80", "#1BC5BD", "#FFD166", "#A78BFA"];

          // If we fetched the profile above, prefer it for mapping so that
          // Limbah -> sampah mapping works immediately for lembaga users.
          const effectiveUserType: "individu" | "lembaga" = (profile && profile.user_type) ? profile.user_type : userType;

          // build a template that keeps id + title so matching is deterministic
          const template: Array<{ id: string; key: string; value: number; color: string; percentage?: number }> = CATEGORIES_BY_USER[effectiveUserType].map((c, i) => ({
            id: c.id,
            key: c.title,
            value: 0,
            color: palette[i % palette.length],
          }));

          const backendCats = dashboardResp.breakdown_chart.categories || [];
          const filled: Array<{ id: string; key: string; value: number; color: string; percentage?: number }> = [...template];

          // helper: map some common backend category names to template ids
          const normalizeToId = (name: string) => {
            const n = (name || "").toLowerCase();
            if (n.includes("transport")) return "transport";
            if (n.includes("listrik") || n.includes("listrik")) return "listrik";
            if (n.includes("limbah") || n.includes("sampah")) {
              // for individu map to makanan (existing UI slot), for lembaga map to sampah
              return effectiveUserType === "lembaga" ? "sampah" : "makanan";
            }
            // fallback: try to match known titles
            if (n.includes("food")) return "makanan";
            return null;
          };

          backendCats.forEach((bc, i) => {
            const mappedId = normalizeToId(bc.name || "");
            const value = Math.round((bc.value_kg_co2e ?? 0) * 10) / 10;
            const pct = typeof bc.percentage === 'number' ? Math.round(bc.percentage) : undefined;

            if (mappedId) {
              const idx = filled.findIndex((t) => t.id === mappedId);
              if (idx >= 0) {
                filled[idx] = { ...filled[idx], value, percentage: pct };
                return;
              }
            }

            // unknown category -> append at the end
            filled.push({ id: `x-${i}`, key: bc.name, value, color: palette[(template.length + i) % palette.length], percentage: pct });
          });

          if (mounted) {
            // Determine the authoritative total to compute percentages
            const backendTotal = typeof dashboardResp.breakdown_chart.total_kg_co2e === 'number'
              ? Math.round((dashboardResp.breakdown_chart.total_kg_co2e ?? 0) * 10) / 10
              : null;

            const breakdownSum = filled.reduce((s, it) => s + (it.value || 0), 0);
            const totalForPct = backendTotal !== null ? backendTotal : breakdownSum;

            const withPct = filled.map((f) => {
              const pct = totalForPct && totalForPct > 0 ? Math.round((f.value / totalForPct) * 100) : 0;
              return { ...f, percentage: pct };
            });

            // Debug: log the computed breakdown (helpful to paste in console)
            // eslint-disable-next-line no-console
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
  }, [getBackendToken, userType, selectedMonthIndex]);

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
    const sign = changeStatus === 'increase' ? '+' : changeStatus === 'decrease' ? '-' : '';
    const statusText = changeStatus === 'decrease' ? 'menurun' : changeStatus === 'increase' ? 'meningkat' : 'tidak berubah';

    const shareText =
      `📊 Ringkasan Jejak Karbon Bulan Ini:\n\n` +
      `Total Emisi: ${formattedTotal} kg CO₂e\n` +
      `Dibanding Bulan Lalu: ${sign}${formattedChangePct}% (${statusText})\n\n` +
      `#JejakKarbon #Sustainability`;

    console.log(shareText);

    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareText).then(() => {
        setShareMessage('✅ Ringkasan berhasil disalin!');
        setTimeout(() => setShareMessage(''), 3000);
      }).catch(err => {
        setShareMessage('❌ Gagal menyalin. Silakan coba lagi.');
        console.error('Failed to copy text:', err);
      });
    } else {
      setShareMessage('❌ Browser tidak mendukung copy. Silakan salin manual.');
      setTimeout(() => setShareMessage(''), 3000);
    }
  }, [formattedTotal, formattedChangePct, changeStatus]);

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
            { key: "weekly", label: "Mingguan" },
            { key: "monthly", label: "Bulanan" },
          ].map((t) => {
            const active = viewMode === (t.key as "weekly" | "monthly");
            return (
              <button
                key={t.key}
                onClick={() => setViewMode(t.key as "weekly" | "monthly")}
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

            {/* month selector moved here (shows when in weekly mode) */}
            {/* {viewMode === "weekly" && (
            <div>
              <select
                value={selectedMonthIndex}
                onChange={(e) => setSelectedMonthIndex(Number(e.target.value))}
                className="h-10 rounded-lg border border-gray-300 bg-white px-4 text-sm text-gray-700 shadow-sm transition-all focus:border-blue-500 focus:ring-1 focus:ring-blue-500 appearance-none"
              >
                {MONTHS_ID.map((m, i) => (
                  <option key={m} value={i}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
          )} */}
          </div>

          <div className="mt-3">
            <TrendChart data={series} displayMode={viewMode === 'monthly' ? 'day' : 'default'} />
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
              <h2 className="text-base font-semibold">Ringkasan Jejak Karbon</h2>
            </div>
            <Button
              size="sm"
              onClick={handleShare}
              className="bg-[color:var(--color-primary)] hover:opacity-90 transition"
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
                  {loadingCarbon ? "Memuat..." : formattedTotal}
                </div>
                <div className="text-sm text-black/70 mt-1">
                  kg CO₂e
                </div>
              </div>
            </div>
          </article>

          <article
            className="mt-3 rounded-2xl border p-3 shadow-md bg-white"
            style={{ borderColor: "var(--color-primary)" }}
          >
            <div className="text-sm text-gray-600 flex items-center">
              {getChangeIcon(changeStatus)}
              Perubahan dari Bulan lalu
            </div>
            <div className="mt-1 flex items-end justify-between">
              <div>
                <div
                  className={`${totalTextSizeClass} font-bold leading-none transition-all duration-300 ` + getChangeTextColor(changeStatus)}
                >
                  {changeStatus === 'increase' ? '+' : ''}
                  {changeStatus === 'decrease' ? '-' : ''}
                  {formattedChangePct}%
                </div>
                <div className="text-sm text-black/70 mt-1">
                  {changeStatus === 'decrease' ? 'Berkurang' : changeStatus === 'increase' ? 'Bertambah' : 'Tidak Berubah'} {limitLeadingDigits(Math.abs(changeAbs), 7)} kg CO₂e
                </div>
              </div>
            </div>
          </article>
        </section>
      </div>
    </ScrollContainer>
  );
}
