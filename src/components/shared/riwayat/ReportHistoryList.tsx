"use client";

import type { MonthReport } from "./types";
import ReportHistoryCard from "./ReportHistoryCard";

export function ReportHistoryList({ reports }: { reports: MonthReport[] }) {
  return (
    <div className="space-y-4">
      {reports.map((r) => (
        <ReportHistoryCard key={r.id} report={r} />
      ))}
    </div>
  );
}
