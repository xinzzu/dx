"use client";

import Image from "next/image";
import type { MonthReport } from "./types";
import { CategoryItem } from "./CategoryItem";
import { getChangeIcon, getChangeTextColor } from "@/utils/carbonAnalysis";

type Props = { report: MonthReport };

export default function ReportHistoryCard({ report }: Props) {
  const {
    monthLabel,
    periodLabel,
    progressPercent,
    totalEmisiKg,
    penguranganKg,
    categories,
  } = report;

  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-3 shadow-sm">
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-emerald-50 ring-1 ring-emerald-200/60">
          <Image src="/images/catat/riwayat/calendar.png" alt="" width={28} height={28} />
        </div>
        <div className="flex-1">
          <div className="text-base font-semibold leading-tight">{monthLabel}</div>
          <div className="text-sm text-black/60">{periodLabel}</div>
        </div>
        {/* Progress indicator: show up/down based on comparisonStatus using shared helpers */}
        <div
          className={`mt-0.5 flex items-center gap-1 rounded-xl px-2 py-1 ${
            report.comparisonStatus === "increase" ? "bg-red-50" : "bg-emerald-50"
          }`}
        >
          {/* icon */}
          {getChangeIcon(report.comparisonStatus as "increase" | "decrease" | "same" | null)}
          {/* percent text with color */}
          <span className={`text-sm font-semibold ${getChangeTextColor(report.comparisonStatus as "increase" | "decrease" | "same" | null)}`}>{progressPercent}%</span>
        </div>
      </div>

      {/* Tiles */}
      <div className="mt-3 grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-3">
          <div className="text-sm text-black/60">Total Emisi</div>
          <div className="mt-1 text-xl font-semibold text-emerald-600">
            {Intl.NumberFormat("id-ID", { maximumFractionDigits: 1 }).format(totalEmisiKg)}
            <span className="ml-1 text-sm font-normal text-black/60">kg CO₂e</span>
          </div>
        </div>
        <div className="rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-3">
          <div className="text-sm text-black/60">Pengurangan</div>
          <div className="mt-1 text-xl font-semibold text-emerald-600">
            {Intl.NumberFormat("id-ID", { maximumFractionDigits: 1 }).format(penguranganKg)}
            <span className="ml-1 text-sm font-normal text-black/60">kg CO₂e</span>
          </div>
        </div>
      </div>

      <div className="mt-3 space-y-2">
        {categories.map((item, index) => (
          <CategoryItem
            key={item.id}
            item={item}
            isLast={index === categories.length - 1}
          />
        ))}
      </div>
    </section>
  );
}

