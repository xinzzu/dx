// src/app/(app)/analisis/page.tsx
"use client";

import { useMemo, useState, useEffect, useCallback } from "react";
import Image from "next/image";
import TrendChart from "@/components/shared/analisis/TrendChart";
import DonutChart from "@/components/shared/analisis/DonutChart";
import Button from "@/components/ui/Button";
import useAuth from "@/hooks/useAuth";

type Range = "month" | "year";

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

const categoryBreakdown = [
  { key: "Transportasi", value: 90, color: "#6C63FF" },
  { key: "Listrik", value: 36, color: "#FF8A80" },
  { key: "Limbah", value: 36, color: "#1BC5BD" },
];

export default function AnalisisPage() {
  const [range, setRange] = useState<Range>("month");
  const { getIdToken } = useAuth();

  // Carbon footprint data from backend
  const [totalThisMonth, setTotalThisMonth] = useState(0);
  const [previousMonth, setPreviousMonth] = useState(0);
  const [changePct, setChangePct] = useState(0);
  const [changeAbs, setChangeAbs] = useState(0);
  const [loadingCarbon, setLoadingCarbon] = useState(true);

  // Helper to get backend token
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

  // Fetch carbon footprint from backend
  useEffect(() => {
    async function fetchCarbonFootprint() {
      try {
        setLoadingCarbon(true);
        const token = await getBackendToken();
        if (!token) {
          console.warn("⚠️ No token available");
          setLoadingCarbon(false);
          return;
        }

        const { reportsService } = await import("@/services/reports");
        const data = await reportsService.getCurrentCarbonFootprint(token);
        
        console.log("📊 Carbon footprint data (Analisis):", data);
        
        // Format: ambil 4 digit dari depan (pembulatan ke 1 desimal)
        const current = Math.round(data.current_month_total_kgco2e * 10) / 10;
        const previous = Math.round(data.previous_month_total_kgco2e * 10) / 10;
        
        setTotalThisMonth(current);
        setPreviousMonth(previous);
        
        // Calculate change percentage and absolute
        if (data.comparison) {
          setChangePct(data.comparison.difference_percent || 0);
          setChangeAbs(Math.abs(Math.round(data.comparison.difference_kgco2e * 10) / 10));
        }
      } catch (error) {
        console.error("❌ Failed to fetch carbon footprint:", error);
      } finally {
        setLoadingCarbon(false);
      }
    }

    fetchCarbonFootprint();
  }, [getBackendToken]);

  // ganti dataset sesuai tab (dummy dulu)
  const series = useMemo(() => {
    if (range === "month") return monthSeries;
    // year
    return [
      { label: "2020", value: 1700 },
      { label: "2021", value: 1650 },
      { label: "2022", value: 1550 },
      { label: "2023", value: 1490 },
      { label: "2024", value: 1500 },
    ];
  }, [range]);

  const recordedDays = 20; // TODO: Get from backend

  return (
    <main className="mx-auto max-w-lg px-4 pt-4 pb-[88px]">
      {/* Header */}
      <header className="text-center">
        <h1 className="text-xl font-semibold">Analisis Jejak Karbon</h1>
        <p className="text-sm text-black/60">
          Analisis dampak aktivitas harian Anda
        </p>
      </header>
      {/* divider */}
        <div
          className="mt-4 h-[2px] w-full"
          style={{ backgroundColor: "var(--color-primary)" }}
        />


      {/* Tabs */}
      <div className="mt-4 grid grid-cols-2 gap-2">
        {[
          { key: "month", label: "Bulan" },
          { key: "year", label: "Tahun" },
        ].map((t) => {
          const active = range === (t.key as Range);
          return (
            <button
              key={t.key}
              onClick={() => setRange(t.key as Range)}
              className={[
                "h-10 rounded-xl border",
                active
                  ? "bg-[color:var(--color-secondary)] border-[color:var(--color-primary)] text-[color:var(--color-primary)]"
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
        <div className="mb-2 flex items-center gap-2">
          <Image
            src="/images/analisis/trend.png"
            alt=""
            width={24}
            height={24}
          />
          <h2 className="text-base font-semibold">Tren Jejak Karbon Anda</h2>
        </div>

        <div className="mt-4 rounded-2xl">
          <TrendChart data={series} />
          <p className="text-center text-xs" style={{ color: "#6C63FF" }}>
            kg CO₂e
          </p>
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
          <DonutChart data={categoryBreakdown} />
        </div>
      </section>

      {/* Ringkasan */}
      <section className="mt-6">
        <div className="mb-2 flex items-center gap-2">
          <Image
            src="/images/analisis/summary.png"
            alt=""
            width={24}
            height={24}
          />
          <h2 className="text-base font-semibold">Ringkasan Jejak Karbon</h2>
        </div>

        {/* Card 1 */}
        <article
          className="mt-4 rounded-2xl border p-3"
          style={{ borderColor: "var(--color-primary)" }}
        >
          <div className="text-sm ">Total Emisi Bulan Ini</div>
          <div className="mt-1 flex items-end justify-between">
            <div>
              <div className="text-5xl font-semibold text-[color:var(--color-primary)]">
                {totalThisMonth}
              </div>
              <div className="text-sm text-black/70">
                kg CO₂e
              </div>
            </div>
            <Button
              size="sm"
              onClick={() => console.log("Tombol bagikan diklik")}
            >
              <div className="flex items-center gap-2">
                <Image
                  src="/icons/tantangan/share.svg"
                  alt=""
                  width={12}
                  height={12}
                />
                <span>Bagikan</span>
              </div>
            </Button>
          </div>
        </article>

        {/* Card 2 */}
        <article
          className="mt-3 rounded-2xl border p-3"
          style={{ borderColor: "var(--color-primary)" }}
        >
          <div className="text-sm">Perubahan dari Bulan lalu</div>
          <div className="mt-1 flex items-end justify-between">
            <div>
              <div className="text-5xl font-semibold text-[color:var(--color-primary)]">
                {changePct > 0 ? "+" : ""}
                {changePct}%
              </div>
              <div className="text-sm text-black/70">
                {changePct < 0 ? "Berkurang" : "Bertambah"} {changeAbs} kg CO₂e
              </div>
            </div>
            <Button
              size="sm"
              onClick={() => console.log("Tombol bagikan diklik")}
            >
              <div className="flex items-center gap-2">
                <Image
                  src="/icons/tantangan/share.svg"
                  alt=""
                  width={16}
                  height={16}
                />
                <span>Bagikan</span>
              </div>
            </Button>
          </div>
        </article>
      </section>
    </main>
  );
}
