"use client";

import Image from "next/image";
import Link from "next/link";
import StatTile from "./StatTile";
import TrendBadge from "./TrendBadge";
import { OrgReport, formatMonthYear } from "./types";
import { formatCarbonFootprint } from "@/utils/carbonAnalysis";

export default function ReportCard({ r }: { r: OrgReport }) {
  const monthLabel = formatMonthYear(r.month, r.year);

  return (
    <section
      className="rounded-2xl overflow-hidden"
      style={{ border: "1px solid var(--color-primary)" }}
    >
      {/* Header hijau */}
      <div
        className="flex items-center justify-between px-4 py-3"
        style={{ backgroundColor: "var(--color-primary)" }}
      >
        <div className="flex items-center gap-3 text-white">
          <Image src="/icons/lembaga/calendar-white.svg" alt="" width={22} height={22} />
          <div>
            <div className="text-lg font-semibold">{monthLabel}</div>
            <div className="text-sm/5 opacity-90">Laporan Bulanan</div>
          </div>
        </div>
        <TrendBadge pct={r.trendPct} />
      </div>

      {/* Body tiles */}
      <div className="grid grid-cols-2 gap-3 p-4 bg-white">
        <StatTile
          label="Total Emisi"
          // value={`${(r.totalEmisi / 1000).toLocaleString("id-ID", { maximumFractionDigits: 3 })}`}
          // sub="kg CO₂e"
          value={`${formatCarbonFootprint(r.totalEmisi).value}`}
          sub={formatCarbonFootprint(r.totalEmisi).unit}
        />
        <StatTile
          label="Pengurangan"
          // value={`${r.pengurangan.toLocaleString("id-ID")}`}
          // sub="kg CO₂e"
          value={`${formatCarbonFootprint(r.pengurangan).value}`}
          sub={formatCarbonFootprint(r.pengurangan).unit}
        />
      </div>

      {/* Footer: Lihat Detail */}
      <div className="px-4 pb-4 bg-white text-center">
        <Link
          href={`/org/riwayat/${r.year}-${String(r.month).padStart(2, "0")}`}
          className="group inline-flex items-center gap-2 font-semibold text-[color:var(--color-primary)] "
        >
          Lihat Detail
          <Image
            src="/icons/chevron-right-primary.svg"
            alt=""
            width={6}
            height={6}
            className="transition-transform group-hover:translate-x-0.5"

          />
        </Link>
      </div>
    </section>
  );
}
