"use client";

import ReportCard from "./ReportCard";
import type { OrgReport } from "./types";

export default function HistoryList({ items }: { items: OrgReport[] }) {
  if (!items.length) {
    return (
      <div className="rounded-2xl border p-6 text-center text-black/60 bg-white" 
           style={{ borderColor: "var(--color-primary)" }}>
        Belum ada laporan.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {items.map((r) => (
        <ReportCard key={r.id} r={r} />
      ))}
    </div>
  );
}
