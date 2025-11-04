import React from "react"
import type { MonthReport } from "./types"
import { ReportMonthCard } from "./ReportMonthCard"

export function ReportHistoryList({ reports }: { reports: MonthReport[] }) {
  return (
    <div className="space-y-4">
      {reports.map((r) => (
        <ReportMonthCard key={r.id} report={r} />
      ))}
    </div>
  )
}
