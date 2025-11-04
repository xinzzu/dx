import React from "react"
import Image from "next/image"
import type { MonthReport } from "./types"
import { SummaryStat } from "./SummaryStat"
import { CategoryItem } from "./CategoryItem"

export function ReportMonthCard({ report }: { report: MonthReport }) {
  return (
    <article className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
      {/* Header hijau */}
      <div className="flex items-center justify-between bg-emerald-500 px-4 py-3 text-white">
        <div className="flex items-center gap-3">
          <Image
            src="/icons/app/catat/riwayat/calender.svg"
            width={20}
            height={20}
            alt="Kalender"
            priority
          />
          <div className="leading-tight">
            <div className="text-[15px] font-semibold">{report.monthLabel}</div>
            <div className="text-[11px] opacity-90">{report.periodLabel ?? "Laporan Bulanan"}</div>
          </div>
        </div>
        <div className="flex items-center gap-2 text-[13px] font-semibold">
          <Image
            src="/icons/app/catat/riwayat/down.svg"
            width={16}
            height={16}
            alt="Progress"
          />
          {typeof report.progressPercent === "number" ? `${report.progressPercent}%` : null}
        </div>
      </div>

      {/* Body */}
      <div className="space-y-3 p-4">
        <div className="grid grid-cols-2 gap-3">
          <SummaryStat label="Total Emisi"   valueKg={report.totalEmisiKg} />
          <SummaryStat label="Pengurangan"   valueKg={report.penguranganKg} />
        </div>

        <div className="space-y-3 rounded-2xl border border-gray-200 p-3">
          {report.categories.map((c) => (
            <CategoryItem key={c.id} item={c} />
          ))}
        </div>
      </div>
    </article>
  )
}
